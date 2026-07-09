import re
import zipfile
from pathlib import Path

import pdfplumber
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("D:/\u65b0\u5efa\u6587\u4ef6\u5939 (2)/\u65b0\u5efa\u6587\u4ef6\u5939 (2)")


def text_from_office(path):
    with zipfile.ZipFile(path) as archive:
        names = [
            name
            for name in archive.namelist()
            if name.startswith("word/document.xml")
            or (name.startswith("ppt/slides/slide") and name.endswith(".xml"))
        ]
        bits = []
        for name in names[:30]:
            xml = archive.read(name).decode("utf-8", "ignore")
            for a, b in re.findall(r"<a:t>(.*?)</a:t>|<w:t[^>]*>(.*?)</w:t>", xml):
                bits.append(a or b)
        return " | ".join(bits)


def audit_pdfs():
    for path in SOURCE.glob("*.pdf"):
        print(f"--- PDF {path.name} ---")
        with pdfplumber.open(path) as pdf:
            print("pages", len(pdf.pages))
            for index, page in enumerate(pdf.pages[:6]):
                text = (page.extract_text() or "").strip().replace("\n", " | ")
                print(f"PAGE {index + 1}: {text[:900]}")


def audit_office():
    for path in list(SOURCE.glob("*.docx")) + list(SOURCE.glob("*.pptx")):
        if path.name.startswith("~$"):
            continue
        print(f"--- OFFICE {path.name} ---")
        print(text_from_office(path)[:2200])


def make_contact_sheet():
    files = sorted((ROOT / "public" / "assets" / "portfolio-pages").glob("portfolio-page-*.jpg"))
    width, height = 320, 160
    margin, label_h, cols = 28, 28, 3
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new(
        "RGB",
        (cols * width + (cols + 1) * margin, rows * (height + label_h) + (rows + 1) * margin),
        "#10151d",
    )
    draw = ImageDraw.Draw(sheet)
    for index, path in enumerate(files):
        image = Image.open(path).convert("RGB")
        image.thumbnail((width, height))
        x = margin + (index % cols) * (width + margin)
        y = margin + (index // cols) * (height + label_h + margin)
        sheet.paste(image, (x, y))
        draw.text((x, y + height + 6), path.stem.replace("portfolio-page-", "Page "), fill="#eafcff")
    sheet.save(ROOT / "portfolio-contact-sheet.jpg", quality=90)


if __name__ == "__main__":
    make_contact_sheet()
    audit_pdfs()
    audit_office()
