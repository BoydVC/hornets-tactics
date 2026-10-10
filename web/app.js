/* Hornets Tactics Board: offline soccer tactics + drill board. Remaster Sat Oct 10. No network, no accounts. */
(function () {
"use strict";
const L = 105, W = 68, M = 4;            // logical pitch (units ~ metres) + margin
const LS_CUR = "hornets-tactics-v1-current", LS_PLAYS = "hornets-tactics-v1-plays";
const $ = (s) => document.querySelector(s);

/* ---------- formations (rows back->front, listed left->right when attacking) ---------- */
const FORMATIONS = {
  7: { "2-3-1": [["LCB","RCB"],["LM","CM","RM"],["ST"]], "3-2-1": [["LB","CB","RB"],["LCM","RCM"],["ST"]],
       "3-1-2": [["LB","CB","RB"],["CM"],["LS","RS"]], "2-1-2-1": [["LCB","RCB"],["DM"],["LM","RM"],["ST"]] },
  9: { "3-2-3": [["LB","CB","RB"],["LCM","RCM"],["LW","ST","RW"]], "3-3-2": [["LB","CB","RB"],["LM","CM","RM"],["LS","RS"]],
       "4-3-1": [["LB","LCB","RCB","RB"],["LM","CM","RM"],["ST"]], "3-4-1": [["LB","CB","RB"],["LM","LCM","RCM","RM"],["ST"]] },
  11: { "4-3-3": [["LB","LCB","RCB","RB"],["LCM","CM","RCM"],["LW","ST","RW"]], "4-4-2": [["LB","LCB","RCB","RB"],["LM","LCM","RCM","RM"],["LS","RS"]],
        "4-2-3-1": [["LB","LCB","RCB","RB"],["LDM","RDM"],["LW","CAM","RW"],["ST"]], "3-5-2": [["LCB","CB","RCB"],["LWB","LCM","CM","RCM","RWB"],["LS","RS"]] },
};
const DEFAULT_FORM = { 7: "2-3-1", 9: "3-2-3", 11: "4-3-3" };

function teamPieces(team, form, fmt) {
  const rows = FORMATIONS[fmt][form] || FORMATIONS[fmt][DEFAULT_FORM[fmt]];
  const out = [{ id: team[0] + "1", team, num: 1, role: "GK", x: 4.5, y: W / 2 }];
  let n = 2; const R = rows.length;
  rows.forEach((row, r) => {
    const x = R === 1 ? 28 : 13 + r * (30 / (R - 1));
    row.forEach((role, i) => { out.push({ id: team[0] + n, team, num: n, role, x, y: +(W * (i + 1) / (row.length + 1)).toFixed(2) }); n++; });
  });
  if (team === "away") out.forEach((p) => { p.x = +(L - p.x).toFixed(2); p.y = +(W - p.y).toFixed(2); });
  return out;
}
function formationFrame(fmt, hf, af) {
  return { pieces: teamPieces("home", hf, fmt).concat(teamPieces("away", af, fmt)), ball: { x: L / 2, y: W / 2 }, arrows: [] };
}

/* ---------- generic practice notes (teaching tips only — not a schedule) ---------- */
const PRACTICE_NOTES = [
  { audience: "kid", title: "Call for the ball", body: "Say your teammate's name early. Quiet players get skipped — loud, clear calls help the pass arrive." },
  { audience: "kid", title: "First touch away from trouble", body: "When the ball comes, take your first touch into open grass, not into a defender. Soft feet, open body." },
  { audience: "kid", title: "Leave a lane", body: "If a teammate is overlapping, don't drift into their running lane. Hold your width so the pass has a path." },
  { audience: "parent", title: "How to watch a drill", body: "Load a play, press ▶, then ask: Who moved first? Where did the ball go? What would you try next? Keep it curious, not critical." },
  { audience: "parent", title: "Formats on this board", body: "7v7, 9v9 and 11v11 are just player counts for drawing. Use whichever matches the field you are practicing on — the board makes no league claims." },
  { audience: "kid", title: "Arrow cheat sheet", body: "Solid white = pass. Gold dashed = run without the ball. Wavy purple = dribble. Draw them, then press ▶ to see the idea." },
  { audience: "parent", title: "Frame-by-frame plays", body: "Frame 1 is the start. Tap ＋ Frame, move players, repeat. Playback eases everyone into place so kids can see the shape of the idea." },
  { audience: "kid", title: "Win the next five yards", body: "After you pass, don't freeze — take three steps into a new space. That small move often opens the give-and-go." },
  { audience: "parent", title: "Saved plays stay private", body: "Names and notes live only in this browser on this device. Export JSON or PNG if you want a copy for later — nothing is uploaded." },
  { audience: "kid", title: "Pressing trap idea", body: "Let them go wide, then close the ball, block the pass back, and cover inside. Patience first — then spring." },
];

/* ---------- generic preset drills (made-up examples, not from any real team) ---------- */
const H = (n, role, x, y) => ({ id: "h" + n, team: "home", num: n, role, x, y });
const A = (n, role, x, y) => ({ id: "a" + n, team: "away", num: n, role, x, y });
const ar = (type, x1, y1, x2, y2) => ({ type, x1, y1, x2, y2 });
const PRESETS = [
  { id: "overlap", name: "Overlap on the wing", fmt: "Any format", desc: "Full-back passes to the winger, sprints around the outside, gets it back and crosses.",
    pieces: [H(2,"RB",52,58), H(7,"RW",68,60), H(8,"CM",56,44), H(9,"ST",78,34), H(11,"LW",76,16), A(3,"LB",78,57), A(4,"CB",88,27), A(5,"CB",88,40), A(1,"GK",102,34)],
    frames: [
      { b: [54, 58.6], a: [ar("pass", 54, 58.5, 66, 60)] },
      { b: [69.6, 60.6], a: [ar("run", 53, 60, 84, 64.5), ar("dribble", 69, 59, 76, 51)] },
      { m: { h2: [85, 64], h7: [76, 51], a3: [79, 54] }, b: [77.6, 51.6], a: [ar("pass", 77.5, 52.5, 84.5, 63), ar("run", 79, 34, 95.5, 31.5), ar("run", 77, 17, 92.5, 25.5)] },
      { m: { h9: [95, 31], h11: [93, 25], a4: [91, 27], a5: [92, 38] }, b: [86.6, 63.4], a: [ar("pass", 86.5, 63, 95, 32.5)] },
      { m: { h9: [96.5, 32] }, b: [97.6, 33], a: [ar("pass", 98, 33, 104.6, 35.5)] },
      { b: [106, 35.4], a: [] } ] },
  { id: "givego", name: "Give-and-go (wall pass)", fmt: "Any format", desc: "Pass to a teammate, burst past your defender, and get the ball straight back.",
    pieces: [H(10,"CAM",58,36), H(9,"ST",72,30), A(6,"DM",66,36), A(4,"CB",86,27), A(5,"CB",88,40), A(1,"GK",102,34)],
    frames: [
      { b: [59.6, 37], a: [ar("pass", 60, 36.5, 70.5, 30.5)] },
      { b: [73.6, 31], a: [ar("run", 59, 37.5, 77, 40.5), ar("pass", 73.5, 31.5, 78, 39.5)] },
      { m: { h10: [79, 40.5], a6: [69, 38] }, b: [80.6, 41.2], a: [ar("pass", 81, 41, 104.6, 36)] },
      { b: [106, 36], a: [] } ] },
  { id: "corner", name: "Corner kick: near-post run", fmt: "Any format", desc: "Striker attacks the near post, flicks it on, and a teammate finishes at the far post.",
    pieces: [H(7,"RW",104.6,68.6), H(9,"ST",88,35), H(5,"CB",86,27), H(4,"CB",84,41), H(8,"CM",80,47),
             A(1,"GK",103.5,34), A(2,"RB",104.3,39), A(4,"CB",96,32), A(5,"CB",95,38), A(6,"DM",92,28), A(8,"CM",88,45)],
    frames: [
      { b: [104.2, 67.3], a: [ar("run", 88.5, 36, 99.5, 38.8), ar("run", 86.5, 27.5, 99, 30), ar("run", 84.5, 40.5, 94, 34.5)] },
      { m: { h9: [99.5, 39], h5: [99, 30], h4: [94, 34.5], a5: [97, 41], a4: [96.5, 32.5] }, a: [ar("pass", 104, 67, 100.6, 40.6)] },
      { b: [100.8, 40.4], a: [ar("pass", 100.4, 39.4, 99.5, 31.4)] },
      { b: [100.4, 31.4], a: [ar("pass", 100.8, 31.5, 104.6, 33.2)] },
      { b: [106, 33.2], a: [] } ] },
  { id: "goalkick", name: "Goal kick build-out", fmt: "Any format", desc: "Center-backs split wide, the midfielder drops in, and the team passes out from the back.",
    pieces: [H(1,"GK",4,34), H(4,"LCB",18,27), H(5,"RCB",18,41), H(3,"LB",30,8), H(2,"RB",30,60), H(6,"DM",34,34), H(8,"CM",46,46),
             A(9,"ST",28,29), A(10,"CAM",31,45), A(11,"LW",40,20)],
    frames: [
      { b: [5.6, 35.2], a: [ar("run", 18, 26, 13, 10.5), ar("run", 18, 42, 13, 57.5), ar("run", 34, 34, 26.5, 34), ar("run", 30, 61, 42, 63)] },
      { m: { h4: [13, 10], h5: [13, 58], h6: [26, 34], h2: [42, 63] }, a: [ar("pass", 6, 35.5, 12.5, 56.5)] },
      { m: { a10: [20, 52] }, b: [14.6, 58.8], a: [ar("pass", 14.8, 57.5, 25, 35.6)] },
      { m: { a9: [24, 30] }, b: [27.6, 35.2], a: [ar("pass", 28, 35.5, 44.8, 45.6)] },
      { b: [47.6, 46.6], a: [ar("dribble", 48, 46.5, 59, 46)] },
      { m: { h8: [60, 46] }, b: [61.6, 46.8], a: [] } ] },
  { id: "3v2", name: "3v2 attack", fmt: "Any format", desc: "Three attackers against two defenders: draw a defender, pass, and find the free player.",
    pieces: [H(7,"LW",52,14), H(9,"ST",54,34), H(11,"RW",52,54), A(4,"CB",78,28), A(5,"CB",78,40), A(1,"GK",102,34)],
    frames: [
      { b: [55.6, 35], a: [ar("dribble", 56, 34.5, 67.5, 34.5), ar("run", 53, 14, 71.5, 16), ar("run", 53, 54, 71.5, 52)] },
      { m: { h9: [68, 34], h7: [72, 16], h11: [72, 52], a4: [76, 30], a5: [76, 38] }, b: [69.6, 35], a: [ar("pass", 70, 35.5, 71.5, 50.4)] },
      { m: { a5: [79, 45] }, b: [73.6, 52.6], a: [ar("dribble", 73.5, 52, 83.5, 48.4), ar("run", 68.5, 34, 90.5, 37), ar("run", 72.5, 16, 91.5, 27)] },
      { m: { h11: [84, 48], h9: [91, 37], h7: [92, 27], a5: [83, 43.5], a4: [90, 29.5] }, b: [85.6, 49], a: [ar("pass", 86, 48, 90.4, 38.6)] },
      { b: [92.6, 38], a: [ar("pass", 93, 37.5, 104.6, 32)] },
      { b: [106, 32], a: [] } ] },
  { id: "press", name: "Pressing trap on the sideline", fmt: "Any format", desc: "Let them pass wide, then close the ball, block the pass back and cover inside to win it.",
    pieces: [H(9,"ST",76,30), H(7,"RW",70,52), H(11,"LW",70,16), H(8,"CM",64,40), H(6,"DM",60,30), H(2,"RB",56,60),
             A(1,"GK",101,34), A(4,"CB",92,24), A(5,"CB",91,44), A(3,"LB",84,61), A(2,"RB",84,7), A(6,"DM",80,34), A(8,"CM",72,45)],
    frames: [
      { b: [89.4, 45.2], a: [ar("pass", 89.4, 45.6, 85.4, 59.4)] },
      { b: [82.6, 59.6], a: [ar("run", 71, 53, 79.5, 57.5), ar("run", 77, 31, 86, 45.5), ar("run", 65, 41, 75, 51), ar("run", 57, 61, 70, 63)] },
      { m: { h7: [80, 57.5], h9: [86, 46], h8: [75, 51.5], h2: [70, 63] }, a: [ar("dribble", 80.5, 58, 83, 60)] },
      { m: { h7: [82.5, 60], h3: null, a3: [86, 63.5] }, b: [81.4, 58.4], a: [ar("pass", 81.5, 58, 85.4, 47.5)] },
      { b: [87.4, 47.2], a: [ar("pass", 88, 46.5, 104.6, 37)] },
      { b: [106, 37], a: [] } ] },
  { id: "switch", name: "Switch of play", fmt: "Any format", desc: "Draw pressure to one touchline, then a long diagonal opens the weak-side winger.",
    pieces: [H(6,"DM",48,34), H(8,"CM",56,48), H(7,"RW",62,60), H(11,"LW",70,12), H(9,"ST",78,30),
             A(6,"DM",58,36), A(8,"CM",64,50), A(3,"LB",72,58), A(4,"CB",86,28), A(5,"CB",88,42), A(1,"GK",102,34)],
    frames: [
      { b: [49.6, 35], a: [ar("pass", 50, 35, 56.5, 48), ar("run", 63, 61, 74, 62)] },
      { m: { h7: [74, 62], a3: [76, 60] }, b: [58.6, 48.6], a: [ar("dribble", 58.5, 48.5, 66, 54), ar("run", 71, 12, 88, 16)] },
      { m: { h8: [66, 54], h11: [88, 16], a8: [70, 52] }, b: [67.6, 54.4], a: [ar("pass", 68, 54, 87.5, 17.5)] },
      { b: [89.6, 17.2], a: [ar("dribble", 89.5, 17, 96, 22), ar("run", 79, 30, 94, 28)] },
      { m: { h11: [96, 22], h9: [94, 28], a4: [92, 24] }, b: [97.6, 22.6], a: [ar("pass", 97.5, 23, 94.5, 28.5)] },
      { b: [95.6, 28.8], a: [ar("pass", 95.5, 29, 104.6, 34)] },
      { b: [106, 34], a: [] } ] },
  { id: "boxdef", name: "Defend the box", fmt: "Any format", desc: "Back line drops, midfield screens, and the first defender forces the attacker wide.",
    pieces: [H(1,"GK",102,34), H(4,"LCB",88,24), H(5,"RCB",88,44), H(3,"LB",82,10), H(2,"RB",82,58), H(6,"DM",76,34),
             A(9,"ST",68,34), A(10,"CAM",60,40), A(7,"RW",62,56), A(11,"LW",64,14)],
    frames: [
      { b: [64.6, 41], a: [ar("pass", 61, 41, 67.5, 35), ar("run", 63, 56, 78, 52), ar("run", 65, 14, 78, 18)] },
      { m: { a9: [70, 34], a7: [78, 52], a11: [78, 18] }, b: [71.6, 34.6], a: [ar("dribble", 71.5, 34.5, 80, 36), ar("run", 76, 34, 84, 36), ar("run", 88, 24, 90, 28), ar("run", 88, 44, 90, 40)] },
      { m: { a9: [80, 36], h6: [84, 36], h4: [90, 28], h5: [90, 40] }, b: [81.6, 36.4], a: [ar("pass", 81.5, 36.5, 79, 50.5)] },
      { m: { a7: [80, 50] }, b: [80.6, 51], a: [ar("run", 82, 58, 86, 54), ar("run", 84, 36, 88, 48)] },
      { m: { h2: [86, 54], h6: [88, 48], a7: [84, 52] }, b: [83.4, 51.4], a: [ar("pass", 83, 51.5, 74, 40)] },
      { b: [72.6, 40.2], a: [] } ] },
];
function presetPlay(p) {
  let pieces = p.pieces.map((q) => ({ ...q })), ball = { x: L / 2, y: W / 2 }; const frames = [];
  p.frames.forEach((f) => {
    pieces = pieces.map((q) => ({ ...q }));
    if (f.m) for (const id in f.m) { const q = pieces.find((z) => z.id === id); if (q && f.m[id]) { q.x = f.m[id][0]; q.y = f.m[id][1]; } }
    if (f.b) ball = { x: f.b[0], y: f.b[1] };
    frames.push({ pieces, ball: { ...ball }, arrows: (f.a || []).map((a) => ({ ...a })) });
  });
  return { name: p.name, notes: p.desc + " (Generic example.)", format: 11, homeForm: "", awayForm: "", preset: p.id, frames, cur: 0 };
}

/* ---------- state ---------- */
let S = newPlay(9);
let showAway = true, showRoles = false, showGhost = true, tool = "move", speed = 1;
const undo = [];
let anim = null;
let view = { s: 8, vertical: false, w: 100, h: 60 };
let drag = null, drawing = null, erasing = null, dirty = true;
const cv = $("#pitch"), ctx = cv.getContext("2d");

function newPlay(fmt) {
  return { name: "", notes: "", format: fmt, homeForm: DEFAULT_FORM[fmt], awayForm: DEFAULT_FORM[fmt], preset: null, frames: [formationFrame(fmt, DEFAULT_FORM[fmt], DEFAULT_FORM[fmt])], cur: 0 };
}
const snap = () => JSON.stringify(S);
function pushUndo(s) { undo.push(s || snap()); if (undo.length > 150) undo.shift(); }
function doUndo() { stopAnim(); if (!undo.length) return toast("Nothing to undo"); S = JSON.parse(undo.pop()); changed(); toast("Undone"); }
function frame() { return S.frames[S.cur]; }
function changed() { dirty = true; refreshUI(); try { localStorage.setItem(LS_CUR, snap()); } catch (e) {} }

/* ---------- layout / view ---------- */
function layout() {
  const wrap = $("#pitchwrap"), Wd = wrap.clientWidth;
  const vertical = window.innerWidth < 620;
  let s = vertical ? Wd / (W + 2 * M) : Wd / (L + 2 * M);
  if (!vertical && window.innerWidth > 860) {
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    const tl = $("#timeline").offsetHeight || 90;
    const maxH = Math.max(300, window.innerHeight - top - tl - 40);
    s = Math.min(s, maxH / (W + 2 * M));
  }
  const w = vertical ? (W + 2 * M) * s : (L + 2 * M) * s, h = vertical ? (L + 2 * M) * s : (W + 2 * M) * s;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  cv.style.width = w + "px"; cv.style.height = h + "px"; cv.style.margin = "0 auto";
  view = { s, vertical, w, h, dpr }; dirty = true;
  drawFormViz();
}
function toScreen(x, y, v = view) { return v.vertical ? [(y + M) * v.s, (L - x + M) * v.s] : [(x + M) * v.s, (y + M) * v.s]; }
function toLogical(px, py, v = view) { return v.vertical ? [L + M - py / v.s, px / v.s - M] : [px / v.s - M, py / v.s - M]; }
function setLogical(c, v) { const k = v.dpr, s = v.s;
  if (v.vertical) c.setTransform(0, -s * k, s * k, 0, M * s * k, (L + M) * s * k); else c.setTransform(s * k, 0, 0, s * k, M * s * k, M * s * k); }
const discR = (v = view) => Math.max(2.0 * v.s, 11);
const ballR = (v = view) => Math.max(1.05 * v.s, 6.5);

/* ---------- formation mini preview ---------- */
function drawFormViz() {
  const host = $("#formViz"); if (!host) return;
  const sides = [
    { key: "home", label: "Hornets", form: S.homeForm || DEFAULT_FORM[S.format], team: "home" },
    { key: "away", label: "Away", form: S.awayForm || DEFAULT_FORM[S.format], team: "away" },
  ];
  host.innerHTML = "";
  sides.forEach((side) => {
    const wrap = document.createElement("div"); wrap.className = "mini";
    const cap = document.createElement("div"); cap.className = "cap";
    cap.textContent = side.label + (side.form ? " · " + side.form : " · drill");
    const c = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 140, h = 70; c.width = w * dpr; c.height = h * dpr; c.style.width = w + "px"; c.style.height = h + "px";
    const g = c.getContext("2d"); g.scale(dpr, dpr);
    g.fillStyle = "#1c7a36"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 1; g.strokeRect(4, 4, w - 8, h - 8);
    g.beginPath(); g.moveTo(w / 2, 4); g.lineTo(w / 2, h - 4); g.stroke();
    const form = side.form || DEFAULT_FORM[S.format];
    const pieces = teamPieces(side.team, form, S.format).filter((p) => p.team === side.team);
    pieces.forEach((p) => {
      const nx = 4 + (p.x / L) * (w - 8), ny = 4 + (p.y / W) * (h - 8);
      g.beginPath(); g.arc(nx, ny, p.role === "GK" ? 3.2 : 2.6, 0, Math.PI * 2);
      if (side.team === "home") { g.fillStyle = p.role === "GK" ? "#f5c518" : "#1f8a3b"; g.strokeStyle = "#f5c518"; }
      else { g.fillStyle = p.role === "GK" ? "#1e293b" : "#2563eb"; g.strokeStyle = "#fff"; }
      g.fill(); g.lineWidth = 1.2; g.stroke();
    });
    wrap.append(cap, c); host.append(wrap);
  });
}

/* ---------- drawing ---------- */
function drawPitch(c, v) {
  setLogical(c, v);
  c.fillStyle = "#1c7a36"; c.fillRect(-M, -M, L + 2 * M, W + 2 * M);
  const bands = 14, bw = L / bands;
  for (let i = 0; i < bands; i++) { c.fillStyle = i % 2 ? "#2a9445" : "#238a3e"; c.fillRect(i * bw, 0, bw, W); }
  // soft center watermark
  c.save(); c.globalAlpha = 0.07; c.fillStyle = "#f5c518";
  c.beginPath(); c.arc(L / 2, W / 2, 16, 0, Math.PI * 2); c.fill(); c.restore();
  c.strokeStyle = "rgba(255,255,255,.95)"; c.lineWidth = 0.32; c.lineJoin = "round";
  c.strokeRect(0, 0, L, W);
  c.beginPath(); c.moveTo(L / 2, 0); c.lineTo(L / 2, W); c.stroke();
  c.beginPath(); c.arc(L / 2, W / 2, 9.15, 0, Math.PI * 2); c.stroke();
  const spot = (x, y) => { c.beginPath(); c.arc(x, y, 0.45, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill(); };
  spot(L / 2, W / 2);
  for (const side of [0, 1]) {
    const X = (x) => (side ? L - x : x);
    c.strokeRect(Math.min(X(0), X(16.5)), W / 2 - 20.16, 16.5, 40.32);
    c.strokeRect(Math.min(X(0), X(5.5)), W / 2 - 9.16, 5.5, 18.32);
    spot(X(11), W / 2);
    const a = Math.acos(5.5 / 9.15);
    c.beginPath(); if (side) c.arc(L - 11, W / 2, 9.15, Math.PI - a, Math.PI + a); else c.arc(11, W / 2, 9.15, -a, a); c.stroke();
    c.save(); c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(side ? L : -2.2, W / 2 - 3.66, 2.2, 7.32);
    c.strokeStyle = "#fff"; c.lineWidth = 0.4; c.strokeRect(side ? L : -2.2, W / 2 - 3.66, 2.2, 7.32);
    c.lineWidth = 0.08; c.strokeStyle = "rgba(255,255,255,.55)";
    for (let k = 1; k < 7; k++) { c.beginPath(); c.moveTo(side ? L : -2.2, W / 2 - 3.66 + k * 1.046); c.lineTo(side ? L + 2.2 : 0, W / 2 - 3.66 + k * 1.046); c.stroke(); }
    c.restore();
  }
  for (const [x, y, a0] of [[0, 0, 0], [L, 0, Math.PI / 2], [L, W, Math.PI], [0, W, Math.PI * 1.5]]) { c.beginPath(); c.arc(x, y, 1, a0, a0 + Math.PI / 2); c.stroke(); }
}
const ARROW_COL = { pass: "#ffffff", run: "#ffd84d", dribble: "#e5c7ff" };
function arrowPath(c, a) {
  const dx = a.x2 - a.x1, dy = a.y2 - a.y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, head = 1.9;
  const ex = a.x2 - ux * head * 0.8, ey = a.y2 - uy * head * 0.8;
  c.beginPath(); c.moveTo(a.x1, a.y1);
  if (a.type === "dribble") {
    const waveLen = Math.max(0, len - head * 1.6), steps = Math.max(8, Math.round(waveLen * 4));
    for (let i = 1; i <= steps; i++) { const t = (i / steps) * waveLen, off = Math.sin((t / 2.4) * Math.PI * 2) * 0.75;
      c.lineTo(a.x1 + ux * t - uy * off, a.y1 + uy * t + ux * off); }
    c.lineTo(ex, ey);
  } else c.lineTo(ex, ey);
  return { ux, uy, head };
}
function drawArrow(c, a, alpha = 1) {
  c.save(); c.globalAlpha = alpha; c.lineCap = "round"; c.lineJoin = "round";
  for (const pass of [0, 1]) {
    const { ux, uy, head } = arrowPath(c, a);
    c.setLineDash(a.type === "run" ? [1.5, 1.1] : []);
    c.strokeStyle = pass ? ARROW_COL[a.type] || "#fff" : "rgba(0,0,0,.35)"; c.lineWidth = pass ? 0.5 : 0.95; c.stroke();
    c.setLineDash([]);
    c.beginPath(); c.moveTo(a.x2, a.y2);
    c.lineTo(a.x2 - ux * head - uy * head * 0.62, a.y2 - uy * head + ux * head * 0.62);
    c.lineTo(a.x2 - ux * head + uy * head * 0.62, a.y2 - uy * head - ux * head * 0.62); c.closePath();
    if (pass) { c.fillStyle = ARROW_COL[a.type] || "#fff"; c.fill(); } else { c.lineWidth = 0.5; c.strokeStyle = "rgba(0,0,0,.35)"; c.stroke(); }
  }
  c.restore();
}
function pieceColors(p) {
  if (p.team === "home") return p.role === "GK" ? ["#f5c518", "#0f3d22", "#0f3d22"] : ["#1f8a3b", "#f5c518", "#fff6c9"];
  return p.role === "GK" ? ["#1e293b", "#e2e8f0", "#ffffff"] : ["#2563eb", "#ffffff", "#ffffff"];
}
function drawPiece(c, v, p, opts = {}) {
  const [x, y] = toScreen(p.x, p.y, v), r = discR(v), k = v.dpr;
  c.setTransform(k, 0, 0, k, 0, 0); c.save(); c.globalAlpha = opts.alpha ?? 1;
  const [fill, ring, txt] = pieceColors(p);
  if (!opts.ghost) { c.beginPath(); c.ellipse(x + r * 0.12, y + r * 0.22, r * 1.02, r * 0.95, 0, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.28)"; c.fill(); }
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill();
  c.lineWidth = Math.max(2.5, r * 0.2); c.strokeStyle = ring; c.stroke();
  if (p.team === "home" && p.role !== "GK" && !opts.ghost) {
    c.save(); c.beginPath(); c.arc(x, y, r - c.lineWidth / 2, 0, Math.PI * 2); c.clip();
    c.fillStyle = "rgba(15,61,34,.35)"; c.fillRect(x - r, y + r * 0.42, 2 * r, r * 0.22); c.restore(); }
  if (opts.sel) { c.beginPath(); c.arc(x, y, r + 4, 0, Math.PI * 2); c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 2; c.setLineDash([4, 3]); c.stroke(); c.setLineDash([]); }
  if (!opts.ghost) {
    const label = showRoles ? p.role : String(p.num);
    const fs = showRoles ? Math.max(8, r * (label.length > 2 ? 0.62 : 0.78)) : Math.max(10, r * 0.95);
    c.fillStyle = txt; c.font = `800 ${fs}px system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif`;
    c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(label, x, y + fs * 0.05);
  }
  c.restore();
}
function ballScreen(b, pieces, v = view) {
  let [x, y] = toScreen(b.x, b.y, v); const need = discR(v) + ballR(v) * 0.55;
  for (const p of pieces) { if (!visible(p)) continue; const [px, py] = toScreen(p.x, p.y, v); let dx = x - px, dy = y - py, d = Math.hypot(dx, dy);
    if (d < need) { if (d < 0.01) { dx = 0.7; dy = 0.7; d = 1; } x = px + (dx / d) * need; y = py + (dy / d) * need; } }
  return [x, y];
}
function drawBall(c, v, b, alpha = 1, pieces = []) {
  const [x, y] = ballScreen(b, pieces, v), r = ballR(v), k = v.dpr;
  c.setTransform(k, 0, 0, k, 0, 0); c.save(); c.globalAlpha = alpha;
  c.beginPath(); c.arc(x + 1.5, y + 2, r, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.3)"; c.fill();
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill(); c.lineWidth = 1.4; c.strokeStyle = "#111"; c.stroke();
  c.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; c.lineTo(x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42); }
  c.closePath(); c.fillStyle = "#111"; c.fill();
  c.restore();
}
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function visible(p) { return p.team === "home" || showAway; }
function renderedFrame() {
  if (!anim) return { f: frame(), arrows: frame().arrows, arrowAlpha: 1 };
  const i = Math.min(Math.floor(anim.pos), S.frames.length - 1), t = anim.pos - i, A0 = S.frames[i], B = S.frames[i + 1];
  if (!B || t === 0) return { f: A0, arrows: A0.arrows, arrowAlpha: 1 };
  const e = ease(t), byId = {}; B.pieces.forEach((p) => (byId[p.id] = p));
  const pieces = A0.pieces.map((p) => { const q = byId[p.id] || p; return { ...p, x: p.x + (q.x - p.x) * e, y: p.y + (q.y - p.y) * e }; });
  const ball = { x: A0.ball.x + (B.ball.x - A0.ball.x) * e, y: A0.ball.y + (B.ball.y - A0.ball.y) * e };
  return { f: { pieces, ball }, arrows: A0.arrows, arrowAlpha: t < 0.6 ? 1 : Math.max(0, 1 - (t - 0.6) / 0.4) };
}
function render(c = ctx, v = view, opts = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  drawPitch(c, v);
  const R = renderedFrame();
  if (showGhost && !anim && S.cur > 0 && !opts.export) {
    const prev = S.frames[S.cur - 1], cur = {}; R.f.pieces.forEach((p) => (cur[p.id] = p));
    prev.pieces.forEach((p) => { const q = cur[p.id]; if (!q || !visible(p) || Math.hypot(q.x - p.x, q.y - p.y) < 0.8) return;
      setLogical(c, v); c.save(); c.setLineDash([0.6, 0.9]); c.lineWidth = 0.3; c.strokeStyle = "rgba(255,255,255,.55)";
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); c.restore();
      drawPiece(c, v, p, { ghost: true, alpha: 0.33 }); });
    const pb = prev.ball; if (Math.hypot(pb.x - R.f.ball.x, pb.y - R.f.ball.y) > 0.8) drawBall(c, v, pb, 0.3);
  }
  setLogical(c, v);
  R.arrows.forEach((a) => drawArrow(c, a, R.arrowAlpha));
  if (drawing) { setLogical(c, v); drawArrow(c, drawing, 0.85); }
  R.f.pieces.filter(visible).forEach((p) => drawPiece(c, v, p, { sel: drag && drag.id === p.id }));
  drawBall(c, v, R.f.ball, 1, R.f.pieces);
}

/* ---------- animation ---------- */
function startAnim(target) {
  if (S.frames.length < 2) return toast("Add a second frame (＋ Frame) to animate");
  if (target === undefined) { if (S.cur >= S.frames.length - 1) S.cur = 0; target = S.frames.length - 1; }
  anim = { pos: S.cur, target, t0: performance.now() }; refreshUI();
}
function stopAnim() { if (!anim) return; S.cur = Math.round(Math.min(anim.pos, S.frames.length - 1)); anim = null; refreshUI(); dirty = true; }
let lastT = performance.now();
function tick(now) {
  const dt = Math.min(64, now - lastT); lastT = now;
  if (anim) {
    anim.pos = Math.min(anim.target, anim.pos + (dt / 1150) * speed);
    const fi = Math.floor(anim.pos + 1e-9);
    if (fi !== S.cur) { S.cur = Math.min(fi, S.frames.length - 1); refreshChips(); }
    if (anim.pos >= anim.target - 1e-9) { S.cur = anim.target; anim = null; refreshUI(); }
    dirty = true;
  }
  if (dirty) { render(); dirty = false; }
  requestAnimationFrame(tick);
}

/* ---------- pointer interaction ---------- */
function evtLogical(e) { const r = cv.getBoundingClientRect(); return toLogical(e.clientX - r.left, e.clientY - r.top); }
function hit(x, y) {
  const f = frame(), rp = (discR() + 4) / view.s;
  const [bx, by] = ballScreen(f.ball, f.pieces), [qx, qy] = toScreen(x, y);
  if (Math.hypot(bx - qx, by - qy) <= ballR() + 6) return { kind: "ball" };
  for (let i = f.pieces.length - 1; i >= 0; i--) { const p = f.pieces[i]; if (visible(p) && Math.hypot(p.x - x, p.y - y) <= rp) return { kind: "piece", id: p.id }; }
  return null;
}
const clampX = (x) => Math.max(-3, Math.min(L + 3, x)), clampY = (y) => Math.max(-3, Math.min(W + 3, y));
function distSeg(px, py, a) { const dx = a.x2 - a.x1, dy = a.y2 - a.y1, l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - a.x1) * dx + (py - a.y1) * dy) / l2)); return Math.hypot(px - (a.x1 + t * dx), py - (a.y1 + t * dy)); }
function eraseAt(x, y) {
  const f = frame(), tol = Math.max(1.6, 14 / view.s), before = f.arrows.length;
  const keep = f.arrows.filter((a) => distSeg(x, y, a) > tol);
  if (keep.length !== before) { if (!erasing.pushed) { pushUndo(erasing.snap); erasing.pushed = true; } f.arrows = keep; changed(); }
}
cv.addEventListener("pointerdown", (e) => {
  e.preventDefault(); stopAnim();
  const [x, y] = evtLogical(e); cv.setPointerCapture(e.pointerId);
  if (tool === "move") {
    const h = hit(x, y); if (!h) return;
    const obj = h.kind === "ball" ? frame().ball : frame().pieces.find((p) => p.id === h.id);
    drag = { ...h, obj, dx: obj.x - x, dy: obj.y - y, snap: snap(), moved: false, pid: e.pointerId }; cv.classList.add("drag");
  } else if (tool === "erase") { erasing = { snap: snap(), pushed: false }; eraseAt(x, y); }
  else {
    const h = hit(x, y); let sx = x, sy = y;
    if (h) { const o = h.kind === "ball" ? frame().ball : frame().pieces.find((p) => p.id === h.id); sx = o.x; sy = o.y; }
    drawing = { type: tool, x1: sx, y1: sy, x2: sx, y2: sy };
  }
  dirty = true;
});
cv.addEventListener("pointermove", (e) => {
  if (!drag && !drawing && !erasing) return;
  const [x, y] = evtLogical(e);
  if (drag) { if (!drag.moved) { pushUndo(drag.snap); drag.moved = true; } drag.obj.x = +clampX(x + drag.dx).toFixed(2); drag.obj.y = +clampY(y + drag.dy).toFixed(2); dirty = true; }
  else if (drawing) { drawing.x2 = clampX(x); drawing.y2 = clampY(y); dirty = true; }
  else if (erasing) eraseAt(x, y);
});
function endPointer() {
  if (drag) { if (drag.moved) changed(); drag = null; cv.classList.remove("drag"); }
  if (drawing) { const a = drawing; drawing = null;
    if (Math.hypot(a.x2 - a.x1, a.y2 - a.y1) > 2.2) { pushUndo(); const r2 = (v) => +v.toFixed(2);
      frame().arrows.push({ type: a.type, x1: r2(a.x1), y1: r2(a.y1), x2: r2(a.x2), y2: r2(a.y2) }); changed(); } }
  erasing = null; dirty = true;
}
cv.addEventListener("pointerup", endPointer); cv.addEventListener("pointercancel", endPointer);

