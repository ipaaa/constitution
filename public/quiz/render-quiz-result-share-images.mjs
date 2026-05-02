import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..");
const codexDir = path.join(publicDir, "codex");

const fonts = {
  serif: "Noto Serif TC, Songti TC, Hiragino Sans GB, serif",
  sans: "Noto Sans TC, STHeiti, Hiragino Sans GB, sans-serif",
  mono: "Manrope, Helvetica Neue, Arial, sans-serif",
};

const levels = [
  {
    slug: "novice",
    title: "憲法小白",
    score: "0-1 / 5 題",
    message: "沒關係，現在開始關心還來得及！",
    accent: "#D32F2F",
    light: "#FFECEC",
    owl: "owl-past.png",
    owlVariant: "tilt-question",
  },
  {
    slug: "trainee",
    title: "憲法見習生",
    score: "2-3 / 5 題",
    message: "你已經比很多人更關心這件事了。",
    accent: "#F7C04A",
    light: "#FFF6D8",
    owl: "owl.png",
    owlVariant: "front-pencil",
  },
  {
    slug: "observer",
    title: "憲法觀察家",
    score: "4 / 5 題",
    message: "你對憲政問題有相當的理解力！",
    accent: "#2563EB",
    light: "#EAF2FF",
    owl: "owl-past.png",
    owlVariant: "magnifier",
  },
  {
    slug: "expert",
    title: "憲法達人",
    score: "5 / 5 題",
    message: "恭喜你！你的憲政素養令人印象深刻。",
    accent: "#341764",
    light: "#F0E8FF",
    owl: "owl-future.png",
    owlVariant: "gold-rays",
  },
];

const sizes = {
  ig: { width: 1080, height: 1080 },
  fb: { width: 1200, height: 630 },
};

const imageCache = new Map();

async function dataUri(filePath) {
  if (!imageCache.has(filePath)) {
    const data = await fs.readFile(filePath);
    imageCache.set(filePath, `data:image/png;base64,${data.toString("base64")}`);
  }
  return imageCache.get(filePath);
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function commonDefs() {
  return `
    <defs>
      <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#111827" flood-opacity="0.18"/>
      </filter>
      <filter id="small-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#111827" flood-opacity="0.18"/>
      </filter>
      <pattern id="paper-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" stroke-width="1" opacity="0.55"/>
      </pattern>
    </defs>
  `;
}

function labelPill(x, y, text, fill = "#1A1A1A", color = "#FFFFFF") {
  const width = text.length * 17 + 34;
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="36" fill="${fill}" rx="3"/>
      <text x="${x + 17}" y="${y + 24}" font-family="${fonts.sans}" font-size="18" font-weight="900" letter-spacing="1.8" fill="${color}">${escapeXml(text)}</text>
    </g>
  `;
}

function ctaBand(x, y, width, height, fontSize = 30) {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#111827" rx="4"/>
      <rect x="${x}" y="${y}" width="8" height="${height}" fill="#D32F2F" rx="2"/>
      <text x="${x + 34}" y="${y + height * 0.61}" font-family="${fonts.sans}" font-size="${fontSize}" font-weight="900" fill="#FFFFFF">來測測你的憲法素養</text>
      <text x="${x + width - 34}" y="${y + height * 0.61}" text-anchor="end" font-family="${fonts.mono}" font-size="${fontSize}" font-weight="900" fill="#FFE082">addcourt.tw</text>
    </g>
  `;
}

function questionMarks(x, y, color) {
  return `
    <g filter="url(#small-shadow)">
      <circle cx="${x}" cy="${y}" r="34" fill="#FFFFFF" stroke="${color}" stroke-width="5"/>
      <text x="${x}" y="${y + 15}" text-anchor="middle" font-family="${fonts.sans}" font-size="52" font-weight="900" fill="${color}">?</text>
      <circle cx="${x + 64}" cy="${y + 48}" r="22" fill="#FFFFFF" stroke="${color}" stroke-width="4"/>
      <text x="${x + 64}" y="${y + 58}" text-anchor="middle" font-family="${fonts.sans}" font-size="34" font-weight="900" fill="${color}">?</text>
    </g>
  `;
}

function pencil(x, y) {
  return `
    <g transform="translate(${x} ${y}) rotate(-18)" filter="url(#small-shadow)">
      <rect x="0" y="0" width="116" height="28" fill="#FFE082" stroke="#3A180F" stroke-width="5" rx="4"/>
      <rect x="12" y="0" width="20" height="28" fill="#D32F2F"/>
      <path d="M116 0 L148 14 L116 28 Z" fill="#F6D7A7" stroke="#3A180F" stroke-width="5" stroke-linejoin="round"/>
      <path d="M140 14 L151 9 L151 19 Z" fill="#3A180F"/>
    </g>
  `;
}

function magnifier(x, y, color) {
  return `
    <g transform="translate(${x} ${y}) rotate(-15)" filter="url(#small-shadow)">
      <circle cx="0" cy="0" r="48" fill="rgba(255,255,255,0.42)" stroke="#3A180F" stroke-width="10"/>
      <circle cx="0" cy="0" r="36" fill="none" stroke="${color}" stroke-width="5" opacity="0.65"/>
      <rect x="37" y="36" width="92" height="18" rx="9" fill="#3A180F"/>
      <rect x="48" y="40" width="70" height="10" rx="5" fill="${color}" opacity="0.8"/>
    </g>
  `;
}

function goldRays(cx, cy, color) {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 16;
    const x1 = cx + Math.cos(angle) * 158;
    const y1 = cy + Math.sin(angle) * 158;
    const x2 = cx + Math.cos(angle) * 220;
    const y2 = cy + Math.sin(angle) * 220;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#F7C04A" stroke-width="9" stroke-linecap="round" opacity="0.7"/>`;
  }).join("");

  return `
    <g>
      ${rays}
      <circle cx="${cx}" cy="${cy}" r="126" fill="${color}" opacity="0.12"/>
    </g>
  `;
}

