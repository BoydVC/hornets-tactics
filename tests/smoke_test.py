#!/usr/bin/env python3
"""Smoke test for Hornets Tactics Board (Sat Oct 10 remaster).
1. dist/hornets-tactics.html is a single self-contained offline file (no http(s) references, no external
   scripts/styles/fonts/images, no network APIs).
2. Headless Chrome (tests/check.mjs over the DevTools protocol) loads it from file:// and checks: zero console
   errors, no network requests, no horizontal overflow at 1440/1280/390 widths, 8 generic presets, 7v7/9v9/11v11
   formats, real mouse + touch drags, draw/erase/undo, frames, play animation advancing, save/load, JSON, PNG.
3. Screenshots exist (00-best-home, desktop with arrows, phone).
Usage: python3 tests/smoke_test.py"""
import json, os, re, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(R)
res = []
def check(name, cond, info=""):
    res.append((bool(cond), name)); print(("PASS " if cond else "FAIL ") + name + (f"  [{info}]" if info else ""), flush=True)
subprocess.run([sys.executable, "build.py"], check=True, capture_output=True)
path = "dist/hornets-tactics.html"; html = open(path, encoding="utf-8").read()
check("offline snapshot exists", len(html) > 30000, f"{os.path.getsize(path):,} bytes")
urls = re.findall(r"https?://[^\s\"'<>)]*", html)
check("snapshot has no external http(s) references", not urls, urls[:3])
check("no external <script src>, <link href>, <img src> or @import", not re.search(r"<(script|link|img|iframe)[^>]+(src|href)\s*=|@import", html, re.I) and not re.search(r"\burl\(\s*['\"]?(?!data:)[a-z]", html))
check("no network APIs (fetch/XHR/WebSocket/beacon)", not re.search(r"\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource", html))
check("snapshot labels preset library as generic examples", html.count("Generic example") >= 1 and "Not from any real team" in html)
check("practice notes panel present (no schedule invented)", "Practice notes" in html and "coach crib" in html and ("no schedule" in html.lower() or "not a practice schedule" in html.lower()))
pr = subprocess.run(["node", "--experimental-websocket", "tests/check.mjs"], capture_output=True, text=True, timeout=300)
try:
    j = json.loads(pr.stdout[pr.stdout.index("{"):])
    for c in j["checks"]: check("chrome: " + c["name"], c["pass"], c["info"][:170])
except Exception as e:
    check("headless chrome run", False, (pr.stdout + pr.stderr)[-400:])
shots = os.listdir("screenshots") if os.path.isdir("screenshots") else []
check("best screenshot present (00-best-home.png)", "00-best-home.png" in shots)
check("desktop screenshot of a play with arrows present", "desktop-1440-overlap-frame3.png" in shots)
check("phone (390x844) screenshot present", any(s.startswith("phone-390") for s in shots))
fails = [r for r in res if not r[0]]
print(f"\n{len(res) - len(fails)}/{len(res)} checks passed"); sys.exit(1 if fails else 0)