/* ---------- UI wiring ---------- */
function setTool(t) { tool = t; document.querySelectorAll(".tool").forEach((b) => b.classList.toggle("on", b.dataset.tool === t)); cv.classList.toggle("draw", t !== "move"); }
document.querySelectorAll(".tool").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.tool)));
$("#btnUndo").onclick = doUndo;
$("#btnClearArrows").onclick = () => { if (!frame().arrows.length) return toast("No arrows on this frame"); pushUndo(); frame().arrows = []; changed(); };
$("#btnReset").onclick = () => { stopAnim(); pushUndo();
  if (S.preset) { const p = PRESETS.find((q) => q.id === S.preset); const fresh = presetPlay(p); S.frames[S.cur].pieces = fresh.frames[0].pieces; S.frames[S.cur].ball = fresh.frames[0].ball; }
  else { const f = formationFrame(S.format, S.homeForm, S.awayForm); S.frames[S.cur].pieces = f.pieces; S.frames[S.cur].ball = f.ball; }
  changed(); toast("Players back in position"); };
$("#btnFirst").onclick = () => { stopAnim(); S.cur = 0; changed(); };
$("#btnPrev").onclick = () => { stopAnim(); if (S.cur > 0) { S.cur--; changed(); } };
$("#btnNext").onclick = () => { if (anim) { stopAnim(); } if (S.cur < S.frames.length - 1) startAnim(S.cur + 1); else toast("Last frame"); };
$("#btnPlay").onclick = () => (anim ? stopAnim() : startAnim());
$("#speed").onchange = (e) => (speed = +e.target.value);
$("#btnAddFrame").onclick = () => { stopAnim(); pushUndo(); const f = JSON.parse(JSON.stringify(frame())); f.arrows = [];
  S.frames.splice(S.cur + 1, 0, f); S.cur++; changed(); toast(`Frame ${S.cur + 1} added. Now move players`); };
