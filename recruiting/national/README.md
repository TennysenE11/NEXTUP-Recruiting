# National program list

`../national-programs.csv` and the "Find schools" list in the app come from this pipeline. Run it each fall, when coaching staffs change.

Rules it follows:
- Coach names, titles and emails come only from each school's official athletics site. Emails are copied from the page, never built from a name pattern.
- Polite crawling: honest user agent, robots.txt respected, about one request every 0.6 s per site, every page cached.
- Sites that block automated readers are not worked around. Those programs keep their official link and a VERIFY note.
- X handles come only from links on official pages: a coach's own staff bio, or the team account linked on the baseball pages. Nothing is pulled from X itself.

Steps:
1. `build_master.py`: every program (NCAA directory, plus federal EADA and IPEDS data for NAIA and junior colleges).
2. `resolve.py master.json resolved.json 0 99999`: find each official baseball coaches page.
3. `enrich.py resolved.json enriched.json`: read coaches, pick the contact (pitching coach, then recruiting coordinator, then head coach, then a full-time assistant), collect X handles from bios, count pitchers on the official roster.
4. `build_national.py`: clean up (merged duplicates, sites shared with another school, personal addresses, VERIFY notes) and write `national.json` and `national-programs.csv`. Paste `national.json` into the app's `nationalDb` script tag.

Checked 2026-11-18: 1,600 programs, 923 head coaches, 890 contact emails, 86 coach X handles and 539 team X accounts from official pages, pitcher counts for 696 rosters.

**Logos.** `add_logos.py` adds each school's official athletics logo (Sidearm's `/images/logos/site/site.png`) as a 96 px WebP in `recruiting/logos/`, and a `logo` column to the app's national list. The logo address comes only from the school's own page (home-screen icon, share image or header logo) or its own domain, and addresses shared by two schools are dropped. 829 of 1,600 programs have one.
