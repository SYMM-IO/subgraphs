#!/usr/bin/env python3
"""Create a local macOS app bundle for the SYMMIO Fleet UI."""

from __future__ import annotations

import argparse
import plistlib
import shutil
import stat
import subprocess
import sys
import textwrap
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_APP_NAME = "SYMMIO Fleet"
DEFAULT_OUTPUT = REPO_ROOT / f"{DEFAULT_APP_NAME}.app"
ICON_SOURCE = REPO_ROOT / "assets" / "fleet-app" / "AppIcon.icns"
ICON_GENERATOR = REPO_ROOT / "scripts" / "generate_fleet_icon.py"


SHELL_LAUNCHER_TEMPLATE = """#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd -P)"
RESOURCES_DIR="${APP_DIR}/Contents/Resources"
REPO_ROOT="$(cat "${RESOURCES_DIR}/repo-root.txt")"
HOST="$(cat "${RESOURCES_DIR}/host.txt")"
PORT="$(cat "${RESOURCES_DIR}/port.txt")"
URL="http://${HOST}:${PORT}/"
LOG_DIR="${REPO_ROOT}/.fleet-app"
LOG_FILE="${LOG_DIR}/fleet-web.log"
UV_CACHE_DIR="${LOG_DIR}/uv-cache"

mkdir -p "${LOG_DIR}"
export UV_CACHE_DIR

load_login_shell_path() {
\tlocal shell_path="${SHELL:-/bin/zsh}"
\tlocal path_marker="__SYMMIO_FLEET_PATH_$$__"
\tlocal timeout_seconds="${FLEET_LOGIN_SHELL_TIMEOUT_SECONDS:-3}"
\tlocal login_output=""
\tlocal login_output_file=""
\tlocal login_path=""
\tlocal line=""
\tlocal shell_pid=""
\tlocal started_at=0
\tlocal completed=1

\tcase "${timeout_seconds}" in
\t\t""|*[!0-9]*|0) timeout_seconds=3 ;;
\tesac

\tif [[ -x "${shell_path}" ]]; then
\t\tlogin_output_file="$(mktemp "${TMPDIR:-/tmp}/symmio-fleet-path.XXXXXX")"
\t\tFLEET_PATH_MARKER="${path_marker}" "${shell_path}" -lc 'printf "\\n%s%s\\n" "$FLEET_PATH_MARKER" "$PATH"' >"${login_output_file}" 2>/dev/null &
\t\tshell_pid=$!
\t\tstarted_at=${SECONDS}
\t\twhile kill -0 "${shell_pid}" 2>/dev/null; do
\t\t\tif (( SECONDS - started_at >= timeout_seconds )); then
\t\t\t\tcompleted=0
\t\t\t\tkill "${shell_pid}" 2>/dev/null || true
\t\t\t\tsleep 0.1
\t\t\t\tkill -KILL "${shell_pid}" 2>/dev/null || true
\t\t\t\tbreak
\t\t\tfi
\t\t\tsleep 0.05
\t\tdone
\t\twait "${shell_pid}" 2>/dev/null || true
\t\tif (( completed == 1 )); then
\t\t\tlogin_output="$(<"${login_output_file}")"
\t\tfi
\t\trm -f "${login_output_file}"
\tfi

\twhile IFS= read -r line; do
\t\tif [[ "${line}" == "${path_marker}"* ]]; then
\t\t\tlogin_path="${line#"${path_marker}"}"
\t\t\tbreak
\t\tfi
\tdone <<<"${login_output}"

\tif [[ -n "${login_path}" ]]; then
\t\tPATH="${login_path}:${PATH}"
\tfi
}

PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:${HOME}/.local/bin:${HOME}/.cargo/bin:${HOME}/.foundry/bin:${PATH}"
load_login_shell_path
export PATH

show_error() {
\tlocal message="$1"
\t/usr/bin/osascript \\
\t\t-e 'on run argv' \\
\t\t-e 'display dialog (item 1 of argv) buttons {"OK"} default button "OK" with title "SYMMIO Fleet"' \\
\t\t-e 'end run' \\
\t\t"${message}" >/dev/null 2>&1 || true
}

find_uv() {
\tlocal candidate
\tfor candidate in "${UV:-}" "${HOME}/.local/bin/uv" "/opt/homebrew/bin/uv" "/usr/local/bin/uv"; do
\t\tif [[ -n "${candidate}" && -x "${candidate}" ]]; then
\t\t\tprintf '%s\\n' "${candidate}"
\t\t\treturn 0
\t\tfi
\tdone

\tif command -v uv >/dev/null 2>&1; then
\t\tcommand -v uv
\t\treturn 0
\tfi

\treturn 1
}

uv_bin="$(find_uv || true)"
if [[ -z "${uv_bin}" ]]; then
\tshow_error "Could not find uv. Install uv or set UV to its full path, then reopen SYMMIO Fleet."
\texit 1
fi

{
\tprintf '\\n[%s] starting SYMMIO Fleet\\n' "$(date '+%Y-%m-%d %H:%M:%S')"
\tprintf 'PATH=%s\\n' "${PATH}"
\tprintf 'uv=%s\\n' "${uv_bin}"
\tprintf 'goldsky=%s\\n' "$(command -v goldsky || printf 'not found')"
} >>"${LOG_FILE}"

# The windowed app starts the server, opens a native window, and blocks until
# the window is closed. Foreground, so this .app stays the running process.
cd "${REPO_ROOT}"
if ! "${uv_bin}" run --extra app scripts/fleet_app.py --host "${HOST}" --port "${PORT}" >>"${LOG_FILE}" 2>&1; then
\tlast_lines="$(tail -n 20 "${LOG_FILE}" 2>/dev/null || true)"
\tshow_error "SYMMIO Fleet failed to start at ${URL}. Last log lines:\\n${last_lines}"
\texit 1
fi
"""