$("#btnDelFrame").onclick = () => { stopAnim(); if (S.frames.length < 2) return toast("A play needs at least one frame"); pushUndo();
  S.frames.splice(S.cur, 1); S.cur = Math.min(S.cur, S.frames.length - 1); changed(); };
document.querySelectorAll("#formatSeg button").forEach((b) => b.onclick = () => { stopAnim(); pushUndo(); S = newPlay(+b.dataset.format); changed(); toast(`${b.dataset.format}v${b.dataset.format} board ready`); });
function fillForms() {
  const fmt = S.format, opts = Object.keys(FORMATIONS[fmt]).map((k) => `<option value="${k}">${k}</option>`).join("");
  for (const [sel, key] of [["#homeForm", "homeForm"], ["#awayForm", "awayForm"]]) { const el = $(sel); el.innerHTML = (S.preset ? `<option value="">Drill layout</option>` : "") + opts; el.value = S[key] || ""; }
}
for (const [sel, key] of [["#homeForm", "homeForm"], ["#awayForm", "awayForm"]]) $(sel).onchange = (e) => {
  stopAnim(); pushUndo(); const v = e.target.value; if (!v) return;
  if (S.preset) { const fmt = S.format; S = newPlay(fmt); }
  S[key] = v; const f = formationFrame(S.format, S.homeForm, S.awayForm);
  S.frames = [f]; S.cur = 0; changed(); toast(`${key === "homeForm" ? "Hornets" : "Away"}: ${v}`); };
