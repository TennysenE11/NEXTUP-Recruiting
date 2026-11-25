# OpenSpot logo: an open ring (the open spot) with the purple arrow rising through the gap,
# plus the OPENSPOT wordmark (Saira, widest and heaviest, slanted to match the earlier logo).
import json, math, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
P = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
SLANT = 0.50; XS = P.get("xs", 1.28); TRACK = P.get("track", 0)
f = instancer.instantiateVariableFont(TTFont("node_modules/@fontsource-variable/saira/files/saira-latin-wdth-normal.woff2"), {"wght": 900, "wdth": 125})
gs = f.getGlyphSet(); cmap = f.getBestCmap(); cap = f["OS/2"].sCapHeight or 700
def word(text, x0, base, capH):
    s = capH / cap; out = []; x = 0
    for ch in text:
        g = cmap[ord(ch)]; pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s * XS, 0, s * SLANT, -s, x0 + x * s * XS, base)))
        out.append(pen.getCommands()); x += gs[g].width + TRACK
    return out, x * s * XS

# ---- mark, drawn upright around (0,0) and then slanted like the letters
R = P.get("R", 100); W = P.get("w", 36)          # ring radius and thickness
g0, g1 = math.radians(P.get("g0", -100)), math.radians(P.get("g1", -28))   # gap (screen angles, y down)
def ring_path():
    ro, ri = R + W / 2, R - W / 2
    # arc from g1 clockwise around to g0 (+2pi): the ring minus the gap
    a0, a1 = g1, g0 + 2 * math.pi
    large = 1 if (a1 - a0) > math.pi else 0
    p = lambda r, a: (r * math.cos(a), r * math.sin(a))
    o0, o1, i1, i0 = p(ro, a0), p(ro, a1), p(ri, a1), p(ri, a0)
    return (f"M{o0[0]:.2f},{o0[1]:.2f} A{ro},{ro} 0 {large} 1 {o1[0]:.2f},{o1[1]:.2f} "
            f"L{i1[0]:.2f},{i1[1]:.2f} A{ri},{ri} 0 {large} 0 {i0[0]:.2f},{i0[1]:.2f} Z")
AX = P.get("ax", 38); SW = P.get("sw", 38)       # arrow x and shaft width
y_bot = P.get("yb", 40); y_head = P.get("yh", -128); tip = P.get("tip", -205); hw = P.get("hw", 62)
arrow = [(AX - SW / 2, y_bot), (AX + SW / 2, y_bot), (AX + SW / 2, y_head), (AX + hw, y_head), (AX, tip), (AX - hw, y_head), (AX - SW / 2, y_head)]
ROT = math.radians(P.get("rot", 45))   # turn the arrow toward the upper right
arrow = [(x * math.cos(ROT) - y * math.sin(ROT), x * math.sin(ROT) + y * math.cos(ROT)) for x, y in arrow]
arrow_d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in arrow) + " Z"
# slant matrix (x += SLANT * -y) so the ring leans like the letters
SK = f"matrix(1 0 {-SLANT * P.get('sk', 0.55):.3f} 1 0 0)"
open("os_mark.json", "w").write(json.dumps({"ring": ring_path(), "arrow": arrow_d, "skew": SK}))
capH = P.get("capH", 92)
letters, w = word("OPENSPOT", 0, 0, capH)
json.dump({"white": "".join(letters[:4]), "accent": "".join(letters[4:]), "w": w + SLANT * capH, "capH": capH}, open("os_word.json", "w"))
PURPLE = "#6c2ee6"
# stacked preview on black, like the original logo artwork
mark_scale = P.get("ms", 1.15)
word_x = (1254 - (w + SLANT * capH)) / 2
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254"><rect width="1254" height="1254" fill="#000"/>
<g transform="translate({P.get('mx', 610)} {P.get('my', 520)}) scale({mark_scale})"><g transform="{SK}"><path fill="#fff" d="{ring_path()}"/><path fill="{PURPLE}" d="{arrow_d}"/></g></g>
<g transform="translate({word_x:.1f} {P.get('base', 800)})"><path fill="#fff" d="{"".join(letters[:4])}"/><path fill="{PURPLE}" d="{"".join(letters[4:])}"/></g></svg>'''
open("openspot-full.svg", "w").write(svg)
print("word width", round(w))
