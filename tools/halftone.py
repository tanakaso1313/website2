#!/usr/bin/env python3
"""
Photoshop "Color Halftone" filter replica.

Replicates Filter > Pixelate > Color Halftone in Adobe Photoshop. Each CMYK
channel is screened with circular dots arranged on a grid rotated by the
channel's screen angle. Dot size is area-proportional to the channel value,
giving the classic CMYK print-style look.

Defaults match Photoshop's defaults (max radius 8 px; angles C=108, M=162,
Y=90, K=45 degrees).

Usage:
    tools/halftone.py INPUT OUTPUT [--radius N] [--size WxH] [--angles C,M,Y,K]

Examples:
    # Generate a 1278x1917 halftone tile from source photo
    tools/halftone.py src.jpg out.webp --size 1278x1917 --radius 6

    # Default radius, full-size output
    tools/halftone.py src.png out.png
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image


# Photoshop's default screen angles for C, M, Y, K (degrees).
DEFAULT_ANGLES = (108.0, 162.0, 90.0, 45.0)


def halftone_channel(channel: np.ndarray, angle_deg: float, max_radius: float) -> np.ndarray:
    """Apply rotated halftone screen to a single channel.

    For each output pixel:
      1. Rotate its coordinates by ``-angle`` so the dot grid is axis-aligned.
      2. Snap to the nearest grid cell (cell pitch = ``max_radius * 2``).
      3. Sample the source channel at the grid cell center (rotated back to
         image space). The sampled value sets the dot radius (area-
         proportional, so radius scales with sqrt(value)).
      4. Pixel is covered if its rotated distance to the grid center is less
         than the dot radius.

    Returns a ``uint8`` array the same shape as ``channel`` where 255 = fully
    covered (channel ink fully present) and 0 = no coverage.
    """
    h, w = channel.shape
    angle = np.radians(angle_deg)
    cell = float(max_radius) * 2.0

    yy, xx = np.indices((h, w), dtype=np.float32)
    cy, cx = h / 2.0, w / 2.0

    # Rotate pixel coords by -angle into screen space.
    yy_c = yy - cy
    xx_c = xx - cx
    cos_a = float(np.cos(-angle))
    sin_a = float(np.sin(-angle))
    yy_rot = yy_c * cos_a - xx_c * sin_a
    xx_rot = xx_c * cos_a + yy_c * sin_a

    # Snap to nearest grid center in screen space.
    grid_y = np.round(yy_rot / cell) * cell
    grid_x = np.round(xx_rot / cell) * cell

    # Distance from pixel to its grid cell center (in screen space).
    dy = yy_rot - grid_y
    dx = xx_rot - grid_x
    dist = np.sqrt(dy * dy + dx * dx)

    # Rotate grid center back to image space to sample the channel.
    cos_b = float(np.cos(angle))
    sin_b = float(np.sin(angle))
    sample_y = grid_y * cos_b - grid_x * sin_b + cy
    sample_x = grid_x * cos_b + grid_y * sin_b + cx

    sy = np.clip(np.round(sample_y), 0, h - 1).astype(np.int32)
    sx = np.clip(np.round(sample_x), 0, w - 1).astype(np.int32)
    cell_value = channel[sy, sx].astype(np.float32)

    # Area-proportional dot radius (Photoshop uses sqrt mapping).
    dot_radius = float(max_radius) * np.sqrt(cell_value / 255.0)

    # Soft 1-pixel anti-aliased edge.
    coverage = np.clip(dot_radius - dist + 0.5, 0.0, 1.0)
    return (coverage * 255.0).astype(np.uint8)


def color_halftone(img: Image.Image,
                   max_radius: float = 8.0,
                   angles: tuple[float, float, float, float] = DEFAULT_ANGLES,
                   mono: bool = False,
                   ) -> Image.Image:
    """Apply Photoshop-style Color Halftone to an RGB image.

    When ``mono=True``, the source is first flattened to grayscale and the
    same value is replicated across all four CMYK channels. This produces
    colorful CMYK dots whose density is driven only by tonal value (not by
    the photo's original color cast), which gives a uniform editorial look
    independent of subject color.
    """
    if mono:
        gray = np.array(img.convert("L"), dtype=np.uint8)  # 0 = white, 255 = black
        # In CMYK ink terms: ink amount = 255 - lightness, so darker pixels = more ink.
        ink = 255 - gray
        arr = np.stack([ink, ink, ink, ink], axis=-1)
    else:
        arr = np.array(img.convert("CMYK"))

    channels = []
    for i, ang in enumerate(angles):
        channels.append(halftone_channel(arr[..., i], ang, max_radius))

    stacked = np.stack(channels, axis=-1)
    return Image.fromarray(stacked, mode="CMYK").convert("RGB")


def cover_resize(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Resize image to fully cover ``target`` size, then center-crop."""
    iw, ih = img.size
    scale = max(target_w / iw, target_h / ih)
    new_size = (max(target_w, int(round(iw * scale))),
                max(target_h, int(round(ih * scale))))
    img = img.resize(new_size, Image.LANCZOS)
    left = (new_size[0] - target_w) // 2
    top = (new_size[1] - target_h) // 2
    return img.crop((left, top, left + target_w, top + target_h))


def parse_size(s: str) -> tuple[int, int]:
    try:
        w, h = s.lower().split("x")
        return int(w), int(h)
    except Exception as exc:  # noqa: BLE001
        raise argparse.ArgumentTypeError(f"--size must be WxH, got {s!r}") from exc


def parse_angles(s: str) -> tuple[float, float, float, float]:
    parts = [float(p) for p in s.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("--angles must be 4 comma-separated values (C,M,Y,K)")
    return tuple(parts)  # type: ignore[return-value]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Photoshop 'Color Halftone' replica (CMYK halftone screen).",
    )
    parser.add_argument("input", type=Path, help="source image (JPG/PNG/WebP)")
    parser.add_argument("output", type=Path, help="output image")
    parser.add_argument("--radius", type=float, default=8.0,
                        help="max dot radius in pixels (default: 8)")
    parser.add_argument("--size", type=parse_size,
                        help="resize/cover-crop output to WxH before halftoning")
    parser.add_argument("--angles", type=parse_angles, default=DEFAULT_ANGLES,
                        help="screen angles for C,M,Y,K (default: 108,162,90,45)")
    parser.add_argument("--quality", type=int, default=82,
                        help="WebP/JPEG quality (default: 82)")
    parser.add_argument("--mono", action="store_true",
                        help="flatten source to grayscale and replicate across CMYK so "
                             "dots stay colorful but density is driven only by tone")
    args = parser.parse_args(argv)

    img = Image.open(args.input).convert("RGB")
    if args.size:
        img = cover_resize(img, *args.size)

    result = color_halftone(img, max_radius=args.radius, angles=args.angles,
                             mono=args.mono)

    save_kwargs: dict = {}
    out_ext = args.output.suffix.lower()
    if out_ext in (".webp", ".jpg", ".jpeg"):
        save_kwargs["quality"] = args.quality
    if out_ext == ".webp":
        save_kwargs["method"] = 6  # better compression at small CPU cost

    result.save(args.output, **save_kwargs)
    print(f"Wrote {args.output} ({result.size[0]}x{result.size[1]})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