$("#chkAway").onchange = (e) => { showAway = e.target.checked; dirty = true; };
$("#chkRoles").onchange = (e) => { showRoles = e.target.checked; dirty = true; };
$("#chkGhost").onchange = (e) => { showGhost = e.target.checked; dirty = true; };
$("#notes").oninput = (e) => { S.notes = e.target.value; try { localStorage.setItem(LS_CUR, snap()); } catch (er) {} };

function loadPreset(id) { const p = PRESETS.find((q) => q.id === id); if (!p) return false; stopAnim(); pushUndo(); S = presetPlay(p); changed(); toast(`Loaded: ${p.name}. Press ▶`); return true; }
$("#presetList").innerHTML = PRESETS.map((p) => `<button class="preset" data-id="${p.id}"><b>${p.name}<em>Generic example</em></b><small>${p.desc}</small><small>${p.frames.length} frames · ${p.fmt}</small></button>`).join("");
document.querySelectorAll(".preset").forEach((b) => (b.onclick = () => { loadPreset(b.dataset.id); if (window.innerWidth < 860) $("#pitchwrap").scrollIntoView({ behavior: "smooth", block: "center" }); }));

function renderPracticeNotes() {
  const el = $("#practiceNotes"); if (!el) return;
  el.innerHTML = PRACTICE_NOTES.map((n) => {
    const who = n.audience === "kid" ? "For players" : "For parents / coaches";
    const cls = n.audience === "kid" ? "kid" : "parent";
    return `<article class="pnote"><div class="who ${cls}">${who}</div><strong>${n.title}</strong><p>${n.body}</p></article>`;
  }).join("");
}

