import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "brand-source/ag-logo.jpg";

// 1. Trim the white border, then make near-white pixels transparent so the mark can
//    sit on any background (header, dark surfaces, app icon canvases).
async function makeTransparentLogo() {
  const trimmed = await sharp(SRC).trim({ threshold: 10 }).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const { data, info } = trimmed;
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Near-white -> fully transparent; blend a soft edge for anti-aliased boundary pixels.
    const whiteness = Math.min(r, g, b);
    if (whiteness > 245) {
      data[i + 3] = 0;
    } else if (whiteness > 225) {
      data[i + 3] = Math.round(((245 - whiteness) / 20) * 255);
    }
  }

  return sharp(data, { raw: { width, height, channels } }).png();
}

async function main() {
  const logo = await makeTransparentLogo();
  const meta = await logo.metadata();
  console.log("Trimmed transparent logo:", meta.width, "x", meta.height);

  fs.mkdirSync("public/brand", { recursive: true });

  // Full-color transparent logo for use in the app header/UI (next/image).
  await logo.clone().resize({ width: 800 }).toFile("public/brand/ag-logo.png");

  // Square, padded "mark" versions for favicons/app icons: logo centered on a white
  // square canvas (most launcher/favicon contexts don't handle transparent well as a
  // *background*, and the source mark itself has no separate square icon variant).
  async function squareIcon(size, padRatio = 0.14) {
    const inner = Math.round(size * (1 - padRatio * 2));
    const resized = await sharp(SRC)
      .trim({ threshold: 10 })
      .resize({ width: inner, height: inner, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();
    return sharp({
      create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite([{ input: resized, gravity: "center" }])
      .png();
  }

  // Favicon / web app icons (Next.js App Router convention files).
  await (await squareIcon(32)).toFile("src/app/icon.png");
  await (await squareIcon(180)).toFile("src/app/apple-icon.png");

  // Play Store hi-res icon.
  await (await squareIcon(512)).toFile("public/brand/play-store-icon-512.png");

  // Android launcher icons (legacy + adaptive-icon-style foreground/background).
  const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  for (const [density, size] of Object.entries(densities)) {
    const dir = `android/app/src/main/res/mipmap-${density}`;
    fs.mkdirSync(dir, { recursive: true });
    const icon = await squareIcon(size, 0.1);
    await icon.clone().toFile(path.join(dir, "ic_launcher.png"));
    await icon.clone().toFile(path.join(dir, "ic_launcher_round.png"));
    // Foreground layer needs extra safe-zone padding for the adaptive-icon mask.
    const fg = await squareIcon(size, 0.32);
    await fg.toFile(path.join(dir, "ic_launcher_foreground.png"));
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
