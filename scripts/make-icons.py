"""Generate lightweight PWA icons. Run: python scripts/make-icons.py"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "icons"
OUT.mkdir(parents=True, exist_ok=True)


def make(size: int, name: str):
    img = Image.new("RGB", (size, size), (6, 18, 42))
    d = ImageDraw.Draw(img)
    pad = int(size * 0.1)
    d.rounded_rectangle([pad, pad, size - pad, size - pad], radius=int(size * 0.22), fill=(37, 99, 235))
    d.rounded_rectangle([pad, pad, size - pad, size - pad], radius=int(size * 0.22), outline=(96, 165, 250), width=max(2, size // 128))
    # Simple open-book mark
    cx, cy = size / 2, size / 2
    w, h = size * 0.44, size * 0.3
    d.polygon([(cx, cy - h * 0.35), (cx - w / 2, cy - h * 0.6), (cx - w / 2, cy + h * 0.55), (cx, cy + h * 0.3)], fill=(255, 255, 255))
    d.polygon([(cx, cy - h * 0.35), (cx + w / 2, cy - h * 0.6), (cx + w / 2, cy + h * 0.55), (cx, cy + h * 0.3)], fill=(224, 242, 255))
    d.line([(cx, cy - h * 0.35), (cx, cy + h * 0.3)], fill=(37, 99, 235), width=max(2, size // 160))
    img.save(OUT / name, optimize=True)


make(192, "icon-192.png")
make(512, "icon-512.png")
print("Wrote icon-192.png and icon-512.png")
