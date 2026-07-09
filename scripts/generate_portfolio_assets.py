from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
KIKNA_OUT = ROOT / "public" / "assets" / "kikna"
PORTFOLIO_OUT = ROOT / "public" / "assets" / "portfolio-pages"
STRATEGY_OUT = ROOT / "public" / "assets" / "strategy"
SOURCE_2 = Path("D:/\u65b0\u5efa\u6587\u4ef6\u5939 (2)/\u65b0\u5efa\u6587\u4ef6\u5939 (2)")


def resize_image(src, dest, width):
    image = Image.open(src)
    image.thumbnail((width, 4000), Image.Resampling.LANCZOS)
    image.save(dest, quality=84, optimize=True)
    print(dest.name, image.size)


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def wrap_text(draw, text, font_obj, width):
    lines = []
    for paragraph in text.split("\n"):
        current = ""
        for char in paragraph:
            test = current + char
            if draw.textlength(test, font=font_obj) <= width:
                current = test
            else:
                if current:
                    lines.append(current)
                current = char
        if current:
            lines.append(current)
        lines.append("")
    return lines[:-1]


def text_card(dest, eyebrow, title, body, footer=""):
    image = Image.new("RGB", (1100, 1400), "#f3f6f8")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1100, 210), fill="#10151d")
    draw.rectangle((52, 52, 1048, 1348), outline="#d4dde4", width=2)
    draw.text((78, 74), eyebrow.upper(), fill="#84f6ff", font=font(30, True))
    draw.text((78, 250), title, fill="#10151d", font=font(58, True))
    body_font = font(32)
    y = 390
    for line in wrap_text(draw, body, body_font, 900):
        draw.text((78, y), line, fill="#33404c", font=body_font)
        y += 50
    if footer:
        draw.text((78, 1238), footer, fill="#5b6875", font=font(28, True))
    image.save(dest, quality=88, optimize=True)
    print(dest.name, image.size)


def render_pdf(pdf_path, out_dir, prefix, scale=1.5):
    pdf = pdfium.PdfDocument(pdf_path)
    for index, page in enumerate(pdf):
        image = page.render(scale=scale).to_pil()
        image.thumbnail((1000, 1500), Image.Resampling.LANCZOS)
        dest = out_dir / f"{prefix}-{index + 1:02d}.jpg"
        image.save(dest, quality=84, optimize=True)
        print(dest.name, image.size)


