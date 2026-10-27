// Records the Luna demo video for the final presentation (Playwright).
//
//   DEMO_EMAIL=... DEMO_PASSWORD=... BASE=http://localhost:3100 \
//   DEMO_NARRATION=durations.json node scripts/demo/record-demo.cjs
//
// Needs Playwright (npx playwright install chromium). The account should have
// the "Maison Crumb" demo venue and three ideas set up (see README in this
// folder). Output: scripts/demo/out/*.webm — speed up the export wait and
// convert to MP4 with ffmpeg (node_modules/ffmpeg-static/ffmpeg), using the
// MARK timestamps the script prints.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = path.join(__dirname, "out");
const ASSETS = __dirname;
// The café's own photos, one per scene (override with DEMO_PHOTO_1..4), and
// its logo for the brand-kit step.
const PHOTO_DEFAULT = path.join(ASSETS, "maison-crumb-buns.jpg");
const PHOTOS = [1, 2, 3, 4].map((n) => process.env[`DEMO_PHOTO_${n}`] ?? PHOTO_DEFAULT);
const LOGO = process.env.DEMO_LOGO ?? path.join(ASSETS, "maison-crumb-logo.png");
// Narration line lengths in seconds ({id: sec}); each step lasts at least as
// long as its line, so a voiceover can be laid over the recording.
const NARRATION = process.env.DEMO_NARRATION
  ? JSON.parse(fs.readFileSync(process.env.DEMO_NARRATION, "utf8"))
  : {};
const CLIP_SEC = Number(process.env.DEMO_CLIP_SEC ?? 6);
const W = 1440, H = 900;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Visible cursor + click ripple + a caption pill (headless recordings show none).
const OVERLAY = `
(() => {
  const install = () => {
    if (document.getElementById('demo-cursor')) return;
    const c = document.createElement('div');
    c.id = 'demo-cursor';
    c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;transform:translate(-3px,-2px);transition:transform 60ms linear';
    c.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6-3.6 6.9z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.body.appendChild(c);
    const cap = document.createElement('div');
    cap.id = 'demo-caption';
    cap.style.cssText = 'position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:2147483646;pointer-events:none;background:rgba(32,48,38,.92);color:#fff;font:600 17px/1.35 ui-sans-serif,system-ui,sans-serif;padding:12px 20px;border-radius:999px;box-shadow:0 8px 30px rgba(0,0,0,.25);max-width:80vw;text-align:center;opacity:0;transition:opacity .35s';
    document.body.appendChild(cap);
    document.addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
    document.addEventListener('mousedown', (e) => {
      const r = document.createElement('div');
      r.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;width:34px;height:34px;border-radius:50%;border:3px solid rgba(217,87,122,.85);left:' + (e.clientX - 17) + 'px;top:' + (e.clientY - 17) + 'px;transition:transform .45s ease-out, opacity .45s ease-out';
      document.body.appendChild(r);
      requestAnimationFrame(() => { r.style.transform = 'scale(1.9)'; r.style.opacity = '0'; });
      setTimeout(() => r.remove(), 500);
    }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
`;

async function caption(page, text) {
  await page.evaluate((t) => {
    const el = document.getElementById("demo-caption");
    if (!el) return;
    if (!t) { el.style.opacity = "0"; return; }
    el.textContent = t;
    el.style.opacity = "1";
  }, text);
}

