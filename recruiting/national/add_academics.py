"""Adds each college's academic and cost facts to the app, from federal IPEDS data (nces.ed.gov, public domain).

Matches each program to its IPEDS record (UNITID): by the federal ID from EADA where the program came from
EADA, otherwise by the school's own website domain, otherwise by exact name within the state. Then adds:
city, public/private, religious affiliation, enrollment, acceptance rate, SAT and ACT middle-50% ranges,
graduation rate, published tuition and fees (in-state and out-of-state) and the total yearly cost of
attendance living on campus (in-state and out-of-state).

Usage: python3 add_academics.py <resolved.json> <ipeds dir with HD2024.csv, IC2024.csv, IC2024_dict.xlsx,
       adm2023.csv, drvadm2023.csv, drvic2023.csv, ic2023_ay.csv, drvef2023.csv, drvgr2023.csv>
"""
import csv, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(HERE, "..", "recruiting-tracker.html")

def table(path, cols):
    out = {}
    with open(path, encoding="utf-8-sig", errors="replace") as f:
        for r in csv.DictReader(f):
            out[r["UNITID"].strip()] = {c: (r.get(c) or "").strip() for c in cols}
    return out

def num(v):
    try: return float(v)
    except (TypeError, ValueError): return None

def host(u):
    u = (u or "").strip().lower()
    u = re.sub(r"^[a-z]+://", "", u).split("/")[0].split(":")[0]
    return u[4:] if u.startswith("www.") else u

def norm(s):
    s = (s or "").lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\b(the|campus|main)\b", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def relig_labels(dict_xlsx):
    import openpyxl
    lab = {}
    for row in openpyxl.load_workbook(dict_xlsx, read_only=True)["Frequencies"].iter_rows(values_only=True):
        cells = [c for c in row if c is not None]
        if len(cells) > 3 and str(cells[1]).strip() == "RELAFFIL": lab[str(cells[2]).strip()] = str(cells[3]).strip()
    return lab

# Athletics names that differ from the federal name. Combined teams (Pomona-Pitzer, Claremont-Mudd-Scripps) are left out.
ALIAS = {
    "Arizona State University": "Arizona State University Campus Immersion",
    "Kent State University": "Kent State University at Kent",
    "Miami University (Ohio)": "Miami University-Oxford",
    "Saint Joseph's University": "Saint Joseph's University - Philadelphia",
    "Embry-Riddle Aeronautical University (Florida)": "Embry-Riddle Aeronautical University-Daytona Beach",
    "LSU New Orleans": "University of New Orleans",
    "Pennsylvania State Univ. Erie, the Behrend College": "Pennsylvania State University-Penn State Erie-Behrend College",
    "Penn State Harrisburg": "Pennsylvania State University-Penn State Harrisburg",
    "Rutgers, The State University of New Jersey, New Brunswick": "Rutgers University-New Brunswick",
    "Southern Illinois University at Carbondale": "Southern Illinois University-Carbondale",
    "Saint John's University (Minnesota)": "Saint Johns University",
    "Lock Haven University of Pennsylvania": "Commonwealth University of Pennsylvania",
    "Vermont State University Castleton": "Vermont State University",
}

