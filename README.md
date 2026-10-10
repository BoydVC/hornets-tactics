# Hornets Tactics Board ⚽

**A pocket tactics and drill board for Vic's Green Hornets soccer** (12U branding only — no invented schedule or roster). Drag green-and-gold Hornets and blue away players around a striped, properly marked pitch. Draw solid pass arrows, dashed run arrows and wavy dribble arrows, then build a play frame by frame and press ▶ to watch everyone glide into place. Kid-friendly for players, parent-readable for coaches at home. One offline HTML file — no account, no network, no ads.

* **Open it:** double-click `dist/hornets-tactics.html` (works from file://, a USB stick or AirDrop), or run `./run.sh` and go to http://127.0.0.1:4280/
* **Best screenshot:** `screenshots/00-best-home.png`

## What's new (Sat Oct 10 afternoon remaster)

* **Polished Hornets chrome** — gold crest header, pitch gold trim, toolbar glass card, arrow legend strip, footer colophon.
* **Practice notes (coach crib)** — 10 generic kid + parent tips (call for the ball, first touch, how to watch a drill, privacy). **Not a schedule** — no practice times, opponents, or personal logistics invented.
* **Formation mini-previews** — side-by-side Hornets / Away pitch thumbnails update when you change format or formation.
* **Drill library expanded to 8** generic teaching examples (added *Switch of play* and *Defend the box*). Still labelled “Generic example” — not from any real team or league.
* **Print-friendly CSS** for parents who want a paper board.
* Fresh `dist/hornets-tactics.html` + `screenshots/00-best-home.png`. Port moved to **4280**.

## What it does

* **Formats:** pick 7v7, 9v9 or 11v11. Each has four formations for each team. Defaults are 2-3-1 (7v7), 3-2-3 (9v9) and 4-3-3 (11v11). The app makes no claims about which format any league uses.
* **Move / Draw / Erase / Undo:** drag players and the ball; Pass (solid), Run (dashed gold), Dribble (wavy lilac); eraser + Ctrl+Z.
* **Animate a play:** ＋ Frame copies the board; ▶ plays with eased movement, ghost trails, and 0.5×–2× speed.
* **Drills & plays library (8, all generic):** Overlap on the wing, Give-and-go, Corner kick near-post run, Goal kick build-out, 3v2 attack, Pressing trap on the sideline, Switch of play, Defend the box.
* **Save & share:** named plays in localStorage, Export/Import JSON, Save PNG (title band). Everything stays on the device.
* **Layouts:** desktop/laptop side panel; phone turns the pitch vertical (Hornets attack up). No horizontal scrolling.

## Run

```
./run.sh            # build dist/ snapshot, serve on 127.0.0.1:4280
./run.sh --test     # build + smoke test (writes tests/smoke-test.log) + serve
./run.sh --shots    # build + re-shoot screenshots + serve
python3 tests/smoke_test.py
```

## Files

```
web/index.html, web/app.css, web/app.js   source (canvas pitch, tools, frames, presets, practice notes, form viz)
build.py                                  inlines web/ into dist/hornets-tactics.html
dist/hornets-tactics.html                 offline snapshot (no network, system fonts)
server.py                                 stdlib dev server on 127.0.0.1:4280 (/health)
run.sh                                    build → (test | shots) → serve
tests/                                    smoke_test.py, check.mjs, screens.mjs, cdp.mjs
screenshots/                              00-best-home.png + desktop/laptop/phone shots
```

## Rules

* Every drill and practice note is a **generic teaching example**. No real rosters, scores, league rules, photos, or invented kid schedules.
* Private: server binds to **127.0.0.1** only. Snapshot has no CDN, analytics, or network APIs.

## Test result

See `tests/smoke-test.log` after `./run.sh --test`. Checks cover offline snapshot integrity, headless Chrome interaction (mouse/touch, tools, frames, playback, save/load, JSON, PNG), and screenshot presence.


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/hornets-tactics` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
