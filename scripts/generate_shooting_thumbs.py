from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "assets" / "portfolio-pages"
OUT = ROOT / "public" / "assets" / "shooting-thumbs"


def square_crop(image, box):
    x1, y1, x2, y2 = box
    crop = image.crop((x1, y1, x2, y2))
    w, h = crop.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    crop = crop.crop((left, top, left + side, top + side))
    return crop.resize((640, 640), Image.Resampling.LANCZOS)


items = [
    ("portfolio-page-12.png", (510, 185, 966, 866), "shooting-01.jpg"),
    ("portfolio-page-12.png", (1028, 66, 1574, 870), "shooting-02.jpg"),
    ("portfolio-page-13.png", (67, 150, 540, 828), "shooting-03.jpg"),
    ("portfolio-page-13.png", (617, 150, 1135, 828), "shooting-04.jpg"),
    ("portfolio-page-13.png", (1276, 102, 1722, 694), "shooting-05.jpg"),
    ("portfolio-page-14.png", (196, 22, 646, 305), "shooting-06.jpg"),
    ("portfolio-page-14.png", (196, 320, 646, 905), "shooting-07.jpg"),
    ("portfolio-page-14.png", (961, 77, 1545, 878), "shooting-08.jpg"),
    ("portfolio-page-15.png", (635, 133, 1121, 868), "shooting-09.jpg"),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for source_name, box, output_name in items:
        image = Image.open(SRC / source_name).convert("RGB")
        square_crop(image, box).save(OUT / output_name, quality=90)
    print(f"generated {len(items)} shooting thumbnails")


if __name__ == "__main__":
    main()
