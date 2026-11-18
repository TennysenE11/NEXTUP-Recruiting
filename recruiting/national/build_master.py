"""Step 0: the list of every college baseball program.
NCAA D1/D2/D3: NCAA member directory (web3.ncaa.org, sportCode=MBA), which includes each school's athletics site.
NAIA and junior colleges: U.S. Dept. of Education EADA data (ope.ed.gov/athletics) for baseball sponsorship and association,
joined to IPEDS (nces.ed.gov) for each college's website.
Usage: python3 build_master.py <ncaa_baseball.json> <eada_baseball.json> <HD.csv> [<HD older.csv>] > master.json"""
import json, csv, sys
ncaa = json.load(open(sys.argv[1])); eada = json.load(open(sys.argv[2]))
hd = {}
for f in sys.argv[3:]:
    for r in csv.DictReader(open(f, encoding="utf-8-sig", errors="replace")): hd.setdefault(r["UNITID"], r)
DIV = {"NAIA Division I ": "NAIA", "NAIA Division II ": "NAIA", "NJCAA Division I ": "JUCO", "NJCAA Division II ": "JUCO",
       "NJCAA Division III ": "JUCO", "CCCAA": "JUCO", "NWAC": "JUCO"}
out = [{"source": "NCAA directory", "school": x["nameOfficial"].strip(), "division": "NCAA D" + str(x["division"]),
        "conference": (x["conferenceName"] or "").strip(), "state": x["memberOrgAddress"]["state"] or "",
        "athletics_url": (x.get("athleticWebUrl") or "").strip(), "school_url": (x.get("webSiteUrl") or "").strip(), "assoc": "NCAA", "unitid": ""} for x in ncaa]
for x in eada:
    c = x["classification_name"]
    if c not in DIV: continue
    h = hd.get(x["unitid"].split(".")[0]); a = c.split()[0]
    conf = "NJCAA Div. " + c.split("Division")[-1].strip() if a == "NJCAA" else a
    out.append({"source": "EADA + IPEDS", "school": x["institution_name"].strip(), "division": DIV[c], "conference": conf, "state": x["state_cd"],
                "athletics_url": "", "school_url": h["WEBADDR"].strip() if h else "", "assoc": a, "unitid": x["unitid"]})
json.dump(out, sys.stdout, indent=0)
