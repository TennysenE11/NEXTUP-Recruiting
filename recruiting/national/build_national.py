"""Turn the crawl into the app's national school list. Every coach and email comes from the school's official athletics page."""
import json, re, csv, collections, urllib.parse
CHECKED = "2026-11-18"
PERSONAL = re.compile(r"@(gmail|yahoo|hotmail|outlook|icloud|aol|msn|live)\.", re.I)
e = json.load(open("enriched.json"))

def host(u): return urllib.parse.urlsplit(u if "://" in u else "https://" + u).netloc.lower().replace("www.", "")
def toks(s): return {t for t in re.findall(r"[a-z]+", s.lower()) if t not in {"university", "college", "of", "the", "community", "state", "at", "and", "campus"}}

# 1. Same school listed twice (NCAA directory + federal data after a reclassification): keep the NCAA entry.
ncaa_hosts = {host(o["athletics_url"]): o for o in e if o["assoc"] == "NCAA" and o["athletics_url"]}
ncaa_names = {re.sub(r"\W", "", o["school"].lower()) for o in e if o["assoc"] == "NCAA"}
rows = []
for o in e:
    if o["assoc"] != "NCAA" and (re.sub(r"\W", "", o["school"].lower()) in ncaa_names): continue
    rows.append(o)

# 2. Several programs pointing at one coaches page: only the school that owns the site keeps the data.
by_url = collections.defaultdict(list)
for o in rows:
    if o["coaches_url"]: by_url[o["coaches_url"].rstrip("/")].append(o)
shared = {}
for u, group in by_url.items():
    if len(group) < 2: continue
    h = host(u)
    def score(o):
        name_hit = sum(1 for t in toks(o["school"]) if t in h)
        return (o["assoc"] == "NCAA", name_hit, -len(o["school"]))
    group.sort(key=score, reverse=True)
    for o in group[1:]: shared[id(o)] = group[0]["school"]

# 3. Same head coach at two schools: one page is out of date.
dup_head = {k for k, v in collections.Counter(o["head_coach"] for o in rows if o["head_coach"] and id(o) not in shared).items() if v > 1}

out = []
for o in rows:
    notes = []
    co = o["coaches"] if id(o) not in shared else []
    rec = dict(school=o["school"], division=o["division"], conference=o["conference"], state=o["state"],
               head_coach="", pitching_coach="", coach_email="", source_url=o["coaches_url"] or o["athletics_url"] or ("https://" + o["school_url"].replace("https://", "").replace("http://", "").strip("/")),
               date_checked=CHECKED, roster_season="", roster_pitchers="", roster_leaving="", roster_url="", x_handle="", x_source="", x_owner="", notes="")
    if id(o) in shared:
        notes.append(f"VERIFY: the link found leads to {shared[id(o)]}'s athletics site, not this school's. Find this program's own coaches page.")
        rec["source_url"] = "https://" + o["school_url"].replace("https://", "").replace("http://", "").strip("/")
    elif not o["coaches_url"]:
        notes.append({"blocked": "VERIFY: this athletics site blocks automated reading. Open the source link for coaches and emails.",
                      "not_found": "VERIFY: couldn't find the baseball coaches page automatically. Start from the source link.",
                      "no_athletics_site": "VERIFY: couldn't find the athletics website from the college homepage."}.get(o["how"], "VERIFY: not read."))
    else:
        rec["head_coach"] = o["head_coach"]
        head = next((c for c in co if c["name"] == o["head_coach"]), None)
        contact = next((c for c in co if c["name"] == o["contact_name"]), None)
        if contact and PERSONAL.search(contact["email"]):
            alt = next((c for c in co if c["email"] and not PERSONAL.search(c["email"]) and (c is head or re.search(r"pitch|recruit|assistant|associate", c["title"], re.I))
                        and not re.search(r"volunteer|graduate|student|operations", c["title"], re.I)), None)
            if alt: contact = alt
            else: notes.append("VERIFY: the only email listed is a personal address.")
        if contact:
            rec["coach_email"] = contact["email"]
            if contact is not head: rec["pitching_coach"] = f'{contact["name"]} ({contact["title"]})'
        if not rec["pitching_coach"] and o["pitching_coach"]: rec["pitching_coach"] = o["pitching_coach"]
        if not o["head_coach"]: notes.append("VERIFY: head coach not identified on the page.")
        if o["head_coach"] in dup_head: notes.append("VERIFY: this head coach is also listed by another school; one page may be out of date.")
        if len(co) > 20: notes.append("VERIFY: long staff list; check the contact is a baseball coach.")
        if any(c.get("text") for c in co if c is contact): notes.append("VERIFY: email matched to the coach by name on a page without a contact table.")
        if not rec["coach_email"]: notes.append("No coach email on the official page.")
        if o["roster_pitchers"]:
            rec.update(roster_season=o["roster_season"], roster_pitchers=o["roster_pitchers"], roster_leaving=o["roster_leaving"], roster_url=o["roster_url"])
        if o["x_handle"]:
            rec.update(x_handle=o["x_handle"], x_source=o["x_source"], x_owner=o.get("x_owner", ""))
    rec["notes"] = " ".join(notes)
    out.append(rec)

cols = list(out[0].keys())
json.dump({"meta": {"checked": CHECKED, "count": len(out)}, "cols": cols, "rows": [[r[c] for c in cols] for r in out]},
          open("national.json", "w"), separators=(",", ":"))
LABEL = {"school": "School", "division": "Division", "conference": "Conference", "state": "State", "head_coach": "Head coach",
         "pitching_coach": "Pitching or recruiting coach", "coach_email": "Coach email", "source_url": "Source URL", "date_checked": "Date checked",
         "roster_season": "Roster season", "roster_pitchers": "Pitchers on roster", "roster_leaving": "Pitchers leaving", "roster_url": "Roster URL",
         "x_handle": "X handle", "x_source": "X source", "x_owner": "X owner", "notes": "Notes"}
with open("national-programs.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow([LABEL[c] for c in cols])
    for r in sorted(out, key=lambda r: (r["state"], r["division"], r["school"])): w.writerow([r[c] for c in cols])
c = collections.Counter
print("programs", len(out), "| by division", dict(c(r["division"] for r in out)))
print("with email", sum(1 for r in out if r["coach_email"]), "| head coach", sum(1 for r in out if r["head_coach"]),
      "| verify", sum(1 for r in out if "VERIFY" in r["notes"]), "| X coach", sum(1 for r in out if r["x_owner"] and r["x_owner"] != "team"),
      "| X team", sum(1 for r in out if r["x_owner"] == "team"), "| roster", sum(1 for r in out if r["roster_pitchers"]))
for d in ["NCAA D1", "NCAA D2", "NCAA D3", "NAIA", "JUCO"]:
    g = [r for r in out if r["division"] == d]
    print(f"  {d:8} {len(g):4} programs  {sum(1 for r in g if r['coach_email']):4} emails  {sum(1 for r in g if r['x_handle']):4} X")