function medal(x, y) {
  return `
    <g transform="translate(${x} ${y})" filter="url(#small-shadow)">
      <path d="M32 0 L58 0 L48 56 L22 56 Z" fill="#D32F2F"/>
      <path d="M62 0 L88 0 L98 56 L72 56 Z" fill="#2563EB"/>
      <circle cx="60" cy="82" r="42" fill="#F7C04A" stroke="#3A180F" stroke-width="7"/>
      <text x="60" y="98" text-anchor="middle" font-family="${fonts.sans}" font-size="48" font-weight="900" fill="#3A180F">5</text>
    </g>
  `;
}

function owlOverlay(level, layout) {
  const v = level.owlVariant;
  if (v === "tilt-question") {
    return questionMarks(layout.overlayX, layout.overlayY, level.accent);
  }
  if (v === "front-pencil") {
    return pencil(layout.overlayX, layout.overlayY);
  }
  if (v === "magnifier") {
    return magnifier(layout.overlayX, layout.overlayY, level.accent);
  }
  return medal(layout.overlayX, layout.overlayY);
}

function owlImage(level, data, layout) {
  const rotate = level.owlVariant === "tilt-question" ? -6 : level.owlVariant === "magnifier" ? 4 : 0;
  return `
    <g transform="translate(${layout.owlX} ${layout.owlY}) rotate(${rotate} ${layout.owlW / 2} ${layout.owlH / 2})" filter="url(#soft-shadow)">
      <image href="${data}" x="0" y="0" width="${layout.owlW}" height="${layout.owlH}" preserveAspectRatio="xMidYMid meet"/>
    </g>
  `;
}

