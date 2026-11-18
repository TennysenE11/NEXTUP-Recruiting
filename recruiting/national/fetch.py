"""Polite cached fetcher: honest user agent, robots.txt respected, per-host pacing, disk cache."""
import urllib.request, urllib.error, urllib.robotparser, urllib.parse, hashlib, os, json, time, threading, ssl, gzip, zlib
UA = "Mozilla/5.0 (compatible; recruiting-research/1.0; personal college baseball recruiting list)"
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
os.makedirs(CACHE, exist_ok=True)
_robots, _last, _lock = {}, {}, threading.Lock()
CTX = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE") or "/root/.ccr/ca-bundle.crt")

def _key(url): return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest())

def _raw(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/json;q=0.9,*/*;q=0.5", "Accept-Encoding": "gzip, deflate"})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            body = r.read(4_000_000)
            enc = r.headers.get("Content-Encoding", "")
            if enc == "gzip": body = gzip.decompress(body)
            elif enc == "deflate": body = zlib.decompress(body)
            return r.status, r.geturl(), body.decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, url, ""
    except Exception as e:
        return 0, url, "ERR " + type(e).__name__ + ": " + str(e)[:200]

def allowed(url):
    p = urllib.parse.urlsplit(url); host = p.scheme + "://" + p.netloc
    with _lock: rp = _robots.get(host)
    if rp is None:
        st, _, txt = get(host + "/robots.txt", check_robots=False)
        rp = urllib.robotparser.RobotFileParser()
        rp.parse(txt.splitlines() if st == 200 else [])
        with _lock: _robots[host] = rp
    return rp.can_fetch(UA, url)

def get(url, check_robots=True, pace=0.6):
    """Returns (status, final_url, text). status -1 = blocked by robots.txt."""
    k = _key(url)
    if os.path.exists(k):
        with open(k, encoding="utf-8") as f: d = json.load(f)
        return d["s"], d["u"], d["t"]
    if check_robots and not allowed(url):
        return -1, url, ""
    host = urllib.parse.urlsplit(url).netloc
    with _lock:
        wait = _last.get(host, 0) + pace - time.time()
        _last[host] = max(time.time(), _last.get(host, 0) + pace)
    if wait > 0: time.sleep(wait)
    s, u, t = _raw(url)
    if s != 0:  # don't cache network errors
        with open(k, "w", encoding="utf-8") as f: json.dump({"s": s, "u": u, "t": t}, f)
    return s, u, t
