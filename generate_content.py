# -*- coding: utf-8 -*-
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent
MEM_DIR = ROOT / "memories"
GIFT_DIR = ROOT / "gifts"
OUT_DIR = ROOT / "data"
OUT_DIR.mkdir(exist_ok=True)

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}

def natural_key(path):
    return [int(x) if x.isdigit() else x.lower()
            for x in re.split(r"(\d+)", path.name)]

def read_sidecar(image_path):
    """
    Supported TXT formats.

    SIMPLE / backward-compatible:
      line 1 = title/name
      line 2+ = description

    MEMORY EXTENDED FORMAT:
      line 1 = title
      line 2 = date
      line 3 = location
      line 4+ = description

    If no TXT exists, filename stem becomes title.
    """
    txt = image_path.with_suffix(".txt")
    fallback_title = image_path.stem.replace("_", " ").replace("-", " ").title()

    if not txt.exists():
        return {
            "title": fallback_title,
            "date": "",
            "location": "",
            "description": ""
        }

    raw = txt.read_text(encoding="utf-8-sig").strip()
    if not raw:
        return {
            "title": fallback_title,
            "date": "",
            "location": "",
            "description": ""
        }

    lines = [line.strip() for line in raw.splitlines()]
    title = lines[0] if lines and lines[0] else fallback_title

    # Extended memory format: 4 or more lines.
    if len(lines) >= 4:
        return {
            "title": title,
            "date": lines[1],
            "location": lines[2],
            "description": "\n".join(lines[3:]).strip()
        }

    # Backward-compatible old format.
    return {
        "title": title,
        "date": "",
        "location": "",
        "description": "\n".join(lines[1:]).strip()
    }

def rel_web(path):
    return path.relative_to(ROOT).as_posix()

# ---------------- MEMORIES ----------------
memories = []
if MEM_DIR.exists():
    imgs = sorted(
        [p for p in MEM_DIR.iterdir()
         if p.is_file() and p.suffix.lower() in IMAGE_EXTS],
        key=natural_key
    )
    for i, img in enumerate(imgs, 1):
        meta = read_sidecar(img)
        memories.append({
            "image": rel_web(img),
            "title": meta["title"],
            "date": meta["date"],
            "location": meta["location"],
            "description": meta["description"],
            "chapter": f"Chapter {i:02d}"
        })

# ---------------- GIFTS ----------------
gifts = []
if GIFT_DIR.exists():
    category_dirs = sorted(
        [p for p in GIFT_DIR.iterdir() if p.is_dir()],
        key=natural_key
    )

    emoji_defaults = {
        "beauty": "💄",
        "accessories": "👜",
        "date & experience": "🍽️",
        "date": "🍽️",
        "surprise": "🎲"
    }

    for cat_dir in category_dirs:
        items = []
        imgs = sorted(
            [p for p in cat_dir.iterdir()
             if p.is_file() and p.suffix.lower() in IMAGE_EXTS],
            key=natural_key
        )
        for img in imgs:
            meta = read_sidecar(img)
            items.append({
                "name": meta["title"],
                "note": meta["description"],
                "image": rel_web(img)
            })

        if items:
            key = re.sub(r"[^a-z0-9]+", "-", cat_dir.name.lower()).strip("-")
            emoji = emoji_defaults.get(cat_dir.name.lower(), "🎁")
            gifts.append({
                "key": key,
                "label": cat_dir.name,
                "emoji": emoji,
                "items": items
            })

payload = {
    "memories": memories,
    "giftCategories": gifts
}

json_text = json.dumps(payload, ensure_ascii=False, indent=2)
(OUT_DIR / "content.json").write_text(json_text, encoding="utf-8")

# Also make JS version so local file:// opening works without fetch/CORS restrictions
js_text = "window.BIRTHDAY_CONTENT = " + json_text + ";\n"
(OUT_DIR / "content.js").write_text(js_text, encoding="utf-8")

print("=" * 72)
print("BIRTHDAY WEBSITE CONTENT UPDATED")
print("=" * 72)
print(f"Memories : {len(memories)}")
print(f"Gift categories : {len(gifts)}")
for cat in gifts:
    print(f"  - {cat['label']}: {len(cat['items'])} gifts")
print("")
print("Generated:")
print("  data/content.json")
print("  data/content.js")
print("")
print("You can now open index.html or refresh your browser.")
