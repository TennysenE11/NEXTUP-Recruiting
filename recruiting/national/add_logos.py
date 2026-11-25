"""Adds college logos to the app.

Logos are each school's official athletics logo (Sidearm's /images/logos/site/site.png), downloaded once.
The logo address is taken only from the school's own page: its home-screen icon, share image or header
logo, or its own domain. Addresses that two schools share are dropped. Each logo is shrunk to a 96 px
WebP in recruiting/logos/<school>-<state>.webp, and the national list gets a `logo` column naming the file.

Usage: python3 add_logos.py <logo_rows.json> <dir of downloaded PNGs named <key>.png>
"""
import json, os, re, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(HERE, "..", "recruiting-tracker.html")
OUT = os.path.join(HERE, "..", "logos")
SIZE = 96

def shrink(src, dst):
    im = Image.open(src).convert("RGBA")
    box = im.getbbox()                      # trim transparent edges
    if box: im = im.crop(box)
    im.thumbnail((SIZE - 8, SIZE - 8), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((SIZE - im.size[0]) // 2, (SIZE - im.size[1]) // 2))
    canvas.save(dst, "WEBP", quality=82, method=6)

def main(rows_path, png_dir):
    rows = json.load(open(rows_path))
    os.makedirs(OUT, exist_ok=True)
    have = {}
    for r in rows:
        src = os.path.join(png_dir, (r["key"] or "") + ".png")
        if r["key"] and os.path.exists(src):
            shrink(src, os.path.join(OUT, r["file"] + ".webp"))
            have[(r["school"], r["state"])] = r["file"]
    s = open(APP, encoding="utf-8").read()
    m = re.search(r'(<script type="application/json" id="nationalDb">)(.*?)(</script>)', s, re.S)
    d = json.loads(m.group(2))
    if "logo" not in d["cols"]:
        d["cols"].append("logo"); d["rows"] = [r + [""] for r in d["rows"]]
    si, st, li = d["cols"].index("school"), d["cols"].index("state"), d["cols"].index("logo")
    for r in d["rows"]: r[li] = have.get((r[si], r[st]), "")
    s = s[:m.start(2)] + json.dumps(d, separators=(",", ":")) + s[m.end(2):]
    open(APP, "w", encoding="utf-8").write(s)
    print(len(have), "logos of", len(d["rows"]), "programs")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
