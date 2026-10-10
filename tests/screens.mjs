// Screenshots of the offline snapshot (file://) at desktop, laptop, and phone sizes.
import { launch, sleep } from "./cdp.mjs";
import { resolve } from "node:path";
import { copyFileSync, writeFileSync } from "node:fs";
const url = "file://" + resolve("dist/hornets-tactics.html");
const b = await launch(9474);
const out = (n) => "screenshots/" + n + ".png";
const setup = async (w, h, mobile, scale) => { await b.viewport(w, h, mobile, scale); await b.goto(url, 900); await b.ev("localStorage.clear()"); await b.goto(url, 900); };
// desktop 1440x900: overlap play at frame 3 with arrows — hero / best home
await setup(1440, 900, false, 1);
await b.ev(`HT.loadPreset("overlap")`); await sleep(200);
await b.ev(`document.querySelectorAll('#frameChips button')[2].click()`); await sleep(2400);
await b.shot(out("desktop-1440-overlap-frame3"));
await b.shot(out("00-best-home"));
// mid-animation shot
await b.ev(`document.querySelectorAll('#frameChips button')[1].click()`); await b.ev(`HT.setSpeed(0.5); HT.play()`); await sleep(1100);
await b.shot(out("desktop-1440-overlap-midplay")); await b.ev("HT.stop(); HT.setSpeed(1)");
await b.ev(`HT.loadPreset("corner")`); await b.ev(`document.querySelectorAll('#frameChips button')[1].click()`); await sleep(2400); await b.shot(out("desktop-1440-corner"));
await b.ev(`HT.loadPreset("press")`); await b.ev(`document.querySelectorAll('#frameChips button')[2].click()`); await b.ev(`document.querySelector('#chkRoles').click()`); await sleep(2400); await b.shot(out("desktop-1440-press-roles"));
await b.ev(`document.querySelector('#chkRoles').click()`);
await b.ev(`HT.loadPreset("switch")`); await b.ev(`document.querySelectorAll('#frameChips button')[2].click()`); await sleep(2400); await b.shot(out("desktop-1440-switch"));
// laptop 1280x800: 11v11 formation board
await setup(1280, 800, false, 1);
await b.ev(`HT.format(11)`); await sleep(2400); await b.shot(out("laptop-1280-11v11-433"));
await b.ev(`HT.loadPreset("3v2")`); await b.ev(`document.querySelectorAll('#frameChips button')[2].click()`); await sleep(2400); await b.shot(out("laptop-1280-3v2"));
await b.ev(`HT.loadPreset("boxdef")`); await b.ev(`document.querySelectorAll('#frameChips button')[2].click()`); await sleep(2400); await b.shot(out("laptop-1280-boxdef"));
// phone 390x844
await setup(390, 844, true, 2);
await b.ev(`HT.loadPreset("givego")`); await b.ev(`document.querySelectorAll('#frameChips button')[1].click()`); await b.ev("scrollTo(0,0)"); await sleep(2400); await b.shot(out("phone-390-giveandgo"));
await b.ev(`HT.format(7)`); await sleep(2400); await b.shot(out("phone-390-7v7"));
await b.ev(`document.querySelector('.side').scrollIntoView()`); await sleep(300); await b.shot(out("phone-390-library"));
// PNG export sample
await setup(1440, 900, false, 1);
await b.ev(`HT.loadPreset("goalkick")`); await b.ev(`document.querySelectorAll('#frameChips button')[1].click()`); await sleep(200);
const png = await b.ev("HT.pngDataURL()"); writeFileSync(out("export-goalkick-frame2"), Buffer.from(png.split(",")[1], "base64"));
// keep legacy alias
copyFileSync(out("00-best-home"), out("00-best-desktop-overlap-play"));
console.log(JSON.stringify({ errors: b.errors }));
await b.close();
