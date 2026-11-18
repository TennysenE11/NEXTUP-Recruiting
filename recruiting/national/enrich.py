"""Stage 3+4: parse coaches, pick the contact, collect X handles from official bio pages, count pitchers on the official roster."""
import json, re, sys, collections, urllib.parse
from concurrent.futures import ThreadPoolExecutor
import fetch, parse

XLINK = re.compile(r'href=["\']https?://(?:www\.|mobile\.)?(?:twitter|x)\.com/(?:#!/)?@?([A-Za-z0-9_]{2,15})(?:[/?"\'])', re.I)
NOT_HANDLE = {"intent", "share", "home", "i", "search", "hashtag", "login", "signup", "privacy", "tos", "explore", "settings"}

def handles(text):
    return [h for h in XLINK.findall(text) if h.lower() not in NOT_HANDLE]

def sitewide(base, coaches_text):
    s, u, t = fetch.get(base + "/")
    return {h.lower() for h in handles(t)} | {h.lower() for h in handles(coaches_text) if not re.search(r"base|bsb", h, re.I)}

def team_handle(coaches_text):
    c = collections.Counter(h for h in handles(coaches_text) if re.search(r"baseball|bsb|_bb\b|bball", h, re.I) and not re.search(r"basketball|softball|mbb|wbb", h, re.I))
    m = re.search(r'"twitter"\s*:\s*"@?([A-Za-z0-9_]{2,15})"', coaches_text)
    if m and re.search(r"base|bsb", m.group(1), re.I): c[m.group(1)] += 5
    return c.most_common(1)[0][0] if c else ""

def coach_handle(bio_url, site):
    if not bio_url: return ""
    s, u, t = fetch.get(bio_url)
    if s != 200: return ""
    own = [h for h in handles(t) if h.lower() not in site]
    return own[0] if len(set(x.lower() for x in own)) == 1 else ""

YEARS = {"fr": "FR", "freshman": "FR", "r-fr": "FR", "rs-fr": "FR", "so": "SO", "sophomore": "SO", "r-so": "SO", "rs-so": "SO",
         "jr": "JR", "junior": "JR", "r-jr": "JR", "rs-jr": "JR", "sr": "SR", "senior": "SR", "r-sr": "SR", "rs-sr": "SR",
         "gr": "GR", "graduate": "GR", "grad": "GR", "5th": "GR", "6th": "GR", "r-5th": "GR", "graduate student": "GR"}

def roster_counts(text):
    season = (re.search(r"(20\d\d)(?:-\d\d)? Baseball Roster", text) or re.search(r"roster/(?:season/)?(20\d\d)", text) or [None, ""])[1]
    players = []
    for c in re.split(r'<li class="sidearm-roster-player[ "]', text)[1:]:
        pos = re.search(r'sidearm-roster-player-position[^>]*>(.*?)</(?:div|span)>', c, re.S)
        yr = re.search(r'sidearm-roster-player-academic-year[^"]*">(.*?)</span>', c, re.S)
        players.append((parse.clean(pos.group(1)) if pos else "", parse.clean(yr.group(1)) if yr else ""))
    if not players:  # table layouts (new Sidearm, Presto, others)
        for tr in re.findall(r"<tr\b[^>]*>(.*?)</tr>", text, re.S | re.I):
            cells = [parse.clean(x) for x in re.findall(r"<t[hd]\b[^>]*>(.*?)</t[hd]>", tr, re.S | re.I)]
            pos = next((x for x in cells if re.fullmatch(r"(?:RHP|LHP|P|Pitcher|RHP/[A-Z0-9]+|LHP/[A-Z0-9]+|[A-Z0-9]+/RHP|[A-Z0-9]+/LHP|Right-handed Pitcher|Left-handed Pitcher)", x, re.I)), "")
            yr = next((x for x in cells if x.lower().rstrip(".") in YEARS), "")
            if cells and (pos or yr): players.append((pos, yr))
    pit = [(p, y) for p, y in players if re.search(r"\b(RHP|LHP|P|Pitcher)\b", p, re.I)]
    yrs = [YEARS.get(y.lower().replace(".", "").replace("rs-", "r-").strip(), "") for p, y in pit]
    if not pit or len(pit) < 6 or sum(1 for y in yrs if y) < len(pit) * 0.8: return season, None, None
    return season, len(pit), yrs

