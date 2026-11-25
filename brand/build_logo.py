# Redraws the NEXTUP logo as SVG: an N-with-arrow mark plus the wordmark (Saira, OFL, widest and heaviest, slanted to match).
import json, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

P = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
SLANT = P.get("slant", 0.50)        # dx per dy, like the logo's strokes
WD = P.get("wdth", 125); WT = P.get("wght", 900)
TRACK = P.get("track", -10)         # font units between letters
XS = P.get("xs", 1.0)               # extra horizontal stretch
f = TTFont("node_modules/@fontsource-variable/saira/files/saira-latin-wdth-normal.woff2")
f = instancer.instantiateVariableFont(f, {"wght": WT, "wdth": WD})
gs = f.getGlyphSet(); cmap = f.getBestCmap()
cap = f["OS/2"].sCapHeight or 700

def word(text, x0, base, capH, colors):
    """Return SVG paths for text with baseline at `base`, cap height capH, starting at x0 (bottom-left)."""
    s = capH / cap
    out = []; x = 0
    for ch in text:
        g = cmap[ord(ch)]; pen = SVGPathPen(gs)
        # font units -> svg: scale, flip y, skew (x += SLANT * height above baseline)
        t = TransformPen(pen, (s * XS, 0, s * SLANT, -s, x0 + x * s * XS, base))
        gs[g].draw(t)
        out.append((ch, pen.getCommands()))
        x += gs[g].width + TRACK
    return out, x * s * XS

def measure(text, capH):
    _, w = word(text, 0, 0, capH, None); return w

# ---- mark, in the 1254 x 1254 frame of the original artwork
S = 0.52
def para(x_bl, x_br, y_b, y_t, slope=S):
    h = y_b - y_t
    return [(x_bl, y_b), (x_br, y_b), (x_br + slope * h, y_t), (x_bl + slope * h, y_t)]
stem = para(377, 466, 613, 414)

diag = [(stem[3][0], 414), (stem[2][0], 414), (P.get("dbr", 705), 613), (640, 613)]
# thin white speed line, parallel to the arrow shaft, ending where it meets the diagonal
dBR = P.get("dbr", 705)
def diag_x(y): return stem[2][0] + (dBR - stem[2][0]) * (y - 414) / 199
def meet(xtop):  # where a line from (xtop,450) with slope S meets the diagonal's right edge
    y = (xtop + S * 450 - stem[2][0] + (dBR - stem[2][0]) * 414 / 199) / (S + (dBR - stem[2][0]) / 199)
    return (xtop - S * (y - 450), y)
sx, sw = P.get("sx", 752), P.get("sw", 14)
stripe = [(sx, 450), (sx + sw, 450), meet(sx + sw), meet(sx)]
shaft = para(720, 790, 613, 423)
head = [(700, 423), (875, 330), (943, 423)]
def poly(pts):
    # same winding for every shape, so overlaps fill instead of cancelling out
    a = sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]))
    if a < 0: pts = pts[::-1]
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
mark_white = poly(stem) + poly(diag) + poly(stripe)
mark_accent = poly(shaft) + poly(head)

capH = 117; base = 807
letters, w = word("NEXTUP", 0, base, capH, None)
x0 = (1254 - w - SLANT * capH) / 2 + P.get("dx", 0)
letters, w = word("NEXTUP", x0, base, capH, None)
white = "".join(d for ch, d in letters[:4]); accent = "".join(d for ch, d in letters[4:])
json.dump({"mark_white": mark_white, "mark_accent": mark_accent, "word_white": white, "word_accent": accent,
           "word_box": [x0, base - capH, w + SLANT * capH, capH]}, open("logo_paths.json", "w"))
PURPLE = P.get("purple", "#6c2ee6")
full = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254"><rect width="1254" height="1254" fill="#000"/>
<g fill="#fff"><path d="{mark_white}"/><path d="{white}"/></g><g fill="{PURPLE}"><path d="{mark_accent}"/><path d="{accent}"/></g></svg>'''
open("logo-full.svg", "w").write(full)
print("word width", round(w), "from", round(x0), "to", round(x0 + w + SLANT * capH))
