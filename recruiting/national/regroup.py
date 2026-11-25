"""Recount every cached official roster by position group (P, C, IF, OF) and who leaves before fall 2027. Cache only, no network."""
import json, re, os, hashlib, collections
import parse
CACHE = "cache"
def cached(url):
    k = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest())
    if not os.path.exists(k): return None
    d = json.load(open(k, encoding="utf-8")); return d["t"] if d["s"] == 200 else None

YEARS = {"fr": "FR", "freshman": "FR", "r-fr": "FR", "rs-fr": "FR", "so": "SO", "sophomore": "SO", "r-so": "SO", "rs-so": "SO",
         "jr": "JR", "junior": "JR", "r-jr": "JR", "rs-jr": "JR", "sr": "SR", "senior": "SR", "r-sr": "SR", "rs-sr": "SR",
         "gr": "GR", "graduate": "GR", "grad": "GR", "5th": "GR", "6th": "GR", "r-5th": "GR", "graduate student": "GR"}
POS_RE = re.compile(r"^(?:RHP|LHP|P|C|1B|2B|3B|SS|INF|IF|MIF|CIF|OF|LF|CF|RF|UT|UTL|UTIL|DH|Pitcher|Catcher|Infielder|Outfielder|Utility|Right-handed Pitcher|Left-handed Pitcher|Infield|Outfield)(?:\s*/\s*(?:RHP|LHP|P|C|1B|2B|3B|SS|INF|IF|MIF|CIF|OF|LF|CF|RF|UT|UTL|UTIL|DH|Pitcher|Catcher|Infielder|Outfielder|Utility))*$", re.I)
def groups(pos):
    g = set()
    for t in re.split(r"\s*/\s*|\s+", pos.upper()):
        if t in ("RHP", "LHP", "P", "PITCHER"): g.add("P")
        elif t in ("C", "CATCHER"): g.add("C")
        elif t in ("1B", "2B", "3B", "SS", "INF", "IF", "MIF", "CIF", "INFIELDER", "INFIELD"): g.add("IF")
        elif t in ("OF", "LF", "CF", "RF", "OUTFIELDER", "OUTFIELD"): g.add("OF")
        elif t in ("UT", "UTL", "UTIL", "UTILITY"): g.update(["IF", "OF"])
    if "RIGHT-HANDED PITCHER" in pos.upper() or "LEFT-HANDED PITCHER" in pos.upper(): g.add("P")
    return g
def players(text):
    out = []
    for c in re.split(r'<li class="sidearm-roster-player[ "]', text)[1:]:
        pos = re.search(r'sidearm-roster-player-position-long-short hide-on-medium">(.*?)</span>', c, re.S) or re.search(r'sidearm-roster-player-position[^>]*>(.*?)</(?:div|span)>', c, re.S)
        yr = re.search(r'sidearm-roster-player-academic-year[^"]*">(.*?)</span>', c, re.S)
        p = parse.clean(pos.group(1)) if pos else ""; p = re.sub(r"\d+'.*$", "", p).strip()
        out.append((p, parse.clean(yr.group(1)) if yr else ""))
    if not out:
        for tr in re.findall(r"<tr\b[^>]*>(.*?)</tr>", text, re.S | re.I):
            cells = [parse.clean(x) for x in re.findall(r"<t[hd]\b[^>]*>(.*?)</t[hd]>", tr, re.S | re.I)]
            pos = next((x for x in cells if POS_RE.match(x)), "")
            yr = next((x for x in cells if x.lower().rstrip(".") in YEARS), "")
            if cells and (pos or yr): out.append((pos, yr))
    return out
def season_of(text):
    m = re.search(r"(20\d\d)(?:-\d\d)? Baseball Roster", text) or re.search(r"roster/(?:season/)?(20\d\d)", text)
    return m.group(1) if m else ""
def leaving(div, season, y):
    if div == "JUCO": return y in ("SO", "GR")
    if season and int(season) >= 2027: return y in ("SR", "GR")
    return y in ("JR", "SR", "GR")

e = json.load(open("enriched.json"))
res, stats = {}, collections.Counter()
for o in e:
    base = o.get("athletics_url")
    if not base: continue
    t = None
    for path in ["/sports/baseball/roster", "/sports/bsb/roster"]:
        t = cached(base + path)
        if t: break
    if not t: continue
    pl = players(t)
    season = o.get("roster_season") or season_of(t)
    yrs = [YEARS.get(y.lower().replace(".", "").replace("rs-", "r-").strip(), "") for p, y in pl]
    if len(pl) < 15 or sum(1 for y in yrs if y) < len(pl) * 0.8 or sum(1 for p, _ in pl if groups(p)) < len(pl) * 0.8: continue
    cnt = {g: [0, 0] for g in ("P", "C", "IF", "OF")}
    for (p, _), y in zip(pl, yrs):
        for g in groups(p):
            cnt[g][0] += 1
            if leaving(o["division"], season, y): cnt[g][1] += 1
    if cnt["P"][0] < 6: continue
    res[o["school"]] = {"season": season, "groups": ";".join(f"{g}:{cnt[g][0]}/{cnt[g][1]}" for g in ("P", "C", "IF", "OF"))}
    stats[o["division"]] += 1
json.dump(res, open("roster_groups.json", "w"), indent=0)
print(len(res), "programs with position-group counts", dict(stats))
for k in list(res)[:5]: print(" ", k, res[k])
