// Headless Chrome checks against the offline snapshot loaded from file://. Prints JSON {checks:[{name,pass,info}]}.
import { launch, sleep } from "./cdp.mjs";
import { resolve } from "node:path";
const url = "file://" + resolve("dist/hornets-tactics.html");
const b = await launch(9475);
const checks = []; const ck = (name, pass, info = "") => checks.push({ name, pass: !!pass, info: typeof info === "string" ? info : JSON.stringify(info) });
const fresh = async (w, h, mobile = false, scale = 1) => { await b.viewport(w, h, mobile, scale); await b.goto(url, 800); await b.ev("localStorage.clear()"); await b.goto(url, 900); };
const overflow = () => b.ev("({sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth, iw: innerWidth})");
const pt = async (x, y) => b.ev(`(() => { const r = document.querySelector('#pitch').getBoundingClientRect(); const [sx, sy] = HT.toScreen(${x}, ${y}); return [r.left + sx, r.top + sy]; })()`);
const mouse = async (type, x, y) => b.send("Input.dispatchMouseEvent", { type, x, y, button: "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1 });
async function mouseDrag(x1, y1, x2, y2, steps = 8) { await mouse("mousePressed", x1, y1); for (let i = 1; i <= steps; i++) await mouse("mouseMoved", x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps); await mouse("mouseReleased", x2, y2); await sleep(60); }
async function touchDrag(x1, y1, x2, y2, steps = 8) { await b.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x1, y: y1 }] });
  for (let i = 1; i <= steps; i++) await b.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x1 + (x2 - x1) * i / steps, y: y1 + (y2 - y1) * i / steps }] });
  await b.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(80); }
