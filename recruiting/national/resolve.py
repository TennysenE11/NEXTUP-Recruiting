"""Stage 1: find each program's official baseball coaches page."""
import json, re, sys, html, urllib.parse
from concurrent.futures import ThreadPoolExecutor
import fetch

def norm(u):
    u = (u or "").strip()
    if not u: return ""
    if not re.match(r"https?://", u): u = "https://" + u
    p = urllib.parse.urlsplit(u)
    return "https://" + p.netloc.lower()   # this network only allows https

def links(base_url, text):
    out = []
    for m in re.finditer(r'<a\b[^>]*href=["\']([^"\'#]+)["\'][^>]*>(.*?)</a>', text, re.S | re.I):
        href = html.unescape(m.group(1)).strip()
        if href.startswith(("mailto:", "tel:", "javascript:")): continue
        label = html.unescape(re.sub(r"<[^>]+>", " ", m.group(2)))
        label = re.sub(r"\s+", " ", label).strip()
        out.append((urllib.parse.urljoin(base_url, href), label))
    return out

def looks_like_coaches(text):
    low = text.lower()
    return "baseball" in low and ("coach" in low) and (low.count("mailto:") > 0 or "sidearm-coaches-coach" in low or "s-table-body__row" in low or "head coach" in low)

def try_coaches(base):
    for path in ["/sports/baseball/coaches", "/sports/bsb/coaches/index", "/sports/baseball/coaches/", "/sports/m-basebl/mtt/staff", "/sports/baseball/staff"]:
        s, u, t = fetch.get(base + path)
        if s == 200 and looks_like_coaches(t): return base + path, s, "direct"
        if s == 403 and "cloudfront" in t.lower() or s == 403: last403 = base + path
    # crawl: athletics home -> baseball page -> coaches/staff link
    s, u, t = fetch.get(base + "/")
    if s != 200: return "", s, "home_unreachable"
    bl = [l for l, lab in links(u, t) if re.search(r"baseball|/bsb|m-basebl", l, re.I) or lab.lower() == "baseball"]
    seen = set()
    for b in bl[:6]:
        if b in seen: continue
        seen.add(b)
        s2, u2, t2 = fetch.get(b)
        if s2 != 200: continue
        if looks_like_coaches(t2) and re.search(r"coach|staff", b, re.I): return b, s2, "via_home"
        for c, lab in links(u2, t2):
            if re.search(r"coach|staff", c + " " + lab, re.I) and re.search(r"baseball|bsb|basebl", c, re.I):
                s3, u3, t3 = fetch.get(c)
                if s3 == 200 and looks_like_coaches(t3): return c, s3, "via_baseball_page"
    return "", 0, "not_found"

def discover_athletics(m):
    """For schools without a known athletics site: read the college homepage and follow its Athletics link."""
    home = norm(m["school_url"])
    if not home: return []
    s, u, t = fetch.get(home + "/")
    if s != 200: return []
    cands = []
    for l, lab in links(u, t):
        if re.search(r"\bathletic", lab, re.I) or re.search(r"athletic|sports", urllib.parse.urlsplit(l).netloc, re.I):
            b = norm(l)
            if b and b not in cands: cands.append(b)
        elif re.search(r"/athletics", l, re.I):
            s2, u2, t2 = fetch.get(l)
            if s2 == 200:
                for l2, lab2 in links(u2, t2):
                    if re.search(r"athletic|sports|go[a-z]+\.(com|org)", urllib.parse.urlsplit(l2).netloc, re.I):
                        b = norm(l2)
                        if b and b not in cands: cands.append(b)
    return cands[:4]

def resolve(m):
    bases = [norm(m["athletics_url"])] if m["athletics_url"] else []
    tried, blocked = [], False
    for b in bases + ["DISCOVER"]:
        if b == "DISCOVER":
            extra = [x for x in discover_athletics(m) if x not in tried]
            for b2 in extra:
                url, s, how = try_coaches(b2); tried.append(b2)
                if url: return {**m, "athletics_url": b2, "coaches_url": url, "how": how + "+discovered"}
                blocked = blocked or s == 403 or fetch.get(b2 + "/sports/baseball/coaches")[0] == 403 or fetch.get(b2 + "/sports/bsb/coaches/index")[0] == 403
            break
        url, s, how = try_coaches(b)
        tried.append(b)
        if url: return {**m, "athletics_url": b, "coaches_url": url, "how": how}
        blocked = blocked or fetch.get(b + "/sports/baseball/coaches")[0] == 403 or fetch.get(b + "/sports/bsb/coaches/index")[0] == 403
    how = "blocked" if blocked else ("not_found" if tried else "no_athletics_site")
    return {**m, "athletics_url": tried[0] if tried else "", "coaches_url": "", "how": how, "tried": tried}

if __name__ == "__main__":
    master = json.load(open(sys.argv[1]))
    lo, hi = int(sys.argv[3]), int(sys.argv[4])
    with ThreadPoolExecutor(24) as ex:
        res = list(ex.map(resolve, master[lo:hi]))
    json.dump(res, open(sys.argv[2], "w"), indent=0)
    import collections; print(collections.Counter(r["how"] for r in res))