function igLayout(level, data) {
  const isFront = level.owl === "owl.png";
  const isExpert = level.slug === "expert";
  const owl = isFront
    ? { owlX: 560, owlY: 242, owlW: 388, owlH: 388, overlayX: 780, overlayY: 236 }
    : isExpert
      ? { owlX: 590, owlY: 286, owlW: 328, owlH: 328, overlayX: 794, overlayY: 258 }
      : { owlX: 612, owlY: 326, owlW: 290, owlH: 290, overlayX: 778, overlayY: 312 };

  const rays = isExpert ? goldRays(754, 458, level.accent) : "";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      ${commonDefs()}
      <rect width="1080" height="1080" fill="#F6F8FA"/>
      <rect width="1080" height="1080" fill="url(#paper-grid)" opacity="0.65"/>
      <rect x="52" y="52" width="976" height="976" fill="#FFFFFF" stroke="#111827" stroke-width="4" rx="6"/>
      <rect x="52" y="52" width="976" height="18" fill="#111827"/>
      <rect x="74" y="790" width="932" height="3" fill="#111827" opacity="0.18"/>
      <rect x="86" y="192" width="520" height="82" fill="${level.light}" rx="4"/>
      <rect x="86" y="192" width="12" height="82" fill="${level.accent}" rx="2"/>
      ${labelPill(86, 96, "憲法素養測驗")}
      <text x="910" y="123" text-anchor="end" font-family="${fonts.mono}" font-size="20" font-weight="900" fill="#6B7280">ADD C0URT</text>
      <text x="112" y="261" font-family="${fonts.serif}" font-size="92" font-weight="900" fill="#111827">${escapeXml(level.title)}</text>
      <text x="92" y="376" font-family="${fonts.mono}" font-size="86" font-weight="900" fill="${level.accent}">${escapeXml(level.score)}</text>
      <text x="96" y="442" font-family="${fonts.sans}" font-size="34" font-weight="700" fill="#4B5563">${escapeXml(level.message)}</text>
      <text x="94" y="553" font-family="${fonts.sans}" font-size="24" font-weight="900" letter-spacing="2" fill="#111827">RESULT SHARE CARD</text>
      <path d="M94 577 H376" stroke="#111827" stroke-width="4"/>
      ${rays}
      ${owlImage(level, data, owl)}
      ${owlOverlay(level, owl)}
      ${ctaBand(74, 878, 932, 106, 30)}
    </svg>
  `;
}

function fbLayout(level, data) {
  const isFront = level.owl === "owl.png";
  const isExpert = level.slug === "expert";
  const owl = isFront
    ? { owlX: 780, owlY: 126, owlW: 342, owlH: 342, overlayX: 908, overlayY: 136 }
    : isExpert
      ? { owlX: 826, owlY: 170, owlW: 282, owlH: 282, overlayX: 980, overlayY: 122 }
      : { owlX: 848, owlY: 204, owlW: 242, owlH: 242, overlayX: 988, overlayY: 182 };

  const rays = isExpert ? goldRays(965, 315, level.accent) : "";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      ${commonDefs()}
      <rect width="1200" height="630" fill="#F6F8FA"/>
      <rect width="1200" height="630" fill="url(#paper-grid)" opacity="0.65"/>
      <rect x="42" y="42" width="1116" height="546" fill="#FFFFFF" stroke="#111827" stroke-width="4" rx="6"/>
      <rect x="42" y="42" width="1116" height="16" fill="#111827"/>
      <rect x="68" y="142" width="586" height="76" fill="${level.light}" rx="4"/>
      <rect x="68" y="142" width="12" height="76" fill="${level.accent}" rx="2"/>
      ${labelPill(68, 82, "憲法素養測驗")}
      <text x="724" y="108" text-anchor="end" font-family="${fonts.mono}" font-size="18" font-weight="900" fill="#6B7280">ADD C0URT</text>
      <text x="94" y="207" font-family="${fonts.serif}" font-size="76" font-weight="900" fill="#111827">${escapeXml(level.title)}</text>
      <text x="68" y="312" font-family="${fonts.mono}" font-size="76" font-weight="900" fill="${level.accent}">${escapeXml(level.score)}</text>
      <text x="72" y="368" font-family="${fonts.sans}" font-size="28" font-weight="700" fill="#4B5563">${escapeXml(level.message)}</text>
      <text x="72" y="442" font-family="${fonts.sans}" font-size="19" font-weight="900" letter-spacing="2" fill="#111827">RESULT SHARE CARD</text>
      <path d="M72 462 H348" stroke="#111827" stroke-width="4"/>
      ${rays}
      ${owlImage(level, data, owl)}
      ${owlOverlay(level, owl)}
      ${ctaBand(68, 500, 1064, 58, 24)}
    </svg>
  `;
}

async function render() {
  await fs.mkdir(__dirname, { recursive: true });

  for (const level of levels) {
    const owlPath = path.join(codexDir, level.owl);
    const owlData = await dataUri(owlPath);

    for (const [kind, size] of Object.entries(sizes)) {
      const svg = kind === "ig" ? igLayout(level, owlData) : fbLayout(level, owlData);
      const fileName = `quiz-result-${level.slug}-${kind}.png`;
      const output = path.join(__dirname, fileName);
      await sharp(Buffer.from(svg))
        .resize(size.width, size.height, { fit: "fill" })
        .png({ compressionLevel: 9, palette: false })
        .toFile(output);
      const meta = await sharp(output).metadata();
      console.log(`${fileName}: ${meta.width}x${meta.height}`);
    }
  }
}

render().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