/* ---------- save / load / export ---------- */
function getPlays() { try { return JSON.parse(localStorage.getItem(LS_PLAYS) || "{}"); } catch (e) { return {}; } }
function setPlays(p) { localStorage.setItem(LS_PLAYS, JSON.stringify(p)); }
function savePlay(name) {
  name = (name || "").trim(); if (!name) { toast("Type a name first"); $("#playName").focus(); return false; }
  const plays = getPlays(); S.name = name; plays[name] = JSON.parse(snap()); plays[name].savedAt = new Date().toISOString(); setPlays(plays); changed(); toast(`Saved “${name}”`); return true;
}
function loadSaved(name) { const p = getPlays()[name]; if (!p) return false; stopAnim(); pushUndo(); S = sanitize(p); changed(); toast(`Loaded “${name}”`); return true; }
function sanitize(p) {
  if (!p || !Array.isArray(p.frames) || !p.frames.length) throw new Error("No frames in file");
  const num = (v, d) => (typeof v === "number" && isFinite(v) ? v : d);
  const frames = p.frames.map((f) => ({
    pieces: (f.pieces || []).slice(0, 40).map((q, i) => ({ id: String(q.id || "p" + i), team: q.team === "away" ? "away" : "home", num: num(q.num, i + 1), role: String(q.role || "").slice(0, 4), x: num(q.x, 50), y: num(q.y, 34) })),
    ball: { x: num(f.ball && f.ball.x, L / 2), y: num(f.ball && f.ball.y, W / 2) },
    arrows: (f.arrows || []).slice(0, 80).filter((a) => ["pass", "run", "dribble"].includes(a.type)).map((a) => ({ type: a.type, x1: num(a.x1, 0), y1: num(a.y1, 0), x2: num(a.x2, 0), y2: num(a.y2, 0) })),
  }));
  const fmt = [7, 9, 11].includes(p.format) ? p.format : 11;
  return { name: String(p.name || "").slice(0, 40), notes: String(p.notes || "").slice(0, 2000), format: fmt, homeForm: FORMATIONS[fmt][p.homeForm] ? p.homeForm : "", awayForm: FORMATIONS[fmt][p.awayForm] ? p.awayForm : "",
    preset: PRESETS.some((q) => q.id === p.preset) ? p.preset : null, frames, cur: 0 };
}
function renderSaved() {
  const plays = getPlays(), names = Object.keys(plays).sort((a, b) => (plays[b].savedAt || "").localeCompare(plays[a].savedAt || ""));
  const el = $("#savedList"); el.innerHTML = names.length ? "" : `<div class="empty">No saved plays yet. Name your play and tap Save.</div>`;
  names.forEach((n) => { const d = document.createElement("div"); d.className = "item";
    const lb = document.createElement("button"); lb.className = "load"; lb.textContent = `▶ ${n} (${plays[n].frames.length})`; lb.onclick = () => loadSaved(n);
    const x = document.createElement("button"); x.className = "x"; x.textContent = "✕"; x.title = "Delete";
    x.onclick = () => { if (x.dataset.sure) { const p = getPlays(); delete p[n]; setPlays(p); renderSaved(); toast(`Deleted “${n}”`); } else { x.dataset.sure = 1; x.textContent = "Sure?"; setTimeout(() => { if (x.isConnected) { delete x.dataset.sure; x.textContent = "✕"; } }, 2500); } };
    d.append(lb, x); el.append(d); });
}
$("#btnSave").onclick = () => { if (savePlay($("#playName").value)) renderSaved(); };
$("#playName").onkeydown = (e) => { if (e.key === "Enter") $("#btnSave").click(); };
const slug = (s) => (s || "hornets-play").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "hornets-play";
function download(name, blob) { const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
function exportJSON() { const p = JSON.parse(snap()); p.cur = 0; return JSON.stringify({ app: "hornets-tactics-board", version: 1, exportedAt: new Date().toISOString(), play: p }, null, 1); }
$("#btnExportJson").onclick = () => { download(slug(S.name || $("#playName").value) + ".json", new Blob([exportJSON()], { type: "application/json" })); toast("Exported JSON"); };
$("#btnImportJson").onclick = () => $("#fileImport").click();
function importText(txt) {
  const j = JSON.parse(txt); const plays = j.play ? [j.play] : Array.isArray(j.plays) ? j.plays : [j];
  const clean = plays.map(sanitize); const store = getPlays();
  clean.forEach((p, i) => { const n = p.name || `Imported play ${i + 1}`; p.name = n; store[n] = { ...p, savedAt: new Date().toISOString() }; });
  setPlays(store); pushUndo(); S = clean[0]; changed(); renderSaved(); return clean.length;
}
$("#fileImport").onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { try { const n = importText(r.result); toast(`Imported ${n} play${n > 1 ? "s" : ""}`); } catch (er) { toast("Couldn't read that file: " + er.message); } e.target.value = ""; }; r.readAsText(f); };
function pngCanvas() {
  const s = 14, band = 64, v = { s, vertical: false, w: (L + 2 * M) * s, h: (W + 2 * M) * s, dpr: 1 };
  const c = document.createElement("canvas"); c.width = v.w; c.height = v.h + band; const x = c.getContext("2d");
  const off = document.createElement("canvas"); off.width = v.w; off.height = v.h; const oc = off.getContext("2d");
  const keep = anim; anim = null; render(oc, v, { export: true }); anim = keep;
  x.fillStyle = "#0f3d22"; x.fillRect(0, 0, c.width, band); x.fillStyle = "#f5c518"; x.fillRect(0, band - 5, c.width, 5);
  x.fillStyle = "#fff"; x.font = "800 28px system-ui,Arial,sans-serif"; x.textBaseline = "middle"; x.fillText("Hornets Tactics Board", 22, band / 2 - 2);
  x.font = "600 20px system-ui,Arial,sans-serif"; x.textAlign = "right"; x.fillStyle = "#f5e7a8";
  x.fillText(`${S.name || "Untitled play"} · frame ${S.cur + 1}/${S.frames.length}${S.preset ? " · generic example" : ""}`, c.width - 22, band / 2 - 2);
  x.drawImage(off, 0, band); return c;
}
function pngDataURL() { return pngCanvas().toDataURL("image/png"); }
$("#btnExportPng").onclick = () => { pngCanvas().toBlob((b) => { download(`${slug(S.name)}-frame-${S.cur + 1}.png`, b); toast("Saved PNG"); }, "image/png"); };
$("#btnNew").onclick = () => { stopAnim(); pushUndo(); S = newPlay(S.format); $("#playName").value = ""; changed(); toast("Fresh board"); };
$("#btnHelp").onclick = () => ($("#help").hidden = false);
$("#btnHelpClose").onclick = () => ($("#help").hidden = true);
$("#help").onclick = (e) => { if (e.target.id === "help") $("#help").hidden = true; };
document.addEventListener("keydown", (e) => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); doUndo(); return; }
  if (e.key === " ") { e.preventDefault(); $("#btnPlay").click(); }
  else if (e.key === "ArrowRight") $("#btnNext").click(); else if (e.key === "ArrowLeft") $("#btnPrev").click();
  else if (e.key === "Escape") $("#help").hidden = true;
  else { const t = { m: "move", p: "pass", r: "run", d: "dribble", e: "erase" }[e.key.toLowerCase()]; if (t && !e.ctrlKey && !e.metaKey) setTool(t); }
});

