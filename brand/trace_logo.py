# Traces the supplied OpenSpot logo (white and purple on black) into clean vector paths.
import json, numpy as np, potrace
from PIL import Image
SC = 3  # trace at 3x for smoother curves
im = np.asarray(Image.open("openspot-logo-original.png").convert("RGB")).astype(float)
mn = im.min(axis=2); b = im[..., 2]
purple_px = im[(b - mn) > 120]
PURPLE = "#%02x%02x%02x" % tuple(int(v) for v in np.median(purple_px, axis=0))
white_cov = np.clip(mn / 235.0, 0, 1)
purp_cov = np.clip((b - mn) / 175.0, 0, 1)
def trace(cov, box):
    x0, y0, x1, y1 = box
    crop = Image.fromarray((cov[y0:y1, x0:x1] * 255).astype(np.uint8)).resize(((x1 - x0) * SC, (y1 - y0) * SC), Image.BICUBIC)
    bm = potrace.Bitmap(np.asarray(crop) <= 127)  # potracer treats dark pixels as the shape
    path = bm.trace(turdsize=12, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.25)
    f = lambda p: f"{p.x / SC + x0:.2f},{p.y / SC + y0:.2f}"
    d = []
    for c in path:
        d.append("M" + f(c.start_point))
        for s in c:
            d.append(("L" + f(s.c) + " L" + f(s.end_point)) if s.is_corner else ("C" + f(s.c1) + " " + f(s.c2) + " " + f(s.end_point)))
        d.append("Z")
    return "".join(d)
MARK = (470, 195, 1080, 490); WORD = (130, 525, 1420, 755)
out = {"purple": PURPLE, "mark_white": trace(white_cov, MARK), "mark_purple": trace(purp_cov, MARK),
       "word_white": trace(white_cov, WORD), "word_purple": trace(purp_cov, WORD)}
json.dump(out, open("traced.json", "w"))
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 1024"><rect width="1536" height="1024" fill="#000"/>
<g fill-rule="evenodd"><path fill="#fff" d="{out['mark_white']}{out['word_white']}"/><path fill="{PURPLE}" d="{out['mark_purple']}{out['word_purple']}"/></g></svg>'''
open("traced.svg", "w").write(svg)
print("purple", PURPLE, "| path sizes", {k: len(v) for k, v in out.items() if k != "purple"})
