"""Stage 2: read names, titles, emails and bio links from an official coaches page. Never invents an email."""
import re, html, urllib.parse
ROLE = re.compile(r"coach|coordinator|director|manager|assistant|analyst|operations|trainer|strength|volunteer|graduate|recruit|pitching|hitting|catching|analytics|development|chaplain|video|student", re.I)
NAME = re.compile(r"^[A-Z][A-Za-z'’.\-]+(?:\s+(?:[A-Z][A-Za-z'’.\-]+|de|del|la|van|von|da|di|III|II|IV|Jr\.?|Sr\.?)){1,4}$")

def clean(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()

def cf_decode(hexstr):
    try:
        k = int(hexstr[:2], 16)
        return "".join(chr(int(hexstr[i:i+2], 16) ^ k) for i in range(2, len(hexstr), 2))
    except Exception: return ""

def emails_in(fragment):
    f = html.unescape(fragment)
    out = re.findall(r"mailto:\s*([A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})", f, re.I)
    out += [cf_decode(h) for h in re.findall(r"email-protection#([0-9a-fA-F]+)", f)]
    return [e.strip().rstrip(".") for e in out if "@" in e]

def bio_links(fragment, base):
    return [urllib.parse.urljoin(base, html.unescape(h)) for h in re.findall(r'href=["\']([^"\']*(?:/coaches/|/staff-directory/|staff\.aspx|/staff/|coaches\.aspx|/bios?/)[^"\']*)["\']', fragment, re.I)]

def from_rows(text, base):
    out = []
    for tr in re.findall(r"<tr\b[^>]*>(.*?)</tr>", text, re.S | re.I):
        cells = [clean(c) for c in re.findall(r"<t[hd]\b[^>]*>(.*?)</t[hd]>", tr, re.S | re.I)]
        cells = [c for c in cells if c]
        if len(cells) < 2: continue
        name = next((c for c in cells if NAME.match(c) and not ROLE.search(c)), "")
        title = next((c for c in cells if ROLE.search(c) and c != name and len(c) < 160), "")
        if not name or not title: continue
        em = emails_in(tr); bl = bio_links(tr, base)
        out.append({"name": name, "title": title, "email": em[0] if em else "", "bio": bl[0] if bl else ""})
    return out

def from_cards(text, base):
    """Fallback for card layouts: each email link plus the nearest name and title just before it."""
    out = []
    for m in re.finditer(r'(mailto:[^"\'>\s]+|email-protection#[0-9a-fA-F]+)', text):
        seg = text[max(0, m.start() - 2500): m.start()]
        bits = [clean(b) for b in re.split(r"<(?:/?(?:h\d|div|p|span|a|strong|li|dt|dd|br))\b[^>]*>", seg)]
        bits = [b for b in bits if b and len(b) < 120]
        name = next((b for b in reversed(bits) if NAME.match(b) and not ROLE.search(b)), "")
        title = next((b for b in reversed(bits) if ROLE.search(b) and len(b) < 120), "")
        em = emails_in(m.group(0))
        if name and em:
            bl = bio_links(seg[-1500:], base)
            out.append({"name": name, "title": title, "email": em[0], "bio": bl[-1] if bl else "", "card": True})
    return out

def parse(url, text):
    rows = from_rows(text, url)
    if len([r for r in rows if r["email"]]) == 0 and not rows:
        rows = from_cards(text, url)
    seen, res = set(), []
    rows = [r for r in rows if len(r["name"].split()) <= 4]
    for r in rows:
        k = (r["name"].lower(), r["title"].lower())
        if k in seen: continue
        seen.add(k); res.append(r)
    return res

def is_head(t): return re.search(r"\bhead (baseball )?coach\b", t, re.I) and not re.search(r"(assistant|associate|asst\.?) head", t, re.I)
def is_pitch(t): return re.search(r"pitch", t, re.I)
def is_recruit(t): return re.search(r"recruit", t, re.I)

# ---- added: staff-directory filter and text-pair fallback ----
TITLE_RE = r"(?:Interim |Volunteer |Graduate |Student |Undergraduate )?(?:Head (?:Baseball )?Coach|(?:Associate|Assistant|Asst\.) Head (?:Baseball )?Coach(?:/[A-Za-z ]+)?|Assistant (?:Baseball )?Coach(?:\s*[/-]\s*[A-Za-z ]+)?|Pitching Coach(?:\s*[/-]\s*[A-Za-z ]+)?|Hitting Coach|Recruiting Coordinator|Director of (?:Baseball )?Operations|Volunteer Assistant(?: Coach)?|Graduate Assistant(?: Coach)?)"
PAIR = re.compile(r"([A-Z][a-zA-Z'’.\-]+(?: [A-Z][a-zA-Z'’.\-]+){1,3}) (" + TITLE_RE + r")")
GENERIC = re.compile(r"^(info|athletics|sports|tickets|webmaster|media|compliance|admissions|baseball|sid|communications|marketing|camps?)@", re.I)

def all_emails(text):
    em = set(emails_in(text))
    em |= set(re.findall(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.(?:edu|com|org|net|us)\b", html.unescape(text)))
    return {e for e in em if not re.search(r"\.(png|jpg|gif|svg)$", e, re.I)}

def match_email(name, emails):
    parts = [re.sub(r"[^a-z]", "", p.lower()) for p in name.split()]
    if len(parts) < 2: return ""
    first, last = parts[0], parts[-1]
    hits = [e for e in emails if last and last in re.sub(r"[^a-z]", "", e.split("@")[0].lower()) and not GENERIC.search(e)]
    if len(hits) > 1: hits = [e for e in hits if first[:1] in e.split("@")[0].lower()] or hits
    return hits[0] if len(hits) == 1 else ""

def from_text(text, base):
    body = re.sub(r"(?s)<script\b.*?</script>|<style\b.*?</style>|<nav\b.*?</nav>|<footer\b.*?</footer>", " ", text)
    txt = clean(body)
    i = txt.lower().find("coaching staff")
    zone = txt[i:i + 6000] if i >= 0 else txt
    emails = all_emails(text)
    out, seen = [], set()
    for m in PAIR.finditer(zone):
        name, title = m.group(1).strip(), m.group(2).strip()
        toks = name.split()
        suffix = toks[-1].rstrip(".") in ("Jr", "Sr", "II", "III", "IV")
        keep = 3 if suffix or (len(toks) >= 3 and len(toks[-2].rstrip(".")) == 1) else 2
        name = " ".join(toks[-keep:])
        if not NAME.match(name) or name.lower() in seen: continue
        seen.add(name.lower())
        out.append({"name": name, "title": title, "email": match_email(name, emails), "bio": "", "text": True})
    return out

def baseball_only(rows_html_pairs):
    return [r for r, h in rows_html_pairs if re.search(r"\bBaseball\b", h)]

_parse_v1 = parse
def parse(url, text):
    res = _parse_v1(url, text)
    if len(res) > 25:  # whole-department staff directory: keep baseball rows only
        keep = []
        for tr in re.findall(r"<tr\b[^>]*>.*?</tr>", text, re.S | re.I):
            if re.search(r"\bBaseball\b", tr):
                keep += from_rows(tr, url)
        # Card-style directories can't be split by sport reliably; leave them blank rather than risk the wrong sport.
        return keep
    if not res:
        res = from_text(text, url)
    return res