def main():
    KIKNA_OUT.mkdir(parents=True, exist_ok=True)
    PORTFOLIO_OUT.mkdir(parents=True, exist_ok=True)
    STRATEGY_OUT.mkdir(parents=True, exist_ok=True)

    render_pdf("D:/\u66fe\u7487 \u4f5c\u54c1\u96c6.pdf", PORTFOLIO_OUT, "portfolio-page", 1.6)

    items = [
        (
            "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/English/kv/BD0076-GEEKBAR-SOMAX-kv(80K \u7248\uff09.jpg",
            "somax-kv.jpg",
            1400,
        ),
        (
            "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/English/EDM/BD0076-GEEKBAR-SOMAX-EDM(30mL).jpg",
            "somax-edm.jpg",
            1100,
        ),
        (
            "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/English/poster/BD0076-GEEKBAR-SOMAX-\u6d77\u62a5A3(30mL).jpg",
            "somax-poster.jpg",
            1000,
        ),
        (
            "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/English/spec/BD0076-GEEKBAR-SOMAX-SPEC(30mL).jpg",
            "somax-spec.jpg",
            900,
        ),
        (
            "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/English/web/BD0076 SOMAX\u8be6\u60c5\u9875/BD0076\u8be6\u60c5.jpg",
            "somax-detail.jpg",
            900,
        ),
        (
            "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/\u5546\u57ce\u7269\u6599\u56fe V2/\u9ed1t \u6b63\u9762.png",
            "merch-black-t.png",
            900,
        ),
        (
            "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/\u5546\u57ce\u7269\u6599\u56fe V2/\u6a59\u8272\u536b\u8863.png",
            "merch-orange-hoodie.png",
            900,
        ),
        (
            "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/\u5546\u57ce\u7269\u6599\u56fe V2/\u5e06\u5e03\u5305.png",
            "merch-tote.png",
            900,
        ),
        (
            "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/\u5546\u57ce\u7269\u6599\u56fe V2/\u96e8\u4f1e.png",
            "merch-umbrella.png",
            900,
        ),
    ]

    for src, name, width in items:
        resize_image(src, KIKNA_OUT / name, width)

    render_pdf(
        "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/Fasoul \u52a8\u6001\u5f71\u50cf\u89c6\u89c9\u89c4\u8303.pdf",
        KIKNA_OUT,
        "fasoul-guide",
        1.5,
    )
    render_pdf(
        "D:/\u57fa\u514b\u7eb3\u5de5\u4f5c/md00201 Blast Dumo\u8be6\u60c5\u9875.pdf",
        KIKNA_OUT,
        "dumo-detail",
        1.5,
    )

    research_pdfs = [
        (SOURCE_2 / "GB\u54c1\u724c\u8c03\u7814\u7ed3\u8bba\u5206\u4eab.pdf", "gb-brand-research"),
        (SOURCE_2 / "\u4fc4\u7f57\u65af\u8c03\u7814\u7ed3\u8bba\u5206\u4eab.pdf", "russia-research"),
    ]
    for pdf_path, prefix in research_pdfs:
        pdf = pdfium.PdfDocument(pdf_path)
        for index in range(min(len(pdf), 6)):
            image = pdf[index].render(scale=1.4).to_pil()
            image.thumbnail((1000, 1500), Image.Resampling.LANCZOS)
            dest = STRATEGY_OUT / f"{prefix}-{index + 1:02d}.jpg"
            image.save(dest, quality=84, optimize=True)
            print(dest.name, image.size)

    for src, name, width in [
        (SOURCE_2 / "\u70ed\u529b\u56fe.png", "research-heatmap.png", 900),
        (SOURCE_2 / "\u65b9\u9635\u7c7b\u578b.jpg", "research-matrix.jpg", 900),
        (SOURCE_2 / "\u589e\u957f\u5e74\u5747\u5dee.jpg", "research-growth.jpg", 900),
        (SOURCE_2 / "\u9996\u79c0\u56fe.jpg", "research-launch.jpg", 900),
        (SOURCE_2 / "\u66fe\u7487 19980811942\u4f5c\u54c1\u96c6/\u751f\u6210\u7684\u90e8\u5206\u793e\u5a92\u56fe/GB \u793e\u5a92\u65b0\u6a21\u677f4-5-\u6062\u590d\u7684-7.png", "social-gb-01.png", 900),
        (SOURCE_2 / "\u66fe\u7487 19980811942\u4f5c\u54c1\u96c6/\u751f\u6210\u7684\u90e8\u5206\u793e\u5a92\u56fe/GB \u793e\u5a92\u65b0\u6a21\u677f4-5-\u6062\u590d\u7684-6.png", "social-gb-02.png", 900),
    ]:
        if Path(src).exists():
            resize_image(src, STRATEGY_OUT / name, width)

    text_card(
        STRATEGY_OUT / "meloso-strategy.jpg",
        "Product Strategy",
        "BD0093 Meloso Max GR2",
        "用户决策路径：第一眼由外观、质感、屏幕、灯带完成筛选；第一口由风味、口感、顺滑度完成验证。\n\n营销方向：延续“好抽、耐用”的基础，用“看得见的设计升级”赢得选择。\n\nSlogan：Loved at Sight, Falling for Meloso。",
        "产品迭代方案 / 竞品分析 / KV 方向 / 卖点表达",
    )
    text_card(
        STRATEGY_OUT / "kol-briefs.jpg",
        "KOL Brief",
        "Creator Content Briefs",
        "GEEK BAR Spark：面向罗马尼亚生活方式创作者，强调预填充烟弹、日常便利、现代设计和轻松幽默内容。\n\nGEEK BAR MATE 60K：面向美国创作者，强调稳定风味、即插即用、日常使用和生活方式展示。",
        "KOL 内容方向 / 产品卖点翻译 / 创作者执行提示",
    )
    text_card(
        STRATEGY_OUT / "fasoul-pr.jpg",
        "PR Writing",
        "Fasoul Q1 Pro PR 稿",
        "围绕 Wrap Around Heating Technology 与 secondary mode，向德国市场解释“同一支可二次使用”的产品价值。\n\n表达重点：使用效率、消费成本、16-puff / 12-puff 双模式与日本市场表现。",
        "海外 PR 稿 / 英文产品表达 / 市场沟通",
    )
    text_card(
        STRATEGY_OUT / "regional-social.jpg",
        "Regional Social",
        "区域社媒需求整理",
        "将区域市场的社媒需求、产品触点、传播节奏和内容素材需求进行整理，帮助产品、设计与营销团队统一交付方向。",
        "区域需求 / 社媒内容 / 跨团队对齐",
    )


if __name__ == "__main__":
    main()