let toastT; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1900); }
function refreshChips() {
  const el = $("#frameChips"); const n = S.frames.length;
  if (el.children.length !== n) { el.innerHTML = ""; for (let i = 0; i < n; i++) { const b = document.createElement("button"); b.textContent = i + 1; b.title = `Frame ${i + 1}`; b.onclick = () => { stopAnim(); S.cur = i; changed(); }; el.append(b); } }
  [...el.children].forEach((b, i) => { b.classList.toggle("on", i === S.cur); b.classList.toggle("playing", !!anim && i === S.cur); });
  const on = el.children[S.cur]; if (on && el.scrollWidth > el.clientWidth) el.scrollLeft = on.offsetLeft - el.clientWidth / 2;
  $("#frameHint").textContent = anim ? `Playing… frame ${S.cur + 1} of ${n}` :
    n === 1 ? "Frame 1 of 1. Arrange players, then tap ＋ Frame and move them again to build a play." :
    `Frame ${S.cur + 1} of ${n}. Drag to change this step, ＋ Frame to add the next one, ▶ to watch.`;
}
function refreshUI() {
  document.querySelectorAll("#formatSeg button").forEach((b) => b.classList.toggle("on", +b.dataset.format === S.format && !S.preset));
  fillForms(); refreshChips(); drawFormViz();
  $("#btnPlay").textContent = anim ? "⏸" : "▶";
  $("#playTitle").textContent = S.name ? S.name + (S.preset ? " · generic example" : "") : "";
  document.querySelectorAll(".preset").forEach((b) => b.classList.toggle("on", b.dataset.id === S.preset));
  const n = $("#notes"); if (document.activeElement !== n) n.value = S.notes || "";
}

/* ---------- boot ---------- */
try { const saved = localStorage.getItem(LS_CUR); if (saved) { const p = JSON.parse(saved); S = sanitize(p); S.cur = Math.min(p.cur || 0, S.frames.length - 1); } } catch (e) { S = newPlay(9); }
window.addEventListener("resize", () => { layout(); });
layout(); refreshUI(); renderSaved(); renderPracticeNotes(); requestAnimationFrame(tick);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => (dirty = true));

window.HT = {
  presets: PRESETS.map((p) => ({ id: p.id, name: p.name, generic: true, frames: p.frames.length })),
  formations: FORMATIONS, practiceNotes: PRACTICE_NOTES, loadPreset, savePlay, loadSaved, exportJSON, importText, pngDataURL, doUndo,
  play: () => startAnim(), stop: stopAnim, setSpeed: (v) => { speed = v; $("#speed").value = String(v); },
  get state() { return JSON.parse(snap()); }, get playing() { return !!anim; }, get pos() { return anim ? anim.pos : S.cur; },
  get view() { return { ...view }; }, toScreen: (x, y) => toScreen(x, y), setTool,
  format: (n) => document.querySelector(`#formatSeg button[data-format="${n}"]`).click(),
};
})();