C_LAUNCHER_TEMPLATE = r"""#include <limits.h>
#include <mach-o/dyld.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

int main(void) {
    char executable_path[PATH_MAX];
    uint32_t size = sizeof(executable_path);
    if (_NSGetExecutablePath(executable_path, &size) != 0) {
        return 1;
    }

    char resolved_path[PATH_MAX];
    if (realpath(executable_path, resolved_path) == NULL) {
        return 1;
    }

    char *macos_dir = strrchr(resolved_path, '/');
    if (macos_dir == NULL) {
        return 1;
    }
    *macos_dir = '\0';

    char script_path[PATH_MAX];
    int written = snprintf(script_path, sizeof(script_path), "%s/../Resources/launcher.sh", resolved_path);
    if (written < 0 || written >= (int)sizeof(script_path)) {
        return 1;
    }

    execl("/bin/bash", "bash", script_path, (char *)NULL);
    perror("execl");
    return 1;
}
"""


def write_text(path: Path, value: str) -> None:
    path.write_text(value, encoding="utf-8")


def compile_launcher(macos_dir: Path, executable_name: str) -> None:
    clang = shutil.which("clang") or "/usr/bin/clang"
    if not Path(clang).exists():
        raise RuntimeError("clang is required to build the macOS app launcher")

    source = macos_dir / f"{executable_name}.c"
    executable = macos_dir / executable_name
    write_text(source, C_LAUNCHER_TEMPLATE)
    try:
        proc = subprocess.run(
            [clang, "-Os", "-Wall", "-Wextra", str(source), "-o", str(executable)],
            capture_output=True,
            text=True,
        )
    finally:
        source.unlink(missing_ok=True)
    if proc.returncode != 0:
        raise RuntimeError((proc.stderr or proc.stdout or "clang failed").strip())

    executable.chmod(executable.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def write_fallback_launcher(macos_dir: Path, executable_name: str) -> None:
    executable = macos_dir / executable_name
    write_text(executable, "#!/bin/sh\nexec /bin/bash \"$(dirname \"$0\")/../Resources/launcher.sh\"\n")
    executable.chmod(executable.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def ensure_icon() -> Path | None:
    """Return the app icon, generating it with Pillow if it's missing."""
    if ICON_SOURCE.exists():
        return ICON_SOURCE
    if not ICON_GENERATOR.exists():
        return None

    uv = shutil.which("uv")
    cmd = [uv, "run", "--with", "pillow", str(ICON_GENERATOR)] if uv else [sys.executable, str(ICON_GENERATOR)]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        return None
    return ICON_SOURCE if ICON_SOURCE.exists() else None


def ad_hoc_sign(app_path: Path) -> None:
    codesign = shutil.which("codesign") or "/usr/bin/codesign"
    if not Path(codesign).exists():
        return

    subprocess.run(
        [codesign, "--force", "--deep", "--sign", "-", str(app_path)],
        capture_output=True,
        text=True,
    )


def create_app_bundle(
    output: Path,
    name: str,
    repo_root: Path,
    host: str,
    port: int,
    force: bool = False,
    compile_executable: bool = True,
) -> Path:
    output = output.expanduser().resolve()
    repo_root = repo_root.expanduser().resolve()

    if output.exists():
        if not force:
            raise FileExistsError(f"{output} already exists; pass --force to replace it")
        if output.suffix != ".app":
            raise ValueError(f"refusing to replace non-.app path: {output}")
        shutil.rmtree(output)

    contents = output / "Contents"
    macos = contents / "MacOS"
    resources = contents / "Resources"
    macos.mkdir(parents=True)
    resources.mkdir(parents=True)

    executable_name = "symmio-fleet"

    icon_source = ensure_icon()
    icon_name = "AppIcon"
    if icon_source is not None:
        shutil.copy2(icon_source, resources / f"{icon_name}.icns")

    info_plist = {
        "CFBundleDisplayName": name,
        "CFBundleExecutable": executable_name,
        "CFBundleIdentifier": "io.symmio.fleet",
        "CFBundleName": name,
        "CFBundlePackageType": "APPL",
        "CFBundleShortVersionString": "1.0.0",
        "CFBundleVersion": "1",
        "LSMinimumSystemVersion": "12.0",
        "NSHighResolutionCapable": True,
    }
    if icon_source is not None:
        info_plist["CFBundleIconFile"] = icon_name
        info_plist["CFBundleIconName"] = icon_name
    with (contents / "Info.plist").open("wb") as handle:
        plistlib.dump(info_plist, handle, sort_keys=True)
    write_text(contents / "PkgInfo", "APPL????")

    write_text(resources / "repo-root.txt", f"{repo_root}\n")
    write_text(resources / "host.txt", f"{host}\n")
    write_text(resources / "port.txt", f"{port}\n")
    write_text(
        resources / "README.txt",
        textwrap.dedent(
            f"""\
            {name}

            This app starts the SYMMIO Fleet UI from:
            {repo_root}

            It opens in a native desktop window (pywebview). Closing the window
            stops the local server. If the window backend is unavailable it falls
            back to a Chrome app window, then the default browser.

            Server output is logged to:
            {repo_root / ".fleet-app" / "fleet-web.log"}
            """
        ),
    )

    shell_launcher = resources / "launcher.sh"
    write_text(shell_launcher, SHELL_LAUNCHER_TEMPLATE)
    shell_launcher.chmod(shell_launcher.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    if compile_executable:
        compile_launcher(macos, executable_name)
        ad_hoc_sign(output)
    else:
        write_fallback_launcher(macos, executable_name)

    return output


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create a macOS app bundle for the SYMMIO Fleet UI")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help=f"app bundle path (default: {DEFAULT_OUTPUT})")
    parser.add_argument("--name", default=DEFAULT_APP_NAME, help=f"app display name (default: {DEFAULT_APP_NAME})")
    parser.add_argument("--host", default="127.0.0.1", help="Fleet UI bind host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8787, help="Fleet UI port (default: 8787)")
    parser.add_argument("--force", action="store_true", help="replace an existing .app bundle")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    app_path = create_app_bundle(args.output, args.name, REPO_ROOT, args.host, args.port, args.force)
    print(f"Created {app_path}")


if __name__ == "__main__":
    main()
