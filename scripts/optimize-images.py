"""Regenerate portfolio derivatives. Requires Pillow; originals stay untouched."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]


class Certificates(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and "certificate" in attrs.get("class", "").split():
            self.current = ROOT / unquote(attrs["href"])
        elif tag == "img" and self.current is not None:
            self.items.append((self.current, ROOT / attrs["src"]))
            self.current = None


def main():
    parser = Certificates()
    parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    with Image.open(ROOT / "assets/img/Pic.jpg") as original:
        portrait = ImageOps.exif_transpose(original).convert("RGB")
        portrait.save(ROOT / "assets/img/portrait.webp", "WEBP", quality=86, method=6)
    for original_path, preview_path in parser.items:
        preview_path.resolve().relative_to((ROOT / "assets/img/thumbnails").resolve())
        preview_path.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(original_path) as original:
            thumbnail = ImageOps.contain(
                ImageOps.exif_transpose(original).convert("RGB"),
                (560, 396), Image.Resampling.LANCZOS,
            )
            thumbnail.save(preview_path, "WEBP", quality=78, method=6)
    print(f"Updated portrait and {len(parser.items)} certificate thumbnails.")


if __name__ == "__main__":
    main()
