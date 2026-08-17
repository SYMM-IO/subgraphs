#!/usr/bin/env python3
"""Generate the SYMMIO Fleet macOS app icon (.icns) and a 1024px master PNG.

The artwork matches the Fleet UI palette: a dark teal squircle with a mint
"fleet network" emblem — a central hub wired to satellite nodes, one of them a
coral accent. Rendered at 2x supersample for crisp edges, then assembled into a
macOS .iconset and packed with `iconutil`.

Run it with Pillow available, e.g.:
    uv run --with pillow scripts/generate_fleet_icon.py
"""

from __future__ import annotations

import argparse
import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTDIR = REPO_ROOT / "assets" / "fleet-app"

# Fleet UI palette
BG_TOP = (18, 42, 37)        # #122a25
BG_BOTTOM = (6, 10, 14)      # #060a0e
HUB = (49, 199, 170)         # #31c7aa
SAT_A = (125, 219, 199)      # #7ddbc7
SAT_B = (154, 230, 211)      # #9ae6d3
CORAL = (255, 154, 147)      # #ff9a93
SPOKE = (36, 157, 136)       # #249d88
RING = (110, 200, 180)

# macOS iconset sizes (point size -> 1x and 2x pixel renders)
ICONSET_SIZES = [16, 32, 128, 256, 512]


def _vertical_gradient(size: int, top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    grad = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / max(size - 1, 1)
        grad.putpixel(
            (0, y),
            (
                round(top[0] + (bottom[0] - top[0]) * t),
                round(top[1] + (bottom[1] - top[1]) * t),
                round(top[2] + (bottom[2] - top[2]) * t),
            ),
        )
    return grad.resize((size, size))


def _glow(size: int, center: tuple[float, float], radius: float, color: tuple[int, int, int], alpha: int) -> Image.Image:
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(*color, alpha))
    return layer.filter(ImageFilter.GaussianBlur(radius * 0.45))


def render_master(px: int = 1024, supersample: int = 2) -> Image.Image:
    S = px * supersample
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    # Rounded-rect "squircle" mask sized to the macOS icon grid (~80% of canvas).
    margin = round(S * 0.098)
    box = [margin, margin, S - margin, S - margin]
    radius = round((box[2] - box[0]) * 0.225)
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle(box, radius=radius, fill=255)

    # Background gradient, clipped to the squircle.
    bg = _vertical_gradient(S, BG_TOP, BG_BOTTOM).convert("RGBA")
    img.paste(bg, (0, 0), mask)

    # Soft mint glow rising from the centre for depth.
    cx = cy = S / 2
    img.alpha_composite(Image.composite(_glow(S, (cx, cy * 0.86), S * 0.34, HUB, 70), Image.new("RGBA", (S, S)), mask))

    overlay = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Faint orbital ring behind the network.
    ring_r = S * 0.255
    draw.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r], outline=(*RING, 38), width=max(2, S // 360))

    # Satellite layout: hexagon around the hub, coral accent at the top.
    sat_r = S * 0.215
    nodes = []
    for i in range(6):
        ang = -math.pi / 2 + i * (math.pi / 3)
        nodes.append((cx + sat_r * math.cos(ang), cy + sat_r * math.sin(ang)))

    # Spokes hub -> satellites.
    spoke_w = max(3, round(S * 0.011))
    for nx, ny in nodes:
        draw.line([cx, cy, nx, ny], fill=(*SPOKE, 150), width=spoke_w)

    def node(center, r, color, glow_alpha=120):
        gx, gy = center
        overlay.alpha_composite(_glow(S, (gx, gy), r * 1.8, color, glow_alpha))
        ImageDraw.Draw(overlay).ellipse([gx - r, gy - r, gx + r, gy + r], fill=(*color, 255))
        # subtle inner highlight
        ImageDraw.Draw(overlay).ellipse(
            [gx - r * 0.45, gy - r * 0.6, gx + r * 0.15, gy], fill=(255, 255, 255, 45)
        )

    # Satellites (top one coral, rest alternate the two mints).
    for idx, (nx, ny) in enumerate(nodes):
        if idx == 0:
            node((nx, ny), S * 0.034, CORAL, glow_alpha=110)
        else:
            node((nx, ny), S * 0.030, SAT_A if idx % 2 else SAT_B, glow_alpha=90)

    # Central hub, largest and brightest.
    node((cx, cy), S * 0.058, HUB, glow_alpha=150)

    img.alpha_composite(Image.composite(overlay, Image.new("RGBA", (S, S)), mask))

    # Thin inner rim for a crisp edge.
    rim = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(rim).rounded_rectangle(box, radius=radius, outline=(160, 230, 215, 40), width=max(2, S // 512))
    img.alpha_composite(rim)

    return img.resize((px, px), Image.LANCZOS)


def build_icns(master: Image.Image, outdir: Path) -> Path:
    outdir.mkdir(parents=True, exist_ok=True)
    iconset = outdir / "AppIcon.iconset"
    if iconset.exists():
        shutil.rmtree(iconset)
    iconset.mkdir()

    for pt in ICONSET_SIZES:
        for scale in (1, 2):
            px = pt * scale
            suffix = "@2x" if scale == 2 else ""
            name = f"icon_{pt}x{pt}{suffix}.png"
            master.resize((px, px), Image.LANCZOS).save(iconset / name)

    icns = outdir / "AppIcon.icns"
    iconutil = shutil.which("iconutil") or "/usr/bin/iconutil"
    subprocess.run([iconutil, "-c", "icns", str(iconset), "-o", str(icns)], check=True)
    shutil.rmtree(iconset)
    return icns


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the SYMMIO Fleet app icon")
    parser.add_argument("--outdir", type=Path, default=DEFAULT_OUTDIR, help=f"output directory (default: {DEFAULT_OUTDIR})")
    args = parser.parse_args()

    master = render_master()
    png = args.outdir / "icon_1024.png"
    args.outdir.mkdir(parents=True, exist_ok=True)
    master.save(png)
    icns = build_icns(master, args.outdir)
    print(f"Wrote {png}")
    print(f"Wrote {icns}")


if __name__ == "__main__":
    main()