const piece = (id) => b.ev(`HT.state.frames[HT.state.cur].pieces.find(p => p.id === "${id}")`);
try {
  // ---- load + errors + network
  await fresh(1440, 900);
  ck("page loads from file:// (title + canvas present)", await b.ev(`document.title === "Hornets Tactics Board" && !!document.querySelector('#pitch') && document.querySelector('#pitch').width > 300`));
  const ext = b.requests.filter((u) => !/^(file|data|blob|about|chrome):/.test(u));
  ck("no network requests besides file://", ext.length === 0, ext.slice(0, 3));
  // ---- overflow at three sizes (also with a preset loaded)
  for (const [w, h, m, sc] of [[1440, 900, false, 1], [1280, 800, false, 1], [390, 844, true, 2]]) {
    await fresh(w, h, m, sc); const o1 = await overflow(); await b.ev(`HT.loadPreset("press")`); await sleep(150); const o2 = await overflow();
    ck(`no horizontal overflow at ${w}x${h}`, o1.sw <= w && o1.bw <= w && o2.sw <= w && o2.bw <= w, { o1, o2 });
  }
  const phoneView = await b.ev("HT.view"); ck("phone (390) uses a vertical pitch that fits the width", phoneView.vertical && phoneView.w <= 390, { w: Math.round(phoneView.w), h: Math.round(phoneView.h) });
  // ---- presets
  await fresh(1440, 900);
  const presets = await b.ev("HT.presets");
  ck("6+ preset drills exist", presets.length >= 6, presets.map((p) => p.name).join(" | "));
  ck("every preset labelled 'Generic example' in the library", (await b.ev(`document.querySelectorAll('.preset em').length`)) === presets.length && (await b.ev(`[...document.querySelectorAll('.preset em')].every(e => e.textContent === 'Generic example')`)));
  let allLoad = true; const info = [];
  for (const p of presets) { const ok = await b.ev(`HT.loadPreset("${p.id}")`); const st = await b.ev("HT.state"); const arrows = st.frames.reduce((n, f) => n + f.arrows.length, 0);
    info.push(`${p.id}:${st.frames.length}f/${arrows}a`); if (!ok || st.frames.length < 3 || arrows < 3) allLoad = false; }
  ck("each preset loads with 3+ frames and arrows", allLoad, info.join(" "));
  // ---- formats
  for (const n of [7, 9, 11]) { await b.ev(`HT.format(${n})`); await sleep(80); const st = await b.ev("HT.state"); const f = st.frames[0];
    const home = f.pieces.filter((p) => p.team === "home").length, away = f.pieces.filter((p) => p.team === "away").length;
    ck(`${n}v${n} format gives ${n} per side (default ${st.homeForm})`, home === n && away === n, { home, away, form: st.homeForm }); }
  const formOk = await b.ev(`Object.entries(HT.formations).every(([n, fs]) => Object.values(fs).every(rows => rows.flat().length === n - 1))`);
  ck("every formation has the right number of outfield players", formOk);
  // ---- mouse drag + undo
  await b.ev("HT.format(9)"); await sleep(80);
  const p0 = await piece("h5"); const [sx, sy] = await pt(p0.x, p0.y); const [tx, ty] = await pt(p0.x + 12, p0.y + 6);
  await mouseDrag(sx, sy, tx, ty); const p1 = await piece("h5");
  ck("mouse drag moves a player", Math.abs(p1.x - (p0.x + 12)) < 1 && Math.abs(p1.y - (p0.y + 6)) < 1, { from: [p0.x, p0.y], to: [p1.x, p1.y] });
  const bl0 = (await b.ev("HT.state")).frames[0].ball; const [bx, by] = await pt(bl0.x, bl0.y); const [bx2, by2] = await pt(bl0.x - 10, bl0.y + 3);
  await mouseDrag(bx, by, bx2, by2); const bl1 = (await b.ev("HT.state")).frames[0].ball;
  ck("mouse drag moves the ball", Math.abs(bl1.x - (bl0.x - 10)) < 1.5, { from: bl0, to: bl1 });
  await b.ev("HT.doUndo()"); await b.ev("HT.doUndo()"); const p2 = await piece("h5");
  ck("undo restores positions", p2.x === p0.x && p2.y === p0.y, { back: [p2.x, p2.y] });
  // ---- touch drag
  await b.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
  const q0 = await piece("a4"); const [ux, uy] = await pt(q0.x, q0.y); const [vx, vy] = await pt(q0.x - 8, q0.y - 5);
  await touchDrag(ux, uy, vx, vy); const q1 = await piece("a4");
  ck("touch drag moves a player", Math.abs(q1.x - (q0.x - 8)) < 1 && Math.abs(q1.y - (q0.y - 5)) < 1, { from: [q0.x, q0.y], to: [q1.x, q1.y] });
  await b.send("Emulation.setTouchEmulationEnabled", { enabled: false });
  // ---- draw tools + eraser
  await b.ev("HT.setTool('pass')"); let [ax, ay] = await pt(60, 20); let [ax2, ay2] = await pt(75, 20); await mouseDrag(ax, ay, ax2, ay2);
  await b.ev("HT.setTool('run')"); [ax, ay] = await pt(60, 50); [ax2, ay2] = await pt(80, 55); await mouseDrag(ax, ay, ax2, ay2);
  await b.ev("HT.setTool('dribble')"); [ax, ay] = await pt(40, 34); [ax2, ay2] = await pt(50, 30); await mouseDrag(ax, ay, ax2, ay2);
  let arrows = (await b.ev("HT.state")).frames[0].arrows;
  ck("draw tool adds pass (solid), run (dashed) and dribble arrows", arrows.map((a) => a.type).join(",") === "pass,run,dribble", arrows.map((a) => a.type));
  await b.ev("HT.setTool('erase')"); const [ex, ey] = await pt(67.5, 20); await mouseDrag(ex, ey, ex + 2, ey + 1, 2);
  arrows = (await b.ev("HT.state")).frames[0].arrows;
  ck("eraser removes the arrow it touches", arrows.map((a) => a.type).join(",") === "run,dribble", arrows.map((a) => a.type));
  await b.ev("HT.doUndo()"); ck("undo brings an erased arrow back", (await b.ev("HT.state")).frames[0].arrows.length === 3);
  await b.ev("HT.setTool('move')");
  // ---- frames + play animation
  await b.ev("document.querySelector('#btnAddFrame').click()"); ck("＋ Frame adds a frame", (await b.ev("HT.state")).frames.length === 2);
  await b.ev(`HT.loadPreset("overlap")`); await b.ev("HT.setSpeed(2)");
  const nF = (await b.ev("HT.state")).frames.length;
  await b.ev("HT.play()"); await sleep(250); const mid = await b.ev("({pos: HT.pos, playing: HT.playing})");
  await sleep(900); const later = await b.ev("({pos: HT.pos, cur: HT.state.cur, playing: HT.playing, chip: document.querySelector('#frameChips .on')?.textContent})");
  ck("play animation advances smoothly (fractional position while playing)", mid.playing && mid.pos > 0 && mid.pos % 1 !== 0, mid);
  ck("play animation advances frames", later.cur >= 1 && later.pos > mid.pos && later.chip === String(later.cur + 1), later);
  await sleep(nF * 650); const end = await b.ev("({cur: HT.state.cur, playing: HT.playing})");
  ck("playback stops on the last frame", !end.playing && end.cur === nF - 1, end);
  await b.ev("document.querySelector('#btnFirst').click()"); await b.ev("document.querySelector('#btnNext').click()"); await sleep(900);
  ck("step forward animates exactly one frame", (await b.ev("({c: HT.state.cur, p: HT.playing})")).c === 1);
  await b.ev("document.querySelector('#btnPlay').click()"); await sleep(200); await b.ev("document.querySelector('#btnPlay').click()");
  ck("pause stops playback", !(await b.ev("HT.playing")));
  // ---- save / load / export / import / png
  await b.ev(`HT.loadPreset("3v2")`); await b.ev(`HT.savePlay("Test Play")`);
  await b.goto(url, 900);
  const listed = await b.ev(`[...document.querySelectorAll('#savedList .load')].map(e => e.textContent)`);
  ck("saved play persists in localStorage after reload", listed.some((t) => t.includes("Test Play")), listed);
  ck("current board restored after reload", (await b.ev("HT.state")).name === "Test Play");
  await b.ev("HT.format(7)"); const loaded = await b.ev(`HT.loadSaved("Test Play")`); const ls = await b.ev("HT.state");
  ck("load saved play restores its frames", loaded && ls.frames.length === 6 && ls.name === "Test Play", { frames: ls.frames.length });
  const js = await b.ev("HT.exportJSON()"); let pj; try { pj = JSON.parse(js); } catch {}
  ck("export JSON is valid and contains the play", pj && pj.app === "hornets-tactics-board" && pj.play.frames.length === 6);
  await b.ev("HT.format(11)"); const nImp = await b.ev(`HT.importText(${JSON.stringify(js.replace("Test Play", "Imported Copy"))})`);
  ck("import JSON loads the play back", nImp === 1 && (await b.ev("HT.state")).name === "Imported Copy" && (await b.ev("HT.state")).frames.length === 6);
  const png = await b.ev("HT.pngDataURL()");
  ck("PNG export produces an image", png.startsWith("data:image/png;base64,") && png.length > 30000, `${png.length} chars`);
  ck("zero console errors / exceptions", b.errors.length === 0, b.errors.slice(0, 3));
} catch (e) { ck("headless run completed", false, String(e).slice(0, 300)); }
console.log(JSON.stringify({ checks, errors: b.errors }));
await b.close();