def leaving(division, season, yrs):
    if yrs is None: return None
    if division == "JUCO": return sum(1 for y in yrs if y in ("SO", "GR"))
    if season and int(season) >= 2027: return sum(1 for y in yrs if y in ("SR", "GR"))
    return sum(1 for y in yrs if y in ("JR", "SR", "GR"))

def enrich(r):
    out = dict(r); out.update({"coaches": [], "contact_name": "", "contact_title": "", "coach_email": "", "head_coach": "", "pitching_coach": "",
                               "x_handle": "", "x_source": "", "team_x": "", "roster_url": "", "roster_season": "", "roster_pitchers": "", "roster_leaving": ""})
    if not r.get("coaches_url"): return out
    if re.search(r"/roster/(?:season/[^/]+/)?staff/", r["coaches_url"]):  # a single staff bio: read the roster's staff section instead
        r = {**r, "coaches_url": r["athletics_url"] + "/sports/baseball/roster"}
        out["coaches_url"] = r["coaches_url"]
    s, u, t = fetch.get(r["coaches_url"])
    co = parse.parse(u, t)
    out["coaches"] = co
    head = next((c for c in co if parse.is_head(c["title"])), None)
    pitch = next((c for c in co if parse.is_pitch(c["title"]) and not parse.is_head(c["title"])), None)
    rec = next((c for c in co if parse.is_recruit(c["title"]) and not parse.is_head(c["title"])), None)
    out["head_coach"] = head["name"] if head else ""
    pr = pitch or rec
    out["pitching_coach"] = (pr["name"] + " (" + pr["title"] + ")") if pr else ""
    contact = next((c for c in [pitch, rec] if c and c["email"]), None) or (head if head and head["email"] else None)
    if not contact:  # another full-time assistant listed with an official email
        contact = next((c for c in co if c["email"] and re.search(r"assistant|associate", c["title"], re.I)
                        and not re.search(r"volunteer|graduate|student|operations|trainer|strength|manager", c["title"], re.I)), None)
    if contact:
        out.update(contact_name=contact["name"], contact_title=contact["title"], coach_email=contact["email"])
    base = r["athletics_url"]
    site = sitewide(base, t)
    out["team_x"] = team_handle(t)
    for c in [contact, head]:
        if c and c.get("bio"):
            h = coach_handle(c["bio"], site)
            if h:
                out["x_handle"], out["x_source"], out["x_owner"] = "@" + h, c["bio"], c["name"]; break
    if not out["x_handle"] and out["team_x"]:
        out["x_handle"], out["x_source"], out["x_owner"] = "@" + out["team_x"], r["coaches_url"], "team"
    # roster
    for path in ["/sports/baseball/roster", "/sports/bsb/roster"]:
        rs, ru, rt = fetch.get(base + path)
        if rs == 200:
            season, n, yrs = roster_counts(rt)
            if n:
                out.update(roster_url=base + path, roster_season=season, roster_pitchers=n, roster_leaving=leaving(r["division"], season, yrs))
            break
    return out

if __name__ == "__main__":
    res = json.load(open(sys.argv[1]))
    with ThreadPoolExecutor(24) as ex:
        out = list(ex.map(enrich, res))
    json.dump(out, open(sys.argv[2], "w"), indent=0)
    print("programs", len(out), "with coaches", sum(1 for o in out if o["coaches"]), "with email", sum(1 for o in out if o["coach_email"]),
          "with head coach", sum(1 for o in out if o["head_coach"]), "X coach", sum(1 for o in out if o["x_handle"] and o.get("x_owner") != "team"),
          "X team", sum(1 for o in out if o.get("x_owner") == "team"), "roster", sum(1 for o in out if o["roster_pitchers"]))