def main(resolved_path, d):
    J = lambda f: os.path.join(d, f)
    hd = table(J("HD2024.csv"), ["INSTNM", "CITY", "STABBR", "WEBADDR", "CONTROL"])
    ic = table(J("IC2024.csv"), ["RELAFFIL"])
    adm = table(J("adm2023.csv"), ["SATVR25", "SATVR75", "SATMT25", "SATMT75", "ACTCM25", "ACTCM75"])
    dadm = table(J("drvadm2023.csv"), ["DVADM01"])
    dic = table(J("drvic2023.csv"), ["CINSON", "COTSON"])
    ay = table(J("ic2023_ay.csv"), ["CHG2AY3", "CHG3AY3"])
    ef = table(J("drvef2023.csv"), ["ENRTOT", "EFUG"])
    gr = table(J("drvgr2023.csv"), ["GRRTTOT"])
    rel = relig_labels(J("IC2024_dict.xlsx"))
    by_host, by_name = {}, {}
    for uid, h in hd.items():
        hh = host(h["WEBADDR"])
        if hh: by_host.setdefault(hh, []).append(uid)
        by_name.setdefault((norm(h["INSTNM"]), h["STABBR"]), []).append(uid)
    resolved = json.load(open(resolved_path))
    src = {}
    for r in resolved: src.setdefault((r["school"], r["state"]), r)

    s = open(APP, encoding="utf-8").read()
    m = re.search(r'(<script type="application/json" id="nationalDb">)(.*?)(</script>)', s, re.S)
    db = json.loads(m.group(2))
    NEW = ["unitid", "city", "control", "relig", "enroll", "admit", "sat_rw", "sat_m", "act", "grad", "tuition_in", "tuition_out", "cost_in", "cost_out"]
    for c in NEW:
        if c not in db["cols"]:
            db["cols"].append(c); db["rows"] = [r + [""] for r in db["rows"]]
    ix = {c: db["cols"].index(c) for c in db["cols"]}
    how = {"eada": 0, "domain": 0, "name": 0, "none": 0}
    for row in db["rows"]:
        school, st = row[ix["school"]], row[ix["state"]]
        r = src.get((school, st), {})
        uid = (r.get("unitid") or "").split(".")[0]
        kind = "eada" if uid in hd else ""
        if not kind:
            cands = by_host.get(host(r.get("school_url")), [])
            cands = [u for u in cands if hd[u]["STABBR"] == st]  # same domain in another state is a different school
            if len(cands) == 1: uid, kind = cands[0], "domain"
            elif len(cands) > 1:
                best = [u for u in cands if norm(hd[u]["INSTNM"]) == norm(school)]
                if len(best) == 1: uid, kind = best[0], "domain"
        if not kind:
            base = norm(re.sub(r"\(.*?\)", "", ALIAS.get(school, school)))
            cands = by_name.get((base, st), [])
            if len(cands) != 1:  # "Kent State University" -> "Kent State University at Kent", "Miami University" -> "Miami University-Oxford"
                cands = [u for (n, s2), us in by_name.items() if s2 == st and (n.startswith(base + " ") or base.startswith(n + " ")) for u in us]
            if len(cands) == 1: uid, kind = cands[0], "name"
        if not kind:
            how["none"] += 1; continue
        how[kind] += 1
        h, a, da, di, y, e, g = hd[uid], adm.get(uid, {}), dadm.get(uid, {}), dic.get(uid, {}), ay.get(uid, {}), ef.get(uid, {}), gr.get(uid, {})
        rng = lambda lo, hi: f"{int(num(lo))}-{int(num(hi))}" if num(lo) and num(hi) else ""
        money = lambda v: str(int(num(v))) if num(v) else ""
        pct = lambda v: str(round(num(v))) if num(v) is not None and num(v) >= 0 else ""
        vals = {
            "unitid": uid, "city": h["CITY"].title() if h["CITY"].isupper() else h["CITY"],
            "control": {"1": "Public", "2": "Private nonprofit", "3": "Private for-profit"}.get(h["CONTROL"], ""),
            "relig": rel.get(ic.get(uid, {}).get("RELAFFIL", ""), "") if ic.get(uid, {}).get("RELAFFIL", "") not in ("-1", "-2", "") else "",
            "enroll": money(e.get("ENRTOT")), "admit": pct(da.get("DVADM01")),
            "sat_rw": rng(a.get("SATVR25"), a.get("SATVR75")), "sat_m": rng(a.get("SATMT25"), a.get("SATMT75")), "act": rng(a.get("ACTCM25"), a.get("ACTCM75")),
            "grad": pct(g.get("GRRTTOT")), "tuition_in": money(y.get("CHG2AY3")), "tuition_out": money(y.get("CHG3AY3")),
            "cost_in": money(di.get("CINSON")), "cost_out": money(di.get("COTSON")),
        }
        for c, v in vals.items(): row[ix[c]] = v
    db.setdefault("meta", {})["academics"] = "IPEDS (nces.ed.gov): admissions, tests, enrollment, graduation 2023; tuition and cost of attendance 2023-24; affiliation 2024"
    s = s[:m.start(2)] + json.dumps(db, separators=(",", ":")) + s[m.end(2):]
    open(APP, "w", encoding="utf-8").write(s)
    print(how, "matched", sum(v for k, v in how.items() if k != "none"), "of", len(db["rows"]))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