let mouse = { x: W / 2, y: H / 2 };
async function moveTo(page, locator, { dx = 0, dy = 0 } = {}) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("no box for " + locator);
  const x = box.x + box.width / 2 + dx, y = box.y + box.height / 2 + dy;
  await page.mouse.move(x, y, { steps: 28 });
  mouse = { x, y };
  await sleep(250);
}
async function click(page, locator, opts) {
  await moveTo(page, locator, opts);
  await page.mouse.down();
  await sleep(80);
  await page.mouse.up();
  await sleep(500);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // Sign in off-camera and keep the session.
  const login = await browser.newContext();
  const lp = await login.newPage();
  await lp.goto(BASE + "/login");
  await lp.fill("#email", process.env.DEMO_EMAIL ?? "");
  await lp.fill("#password", process.env.DEMO_PASSWORD ?? "");
  await lp.click('button[type="submit"]');
  await lp.waitForURL(BASE + "/", { timeout: 60000 });
  const state = path.join(OUT, "state.json");
  await login.storageState({ path: state });
  await login.close();

  const ctx = await browser.newContext({
    storageState: state,
    viewport: { width: W, height: H },
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await ctx.addInitScript(OVERLAY);
  const page = await ctx.newPage();
  const t0 = Date.now();
  const mark = (name) => console.log(`MARK ${name} ${((Date.now() - t0) / 1000).toFixed(2)}`);

  // Start a narration line now; hold(id) waits until it has finished.
  const ends = {};
  const say = (id) => {
    mark(`say_${id}`);
    ends[id] = Date.now() + (NARRATION[id] ?? 0) * 1000 + 400;
  };
  const hold = async (id) => {
    const left = (ends[id] ?? 0) - Date.now();
    if (left > 0) await sleep(left);
  };
  const upload = async (button, file) => {
    await moveTo(page, button);
    const [chooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      (async () => { await page.mouse.down(); await sleep(80); await page.mouse.up(); })(),
    ]);
    await chooser.setFiles(file);
  };

  // ── Intro ────────────────────────────────────────────────────────────────
  await page.goto(BASE + "/");
  await page.waitForTimeout(2500);
  await page.mouse.move(mouse.x, mouse.y);
  say("intro");
  await caption(page, "Luna — short-form video for cafés. Today: Maison Crumb, a new bakery café.");
  await sleep(3000);
  await moveTo(page, page.locator("text=Your storyboards").first());
  await hold("intro");

  // ── 1. Brand kit ─────────────────────────────────────────────────────────
  await page.goto(BASE + "/profile");
  await page.waitForTimeout(1500);
  await page.mouse.move(mouse.x, mouse.y);
  const kit = page.locator("#brand_name");
  await kit.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 120);
  say("brand");
  await caption(page, "1 · Set up your brand once — name, logo and colours");
  await click(page, kit);
  await kit.fill("");
  await kit.pressSequentially("Maison Crumb", { delay: 45 });
  await upload(page.locator("button:has-text('Upload logo')"), LOGO);
  await page.waitForSelector("img[alt='Logo']", { timeout: 30000 });
  await sleep(600);
  await page.locator("input[name='color']").fill("#fff3e3");
  for (let i = 0; i < 2; i++) {
    await click(page, page.locator("button:has-text('Add colour')"));
    await sleep(400);
  }
  await moveTo(page, page.locator("text=Preview").last(), { dy: -120 });
  await sleep(800);
  await click(page, page.locator("button:has-text('Save brand kit')"));
  await page.waitForSelector("text=Brand kit saved", { timeout: 15000 });
  await hold("brand");
  await sleep(600);

  // ── 2. Idea bank ─────────────────────────────────────────────────────────
  await page.goto(BASE + "/ideas");
  await page.waitForTimeout(1500);
  await page.mouse.move(mouse.x, mouse.y);
  say("ideas");
  await caption(page, "2 · Every idea lands in one place — typed or dictated");
  const box = page.locator("textarea").first();
  await click(page, box);
  await box.pressSequentially("Show that we bake everything here every morning — smell of fresh bread on Torsplan", { delay: 24 });
  await click(page, page.locator("button:has-text('Save idea')"));
  await sleep(1200);
  await moveTo(page, page.locator("text=sold out in an hour").first());
  await hold("ideas");

  // ── 3. Three options to pick from ────────────────────────────────────────
  const ideaCard = page
    .getByText("sold out in an hour")
    .locator("xpath=ancestor::div[contains(@class,'items-start')][1]");
  await click(page, ideaCard.locator("button:has-text('Storyboard')"));
  await page.waitForSelector("#brief");
  say("draft");
  await caption(page, "3 · Gemini drafts three different video ideas from it");
  await sleep(1200);
  const tone = page.locator("#tone");
  await click(page, tone);
  await tone.pressSequentially("cosy, mouth-watering", { delay: 40 });
  await click(page, page.locator("button:has-text('Show me 3 ideas')"));
  await hold("draft");
  mark("draft_start");
  await page.waitForSelector("text=Use this one", { timeout: 120000 });
  mark("draft_done");
  await sleep(800);
  say("pick");
  const cards = page.locator("button:has-text('Use this one')");
  for (let i = 0; i < 3; i++) {
    await moveTo(page, cards.nth(i), { dy: -180 });
    await sleep(700);
  }
  await click(page, cards.nth(0));
  await page.waitForURL(/\/storyboard\//, { timeout: 30000 });
  await page.waitForTimeout(2000);

  // ── 4. The storyboard ────────────────────────────────────────────────────
  say("board");
  await caption(page, "4 · Every scene arrives ready — shot, caption and timing");
  await moveTo(page, page.locator("text=total").first());
  await sleep(2500);
  await click(page, page.locator("button:has-text('script')"));
  await sleep(2600);
  await click(page, page.locator("button:has-text('frames')"));
  await hold("board");

  // ── 5. Real photos → AI video ────────────────────────────────────────────
  async function photoToVideo(n, file) {
    await click(page, page.locator(`button[title^='${n}.']`).first());
    await sleep(700);
    await upload(page.locator("button:has-text('Use a photo of your café')"), file);
    await page.waitForTimeout(3000);
    await click(page, page.locator("aside button:has-text('Video')"));
    await sleep(400);
    const more = page.locator("button[aria-label='Increase duration']");
    for (let i = 0; i < 10; i++) {
      const sec = Number((await more.locator("xpath=preceding-sibling::span[1]").innerText()).replace(/\D/g, ""));
      if (sec >= CLIP_SEC) break;
      await click(page, more);
    }
    await click(page, page.locator("button:has-text('Regenerate scene'), button:has-text('Generate scene')").first());
    mark(`gen${n}_start`);
  }
  say("photo1");
  await caption(page, "5 · Real food — upload a photo, switch to Video, make it longer, generate");
  await photoToVideo(1, PHOTOS[0]);
  await hold("photo1");
  say("photo2");
  await caption(page, "Same for every scene — each clip starts from your own photo");
  await photoToVideo(2, PHOTOS[1]);
  await photoToVideo(3, PHOTOS[2]);
  await photoToVideo(4, PHOTOS[3]);
  await hold("photo2");
  mark("gen_wait_start");
  for (const n of [4, 1, 2, 3]) {
    await click(page, page.locator(`button[title^='${n}.']`).first());
    await page.waitForSelector("video[loop]", { timeout: 400000 });
  }
  mark("gen_wait_done");
  await click(page, page.locator("button[title^='2.']").first());
  await page.waitForTimeout(1500);
  say("ready");
  await caption(page, "Gemini Omni Flash brought each photo to life — about $0.60 a clip");
  await sleep(4500);
  await click(page, page.locator("button[title^='1.']").first());
  await hold("ready");

  // ── 6. Preview ───────────────────────────────────────────────────────────
  say("preview");
  await caption(page, "6 · Preview the whole reel — your logo and colours on every scene");
  await click(page, page.locator("header button:has-text('Play')"));
  const reelSec = 4 * CLIP_SEC;
  await sleep(Math.max(reelSec * 1000 + 800, (NARRATION.preview ?? 0) * 1000));
  await page.keyboard.press("Escape");
  await sleep(600);

  // ── 7. Caption + export ──────────────────────────────────────────────────
  say("export");
  await caption(page, "7 · A caption for your post — then export the video");
  await click(page, page.locator("header button:has-text('Export')"));
  await sleep(1000);
  await click(page, page.locator("button:has-text('Write it for me')"));
  await sleep(2500);
  await click(page, page.locator("button:has-text('Copy')").first());
  await sleep(800);
  await click(page, page.locator("button:has-text('Quick export')"));
  await hold("export");
  mark("export_start");
  await page.waitForSelector("video[autoplay][controls]", { timeout: 240000 });
  mark("export_done");
  // Let the exported video reach its branded end card.
  await caption(page, "");
  await page.evaluate(() => {
    const v = document.querySelector("video[autoplay][controls]");
    if (v && Number.isFinite(v.duration)) v.currentTime = Math.max(0, v.duration - 3.2);
  });
  say("outro");
  await caption(page, "Done — a branded reel and its caption, in minutes");
  await sleep(Math.max(5000, (NARRATION.outro ?? 0) * 1000 + 800));
  await caption(page, "");
  await sleep(500);

  const video = page.video();
  await ctx.close();
  console.log("video:", await video.path());
  await browser.close();
})();
