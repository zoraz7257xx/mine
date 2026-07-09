from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "strategy"


def font(size, bold=False):
    candidates = [
        r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc",
        r"C:\Windows\Fonts\simhei.ttf",
    ]
    for item in candidates:
        path = Path(item)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def draw_wrapped(draw, xy, text, font_obj, fill, width, line_gap=8):
    x, y = xy
    line = ""
    for char in text:
        test = line + char
        if draw.textbbox((0, 0), test, font=font_obj)[2] <= width:
            line = test
        else:
            draw.text((x, y), line, font=font_obj, fill=fill)
            y += font_obj.size + line_gap
            line = char
    if line:
        draw.text((x, y), line, font=font_obj, fill=fill)
        y += font_obj.size + line_gap
    return y


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", (1600, 1000), "#07100d")
    draw = ImageDraw.Draw(image, "RGBA")

    draw.rectangle((0, 0, 1600, 1000), fill=(5, 8, 11, 255))
    draw.ellipse((-320, -360, 520, 520), fill=(60, 255, 181, 24))
    draw.ellipse((1080, 650, 1900, 1300), fill=(60, 255, 181, 16))
    for x in range(80, 1600, 160):
        draw.line((x, 0, x, 1000), fill=(255, 255, 255, 10))

    title_font = font(66, True)
    sub_font = font(28, True)
    body_font = font(24)
    small_font = font(20)

    draw.text((80, 74), "区域社媒需求整理", font=title_font, fill="#f2fff9")
    draw.text((84, 154), "Regional Social Brief / 让产品、设计、营销对齐同一套内容方向", font=body_font, fill="#3cffb5")

    brief = "这组不是成品海报，而是运营工作里的“需求翻译”：把不同区域市场的社媒诉求、产品触点、传播节奏和素材方向整理清楚，让后续设计、AI 生图、KOL Brief 或社媒发布不跑偏。"
    draw_wrapped(draw, (84, 235), brief, body_font, "#c7d8d2", 1350, 10)

    cards = [
        ("01", "区域需求", "收集不同国家/地区的社媒诉求、平台语境、发布节点和内容偏好。"),
        ("02", "产品触点", "把卖点、规格、使用场景和受众关注点整理成可传播语言。"),
        ("03", "内容素材", "明确需要什么图、文案、Brief、参考方向和交付格式。"),
        ("04", "团队对齐", "让产品、设计、营销和外包团队围绕同一方向推进。"),
    ]
    y = 425
    for index, (num, heading, body) in enumerate(cards):
        x = 84 + (index % 2) * 730
        if index == 2:
            y = 690
        draw.rounded_rectangle((x, y, x + 660, y + 200), radius=24, fill=(10, 22, 19, 255), outline=(60, 255, 181, 70), width=2)
        draw.text((x + 34, y + 34), num, font=title_font, fill="#3cffb5")
        draw.text((x + 150, y + 44), heading, font=sub_font, fill="#ffffff")
        draw_wrapped(draw, (x + 150, y + 96), body, small_font, "#bfd0cb", 450, 8)

    image.save(OUT / "regional-social-brief.jpg", quality=92)
    print("generated regional-social-brief.jpg")


if __name__ == "__main__":
    main()
