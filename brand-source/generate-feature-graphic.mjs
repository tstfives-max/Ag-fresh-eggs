import sharp from "sharp";
import fs from "node:fs";

// Play Store feature graphic: exactly 1024x500, JPEG or 24-bit PNG (no alpha).
const WIDTH = 1024;
const HEIGHT = 500;
const GREEN = "#2e7d32";
const GREEN_DARK = "#205e26";

async function main() {
  // Transparent logo mark, produced by generate-assets.mjs.
  const logoPath = "public/brand/ag-logo.png";
  if (!fs.existsSync(logoPath)) {
    throw new Error(`${logoPath} not found — run generate-assets.mjs first.`);
  }

  const logo = await sharp(logoPath).resize({ height: 190 }).toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const logoW = logoMeta.width;
  const logoH = logoMeta.height;

  // Egg motif + soft radial highlight, drawn as SVG so it scales crisply at any DPI.
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${GREEN}"/>
          <stop offset="100%" stop-color="${GREEN_DARK}"/>
        </linearGradient>
        <radialGradient id="glow" cx="80%" cy="20%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

      <!-- oversized decorative egg silhouettes, bottom-right, subtle -->
      <ellipse cx="900" cy="430" rx="70" ry="90" fill="#ffffff" opacity="0.07"/>
      <ellipse cx="980" cy="360" rx="46" ry="60" fill="#ffffff" opacity="0.06"/>
      <ellipse cx="840" cy="480" rx="50" ry="64" fill="#ffffff" opacity="0.05"/>

      <text x="440" y="220" font-family="Poppins, Arial, sans-serif" font-size="60" font-weight="700" fill="#ffffff">AG Fresh Eggs</text>
      <text x="442" y="266" font-family="Arial, sans-serif" font-size="25" fill="#e8f3e9">by AG Enterprises</text>
      <text x="442" y="324" font-family="Arial, sans-serif" font-size="27" fill="#ffffff" opacity="0.95">Farm Fresh Eggs, Delivered Near You</text>

      <rect x="442" y="358" width="270" height="46" rx="23" fill="#ffffff"/>
      <text x="577" y="388" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="${GREEN}" text-anchor="middle">Danapur, Patna • 3 KM zone</text>
    </svg>
  `;

  const base = sharp(Buffer.from(svg));

  await base
    .composite([
      {
        input: logo,
        left: 100,
        top: Math.round((HEIGHT - logoH) / 2),
      },
    ])
    .flatten({ background: GREEN_DARK }) // no alpha channel allowed in the final graphic
    .jpeg({ quality: 92 })
    .toFile("public/brand/play-store-feature-graphic.jpg");

  console.log("Wrote public/brand/play-store-feature-graphic.jpg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
