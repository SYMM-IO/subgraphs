import importlib.util
import os
import plistlib
import tempfile
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "create_fleet_mac_app.py"
SPEC = importlib.util.spec_from_file_location("create_fleet_mac_app", SCRIPT_PATH)
fleet_app = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(fleet_app)


class CreateFleetMacAppTests(unittest.TestCase):
    def test_create_app_bundle_writes_launcher_and_metadata(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            repo_root = tmp_path / "repo"
            repo_root.mkdir()
            app_path = tmp_path / "SYMMIO Fleet.app"

            fleet_app.create_app_bundle(app_path, "SYMMIO Fleet", repo_root, "127.0.0.1", 9898, compile_executable=False)

            plist_path = app_path / "Contents" / "Info.plist"
            launcher_path = app_path / "Contents" / "MacOS" / "symmio-fleet"
            resources = app_path / "Contents" / "Resources"
            shell_launcher_path = resources / "launcher.sh"

            with plist_path.open("rb") as handle:
                info = plistlib.load(handle)

            self.assertEqual(info["CFBundleDisplayName"], "SYMMIO Fleet")
            self.assertEqual(info["CFBundleExecutable"], "symmio-fleet")

            # The repo ships a generated icon, so the bundle should embed it.
            if fleet_app.ICON_SOURCE.exists():
                self.assertEqual(info["CFBundleIconFile"], "AppIcon")
                self.assertTrue((resources / "AppIcon.icns").exists())
            self.assertEqual((app_path / "Contents" / "PkgInfo").read_text(encoding="utf-8"), "APPL????")
            self.assertEqual((resources / "repo-root.txt").read_text(encoding="utf-8").strip(), str(repo_root.resolve()))
            self.assertEqual((resources / "host.txt").read_text(encoding="utf-8").strip(), "127.0.0.1")
            self.assertEqual((resources / "port.txt").read_text(encoding="utf-8").strip(), "9898")
            self.assertTrue(os.access(launcher_path, os.X_OK))
            self.assertTrue(os.access(shell_launcher_path, os.X_OK))
            launcher = shell_launcher_path.read_text(encoding="utf-8")
            self.assertIn('"${uv_bin}" run --extra app scripts/fleet_app.py', launcher)
            self.assertIn('UV_CACHE_DIR="${LOG_DIR}/uv-cache"', launcher)
            self.assertIn('--host "${HOST}"', launcher)
            self.assertIn('--port "${PORT}"', launcher)

    def test_existing_bundle_requires_force(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            repo_root = tmp_path / "repo"
            repo_root.mkdir()
            app_path = tmp_path / "SYMMIO Fleet.app"

            fleet_app.create_app_bundle(app_path, "SYMMIO Fleet", repo_root, "127.0.0.1", 8787, compile_executable=False)

            with self.assertRaises(FileExistsError):
                fleet_app.create_app_bundle(app_path, "SYMMIO Fleet", repo_root, "127.0.0.1", 8787, compile_executable=False)

            fleet_app.create_app_bundle(app_path, "SYMMIO Fleet", repo_root, "127.0.0.1", 8787, force=True, compile_executable=False)
            self.assertTrue((app_path / "Contents" / "Info.plist").exists())


if __name__ == "__main__":
    unittest.main()
