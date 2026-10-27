// Records the Luna demo video for the final presentation (Playwright).
//
//   DEMO_EMAIL=... DEMO_PASSWORD=... BASE=https://luna-henna-theta.vercel.app //     node scripts/demo/record-demo.cjs
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
  await lp.waitForURL(BASE + "/", { timeout: 30000 });
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

  // ── Intro: the café ───────────────────────────────────────────────────────
  await page.goto(BASE + "/");
  await page.waitForTimeout(2500);
  await page.mouse.move(mouse.x, mouse.y);
  await caption(page, "Maison Crumb — a new bakery café. The owner sends marketing ideas as voice notes.");
  await sleep(3500);

  // ── 1. Idea bank ─────────────────────────────────────────────────────────
  await click(page, page.locator("header button:has-text('Ideas')"));
  await page.waitForURL(/\/ideas/);
  await page.waitForTimeout(1500);
  await caption(page, "1 · Every idea lands in one place — typed or dictated, nothing lost in WhatsApp");
  await sleep(1200);
  const box = page.locator("textarea").first();
  await click(page, box);
  await box.pressSequentially("Show that we bake everything here every morning — smell of fresh bread on Torsplan", { delay: 28 });
  await sleep(400);
  await click(page, page.locator("button:has-text('Save idea')"));
  await sleep(1800);
  await moveTo(page, page.locator("text=sold out in an hour").first());
  await sleep(1500);

  // ── 2. Three options to pick from ────────────────────────────────────────
  await caption(page, "2 · Turn an idea into a video plan — Luna drafts three different ads to pick from");
  const ideaCard = page
    .getByText("sold out in an hour")
    .locator("xpath=ancestor::div[contains(@class,'items-start')][1]");
  await click(page, ideaCard.locator("button:has-text('Storyboard')"));
  await page.waitForSelector("#brief");
  await sleep(1500);
  const tone = page.locator("#tone");
  await click(page, tone);
  await tone.pressSequentially("cosy, mouth-watering", { delay: 40 });
  await sleep(500);
  await click(page, page.locator("button:has-text('Show me 3 ideas')"));
  await page.waitForSelector("text=Use this one", { timeout: 30000 });
  await sleep(1200);
  const cards = page.locator("button:has-text('Use this one')");
  for (let i = 0; i < 3; i++) {
    await moveTo(page, cards.nth(i), { dy: -180 });
    await sleep(1100);
  }
  await click(page, cards.nth(0));
  await page.waitForURL(/\/storyboard\//, { timeout: 30000 });
  await page.waitForTimeout(2500);

  // ── 3. The storyboard ────────────────────────────────────────────────────
  await caption(page, "3 · Every scene arrives ready — shot, caption and timing. Total length at a glance.");
  await moveTo(page, page.locator("text=total").first());
  await sleep(2200);
  await click(page, page.locator("button:has-text('script')"));
  await caption(page, "The exact caption / voiceover line for each scene");
  await sleep(3000);
  await click(page, page.locator("button:has-text('frames')"));
  await sleep(800);

  // Shot idea on scene 1
  await caption(page, "One-tap shot ideas — no prompt writing needed");
  await click(page, page.locator("button:has-text('+ Steam rising')"));
  await sleep(1800);

  // ── 4. Real food, not fake food ──────────────────────────────────────────
  await caption(page, "4 · Real food, not fake food — use a photo of your actual buns");
  const seg2 = page.locator("button[title^='2.']").first();
  await click(page, seg2);
  await sleep(1000);
  const uploadBtn = page.locator("button:has-text('Use a photo of your café')");
  await moveTo(page, uploadBtn);
  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    (async () => { await page.mouse.down(); await sleep(80); await page.mouse.up(); })(),
  ]);
  await chooser.setFiles(path.join(ASSETS, "maison-crumb-buns.jpg"));
  await page.waitForTimeout(4000);
  await caption(page, "With a Gemini key, Veo animates this exact photo into the video clip");
  await sleep(3000);

  // ── 5. Preview ───────────────────────────────────────────────────────────
  await caption(page, "5 · Preview the whole reel");
  await click(page, page.locator("header button:has-text('Play')"));
  await sleep(9000);
  await page.keyboard.press("Escape");
  await sleep(800);

  // ── 6. Caption + export ──────────────────────────────────────────────────
  await caption(page, "6 · A caption ready to paste on Instagram — then export the video");
  await click(page, page.locator("header button:has-text('Export')"));
  await sleep(1200);
  await click(page, page.locator("button:has-text('Write it for me')"));
  await sleep(2500);
  await click(page, page.locator("button:has-text('Copy')").first());
  await sleep(1500);
  await click(page, page.locator("button:has-text('Quick export')"));
  mark("export_start");
  await page.waitForSelector("video[controls]", { timeout: 90000 });
  mark("export_done");
  await caption(page, "Done — a vertical reel and its caption, in minutes");
  await sleep(5000);
  await page.keyboard.press("Escape");
  await sleep(600);

  // ── 7. Bring your own key ────────────────────────────────────────────────
  await page.goto(BASE + "/profile#gemini");
  await page.waitForTimeout(2000);
  await page.mouse.move(mouse.x, mouse.y);
  await page.locator("#gemini").scrollIntoViewIfNeeded();
  await caption(page, "7 · Runs on the café's own Gemini key — drafts & voiceover free, Veo video at Google's price");
  await moveTo(page, page.locator("#gemini"));
  await sleep(4500);
  await caption(page, "");
  await sleep(600);

  const video = page.video();
  await ctx.close();
  console.log("video:", await video.path());
  console.log("storyboard created during demo (for cleanup) — see dashboard");
  await browser.close();
})();
