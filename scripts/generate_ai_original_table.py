from pathlib import Path

import openpyxl
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "ai"
SOURCE = Path(r"D:\ai创意策划 曾璇 19980811942\测评反馈\脚本.xlsx")


def font(size, bold=False):
    candidates = [
        r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc",
        r"C:\Windows\Fonts\simhei.ttf",
        r"C:\Windows\Fonts\simsun.ttc",
    ]
    for item in candidates:
        path = Path(item)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


TITLE = font(48, True)
HEADER = font(26, True)
BODY = font(22)
SMALL = font(18)


def wrap_text(draw, text, font_obj, max_width):
    paragraphs = str(text or "").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    lines = []
    for paragraph in paragraphs:
        if paragraph == "":
            lines.append("")
            continue
        current = ""
        for char in paragraph:
            candidate = current + char
            if draw.textbbox((0, 0), candidate, font=font_obj)[2] <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = char
        if current:
            lines.append(current)
    return lines


def load_rows():
    wb = openpyxl.load_workbook(SOURCE, data_only=True)
    ws = wb.active
    rows = []
    for row in ws.iter_rows(min_row=4, values_only=True):
        cells = list(row)
        if cells and cells[0] is None:
            cells = cells[1:]
        time, shot, desc, caption, *_ = cells + [None] * 4
        if not time and not shot and not desc and not caption:
            continue
        rows.append([time or "", shot or "", desc or "", caption or ""])
    return rows


def row_height(draw, row, widths):
    heights = []
    for value, width in zip(row, widths):
        lines = wrap_text(draw, value, BODY, width - 28)
        heights.append(max(1, len(lines)) * 30 + 34)
    return max(118, *heights)


def draw_cell(draw, xy, size, text, font_obj, fill):
    x, y = xy
    w, h = size
    draw.rectangle((x, y, x + w, y + h), fill=fill, outline=(60, 255, 181, 70), width=1)
    text_fill = "#dfe9e6" if font_obj == BODY else "#ffffff"
    line_y = y + 16
    for line in wrap_text(draw, text, font_obj, w - 28):
        draw.text((x + 14, line_y), line, font=font_obj, fill=text_fill)
        line_y += font_obj.size + 8


def draw_page(rows, page_index, page_count):
    width = 2400
    col_widths = [150, 330, 1320, 520]
    left = 40
    top = 150
    header_h = 68

    scratch = Image.new("RGB", (10, 10))
    scratch_draw = ImageDraw.Draw(scratch)
    heights = [row_height(scratch_draw, row, col_widths) for row in rows]
    height = top + header_h + sum(heights) + 110

    image = Image.new("RGB", (width, height), "#050908")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle((0, 0, width, height), fill=(5, 8, 10, 255))
    draw.ellipse((-260, -320, 560, 560), fill=(60, 255, 181, 18))
    for x in range(0, width, 120):
        draw.line((x, 0, x, height), fill=(255, 255, 255, 8))

    draw.text((left, 42), f"AI广告脚本原表 {page_index + 1:02d}/{page_count:02d}", font=TITLE, fill="#f3fff8")
    draw.text((left, 100), "来源：脚本.xlsx，按原字段完整分页展示，正文未删减或重写", font=SMALL, fill="#8fffd1")

    headers = ["时间", "镜头语言", "画面完整描述", "字幕/旁白"]
    x = left
    for header, col_width in zip(headers, col_widths):
        draw_cell(draw, (x, top), (col_width, header_h), header, HEADER, (10, 24, 20, 255))
        x += col_width

    y = top + header_h
    for row, h in zip(rows, heights):
        x = left
        for value, col_width in zip(row, col_widths):
            draw_cell(draw, (x, y), (col_width, h), value, BODY, (9, 14, 16, 255))
            x += col_width
        y += h

    return image


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rows = load_rows()
    page_size = 4
    pages = [rows[index : index + page_size] for index in range(0, len(rows), page_size)]
    for index, page_rows in enumerate(pages):
        image = draw_page(page_rows, index, len(pages))
        image.save(OUT / f"ai-script-original-{index + 1:02d}.jpg", quality=92)
    print(f"generated {len(pages)} original script pages from {len(rows)} rows")


if __name__ == "__main__":
    main()
