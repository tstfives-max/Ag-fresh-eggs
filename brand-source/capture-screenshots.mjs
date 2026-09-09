// One-off script to (re)capture Play Store phone screenshots against the live,
// deployed app. Not part of the build — run manually with:
//   node brand-source/capture-screenshots.mjs
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "screenshots");
const BASE = "https://ag-fresh-eggs.vercel.app";

const shots = [
  { name: "shot-01-home", path: "/" },
  { name: "shot-02-bulk", path: "/bulk" },
  { name: "shot-04-profile", path: "/profile" },
  { name: "shot-05-shop", path: "/shop" },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  });
  const page = await context.newPage();

  for (const shot of shots) {
    await page.goto(BASE + shot.path, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const file = path.join(outDir, `${shot.name}.png`);
    await page.screenshot({ path: file });
    console.log("saved", file);
  }

  // shot-03: cart with a couple of packs already added, so the screenshot shows
  // the real cart UI instead of the empty state.
  await page.goto(BASE + "/shop", { waitUntil: "networkidle" });
  const addButtons = page.getByRole("button", { name: /add/i });
  await addButtons.nth(0).click();
  await addButtons.nth(1).click();
  await page.goto(BASE + "/cart", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const cartFile = path.join(outDir, "shot-03-cart.png");
  await page.screenshot({ path: cartFile });
  console.log("saved", cartFile);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
