import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..");
const outDir = __dirname;

const palette = {
  ink: "#1F2937",
  muted: "#6B7280",
  line: "#D1D5DB",
  panel: "#FFFFFF",
  pearl: "#F6F8FA",
  red: "#D32F2F",
  redLight: "#FEE2E2",
  amber: "#F7C04A",
  amberLight: "#FEF3C7",
  green: "#16A34A",
  greenLight: "#DCFCE7",
  robe: "#341764",
  brown: "#3A180F",
};

const fonts = {
  serif: "Noto Serif TC, Songti TC, PMingLiU, serif",
  sans: "Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif",
  mono: "Manrope, Helvetica Neue, Arial, sans-serif",
};

const panels = [
  {
    no: "01",
    title: "國會可以自己決定自己有多大權力嗎？",
    kicker: "114年憲判字第1號 懶人包",
    badge: "開場",
    badgeTone: "ink",
    lines: ["貓頭鷹法官打開憲法，", "帶你看懂這場權力界線的審查。"],
    scene: "court",
  },
  {
    no: "02",
    title: "2024 國會職權修法",
    kicker: "背景",
    badge: "爭議開始",
    badgeTone: "amber",
    lines: ["立法院通過一系列改革法案，", "大幅擴張國會能問、能查、能罰的範圍。"],
    scene: "vote",
  },
  {
    no: "03",
    title: "一口氣修了五大項",
    kicker: "問題",
    badge: "憲法有給嗎",
    badgeTone: "amber",
    lines: ["國情報告、聽證調查、藐視國會罪、", "人事同意權、調查權界線都被送上檯面。"],
    scene: "five",
  },
  {
    no: "04",
    title: "各方聲請釋憲",
    kicker: "進入法庭",
    badge: "逐條審查",
    badgeTone: "green",
    lines: ["憲法法庭受理後，", "不是看誰聲量大，而是逐條對照憲法。"],
    scene: "petition",
  },
  {
    no: "05",
    title: "總統國情報告不能變質詢",
    kicker: "國情報告",
    badge: "違憲",
    badgeTone: "red",
    lines: ["總統不對立法院負責，", "不能被強迫站上台接受即問即答式質詢。"],
    scene: "mic",
  },
  {
    no: "06",
    title: "聽證可查，但不能隨便罰人民",
    kicker: "聽證＋藐視",
    badge: "部分違憲＋違憲",
    badgeTone: "amberRed",
    lines: ["調查權本身可以存在，", "但強制民間人士出席、模糊處罰都踩線。"],
    scene: "hearing",
  },
  {
    no: "07",
    title: "表決不能跳過實質討論",
    kicker: "程序",
    badge: "程序違憲",
    badgeTone: "amber",
    lines: ["法案推進再快，", "也不能省掉逐條討論與民主審議。"],
    scene: "clock",
  },
  {
    no: "08",
    title: "調查權不能伸進司法案件",
    kicker: "司法獨立",
    badge: "違憲",
    badgeTone: "red",
    lines: ["法院、檢察署正在辦的案子，", "不能被立法院調查權直接介入。"],
    scene: "barrier",
  },
  {
    no: "09",
    title: "權力分立，是界線不是大小聲",
    kicker: "總結",
    badge: "核心原則",
    badgeTone: "green",
    lines: ["每個機關都有自己的憲法位置，", "誰都不能自己替自己加上無限權力。"],
    scene: "scale",
  },
  {
    no: "10",
    title: "想看完整分析？",
    kicker: "延伸閱讀",
    badge: "Add C0urt",
    badgeTone: "ink",
    lines: ["來 Add C0urt 憲庭加好友，", "用白話圖文追上憲法法庭重點。"],
    scene: "cta",
  },
];

async function dataUri(relativePath) {
  const filePath = path.join(publicDir, relativePath);
  const data = await fs.readFile(filePath);
  return `data:image/png;base64,${data.toString("base64")}`;
}

function esc(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function defs() {
  return `
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#111827" flood-opacity="0.15"/>
      </filter>
      <filter id="smallShadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#111827" flood-opacity="0.16"/>
      </filter>
      <pattern id="paperGrid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M32 0H0V32" fill="none" stroke="#E5E7EB" stroke-width="1" opacity="0.58"/>
      </pattern>
    </defs>
  `;
}

function textLines(lines, x, y, size, leading, fill = palette.ink, family = fonts.sans, weight = 700) {
  return lines
    .map((line, index) => `<text x="${x}" y="${y + index * leading}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(line)}</text>`)
    .join("");
}

function titleLines(title) {
  const custom = {
    "國會可以自己決定自己有多大權力嗎？": ["國會可以自己決定", "自己有多大權力嗎？"],
    "總統國情報告不能變質詢": ["總統國情報告", "不能變質詢"],
    "聽證可查，但不能隨便罰人民": ["聽證可查，", "但不能隨便罰人民"],
    "表決不能跳過實質討論": ["表決不能跳過", "實質討論"],
    "調查權不能伸進司法案件": ["調查權不能伸進", "司法案件"],
    "權力分立，是界線不是大小聲": ["權力分立，", "是界線不是大小聲"],
  };
  return custom[title] ?? [title];
}

function badge(x, y, label, tone = "red", size = 22) {
  const styles = {
    red: [palette.redLight, "#991B1B", palette.red],
    amber: [palette.amberLight, "#92400E", palette.amber],
    green: [palette.greenLight, "#166534", palette.green],
    ink: [palette.ink, "#FFFFFF", palette.ink],
    amberRed: [palette.amberLight, "#7F1D1D", palette.red],
  };
  const [fill, color, stroke] = styles[tone] ?? styles.red;
  const width = Math.max(124, label.length * size * 0.92 + 42);
  return `
    <g filter="url(#smallShadow)">
      <rect x="${x}" y="${y}" width="${width}" height="${size + 24}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${x + width / 2}" y="${y + size + 6}" text-anchor="middle" font-family="${fonts.mono}" font-size="${size}" font-weight="900" fill="${color}">${esc(label)}</text>
    </g>
  `;
}

function owl(data, x, y, size, flip = false) {
  return `
    <g transform="translate(${x} ${y}) ${flip ? `scale(-1 1) translate(${-size} 0)` : ""}" filter="url(#shadow)">
      <image href="${data}" x="0" y="0" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>
    </g>
  `;
}

function icon(scene, x, y, scale = 1) {
  const s = scale;
  const base = `transform="translate(${x} ${y}) scale(${s})"`;
  if (scene === "court") {
    return `<g ${base}><rect x="8" y="80" width="210" height="18" fill="${palette.ink}"/><path d="M22 80h184L114 18Z" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="8" stroke-linejoin="round"/><rect x="50" y="88" width="25" height="94" fill="${palette.line}"/><rect x="100" y="88" width="25" height="94" fill="${palette.line}"/><rect x="150" y="88" width="25" height="94" fill="${palette.line}"/><rect x="24" y="182" width="184" height="20" fill="${palette.ink}"/><text x="114" y="69" text-anchor="middle" font-family="${fonts.serif}" font-size="38" font-weight="900" fill="${palette.red}">憲</text></g>`;
  }
  if (scene === "vote") {
    return `<g ${base}><rect x="18" y="42" width="190" height="128" rx="6" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="7"/><path d="M54 98h118M54 128h76" stroke="${palette.line}" stroke-width="9" stroke-linecap="round"/><circle cx="58" cy="36" r="24" fill="${palette.amber}" stroke="${palette.ink}" stroke-width="7"/><circle cx="116" cy="28" r="24" fill="${palette.redLight}" stroke="${palette.ink}" stroke-width="7"/><circle cx="174" cy="38" r="24" fill="${palette.pearl}" stroke="${palette.ink}" stroke-width="7"/><path d="M36 206h154" stroke="${palette.red}" stroke-width="18" stroke-linecap="round"/></g>`;
  }
  if (scene === "five") {
    const items = ["麥", "查", "罰", "人", "案"];
    return `<g ${base}>${items.map((t, i) => `<g transform="translate(${(i % 3) * 76} ${Math.floor(i / 3) * 76})"><rect width="58" height="58" rx="6" fill="${i === 2 ? palette.redLight : i === 1 ? palette.amberLight : "#FFFFFF"}" stroke="${palette.ink}" stroke-width="5"/><text x="29" y="39" text-anchor="middle" font-family="${fonts.sans}" font-size="25" font-weight="900" fill="${i === 2 ? palette.red : palette.ink}">${t}</text></g>`).join("")}</g>`;
  }
  if (scene === "petition") {
    return `<g ${base}><path d="M120 20l94 80v98H26v-98Z" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="7" stroke-linejoin="round"/><path d="M66 198v-72h108v72" fill="${palette.pearl}" stroke="${palette.ink}" stroke-width="7"/><path d="M2 224c38-34 72-34 110 0M122 224c38-34 72-34 110 0" stroke="${palette.amber}" stroke-width="12" stroke-linecap="round"/><circle cx="56" cy="226" r="18" fill="${palette.ink}"/><circle cx="176" cy="226" r="18" fill="${palette.ink}"/></g>`;
  }
  if (scene === "mic") {
    return `<g ${base}><rect x="76" y="16" width="72" height="114" rx="36" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="8"/><path d="M42 88c0 56 140 56 140 0M112 144v58M72 204h80" stroke="${palette.ink}" stroke-width="10" stroke-linecap="round"/><path d="M40 32c72 34 108 76 144 144" stroke="${palette.red}" stroke-width="13" stroke-linecap="round"/><path d="M184 32C112 66 76 108 40 176" stroke="${palette.red}" stroke-width="13" stroke-linecap="round"/></g>`;
  }
  if (scene === "hearing") {
    return `<g ${base}><circle cx="76" cy="78" r="50" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="8"/><rect x="114" y="112" width="98" height="20" rx="10" transform="rotate(42 114 112)" fill="${palette.ink}"/><rect x="20" y="162" width="190" height="66" rx="6" fill="${palette.redLight}" stroke="${palette.red}" stroke-width="6"/><text x="115" y="205" text-anchor="middle" font-family="${fonts.sans}" font-size="34" font-weight="900" fill="${palette.red}">?</text></g>`;
  }
  if (scene === "clock") {
    return `<g ${base}><circle cx="112" cy="112" r="92" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="8"/><path d="M112 54v64l48 36" stroke="${palette.red}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 218h156" stroke="${palette.amber}" stroke-width="15" stroke-linecap="round"/><path d="M28 42l-18-22M196 42l18-22" stroke="${palette.ink}" stroke-width="8" stroke-linecap="round"/></g>`;
  }
  if (scene === "barrier") {
    return `<g ${base}><rect x="12" y="40" width="82" height="148" rx="6" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="7"/><rect x="132" y="40" width="82" height="148" rx="6" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="7"/><text x="53" y="122" text-anchor="middle" font-family="${fonts.serif}" font-size="28" font-weight="900" fill="${palette.ink}">院</text><text x="173" y="122" text-anchor="middle" font-family="${fonts.serif}" font-size="28" font-weight="900" fill="${palette.ink}">檢</text><path d="M-4 214L232 14" stroke="${palette.red}" stroke-width="18" stroke-linecap="round"/><path d="M16 196L252 -4" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.8"/></g>`;
  }
  if (scene === "scale") {
    return `<g ${base}><path d="M112 22v176M50 198h124M42 76h140" stroke="${palette.ink}" stroke-width="9" stroke-linecap="round"/><path d="M42 76l-34 78h68Z" fill="${palette.amberLight}" stroke="${palette.ink}" stroke-width="6"/><path d="M182 76l-34 78h68Z" fill="${palette.redLight}" stroke="${palette.ink}" stroke-width="6"/><text x="42" y="139" text-anchor="middle" font-family="${fonts.sans}" font-size="18" font-weight="900" fill="${palette.ink}">國會</text><text x="182" y="139" text-anchor="middle" font-family="${fonts.sans}" font-size="18" font-weight="900" fill="${palette.ink}">界線</text></g>`;
  }
  return `<g ${base}><rect x="28" y="28" width="172" height="172" rx="8" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="8"/><path d="M58 82h112M58 118h112M58 154h72" stroke="${palette.line}" stroke-width="9" stroke-linecap="round"/><rect x="54" y="186" width="120" height="34" rx="4" fill="${palette.ink}"/><text x="114" y="211" text-anchor="middle" font-family="${fonts.mono}" font-size="20" font-weight="900" fill="#FFFFFF">addcourt.tw</text></g>`;
}

function panelSvg(panel, data, x, y, w, h, compact = false) {
  const artX = x + (compact ? 610 : 458);
  const artY = y + (compact ? 350 : 74);
  const artScale = compact ? 1.28 : 0.82;
  const owlSize = compact ? 300 : 168;
  const titleSize = compact ? 54 : 31;
  const lineSize = compact ? 34 : 21;
  const side = compact ? 76 : 30;
  const titles = titleLines(panel.title);
  const titleY = y + (compact ? 166 : 92);
  const titleLeading = compact ? 62 : 36;
  const copyY = y + (compact ? (titles.length > 1 ? 310 : 252) : (titles.length > 1 ? 168 : 136));
  const badgeY = y + (compact ? (titles.length > 1 ? 420 : 350) : 212);
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${palette.panel}" stroke="${palette.line}" stroke-width="2"/>
      <rect x="${x}" y="${y}" width="${w}" height="10" rx="4" fill="${palette.ink}"/>
      <text x="${x + side}" y="${y + (compact ? 82 : 48)}" font-family="${fonts.mono}" font-size="${compact ? 25 : 15}" font-weight="900" fill="${palette.muted}">PANEL ${panel.no} · ${esc(panel.kicker)}</text>
      ${textLines(titles, x + side, titleY, titleSize, titleLeading, palette.ink, fonts.serif, 900)}
      ${textLines(panel.lines, x + side, copyY, lineSize, compact ? 50 : 32)}
      ${badge(x + side, badgeY, panel.badge, panel.badgeTone, compact ? 30 : 18)}
      ${icon(panel.scene, artX, artY, artScale)}
      ${owl(data, x + (compact ? 676 : 548), y + (compact ? 648 : 158), owlSize, panel.no === "05" || panel.no === "08")}
    </g>
  `;
}

function webSvg(data) {
  const width = 768;
  const panelW = 704;
  const panelH = 274;
  const gap = 28;
  const top = 132;
  const height = top + panels.length * panelH + (panels.length - 1) * gap + 62;
  const body = panels.map((panel, i) => {
    const y = top + i * (panelH + gap);
    const connector = i === 0 ? "" : `<path d="M384 ${y - gap + 7}v${gap - 14}" stroke="${palette.line}" stroke-width="3" stroke-dasharray="7 7"/>`;
    return `${connector}${panelSvg(panel, data, 32, y, panelW, panelH)}`;
  }).join("");
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${defs()}
      <rect width="${width}" height="${height}" fill="${palette.pearl}"/>
      <rect width="${width}" height="${height}" fill="url(#paperGrid)" opacity="0.7"/>
      <text x="32" y="54" font-family="${fonts.mono}" font-size="16" font-weight="900" fill="${palette.red}">114年憲判字第1號</text>
      <text x="32" y="94" font-family="${fonts.serif}" font-size="38" font-weight="900" fill="${palette.ink}">漫畫式懶人包：權力需要界線</text>
      <text x="736" y="92" text-anchor="end" font-family="${fonts.mono}" font-size="15" font-weight="900" fill="${palette.muted}">ADD C0URT</text>
      ${body}
    </svg>
  `;
}

function igSvg(panel, data) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      ${defs()}
      <rect width="1080" height="1080" fill="${palette.pearl}"/>
      <rect width="1080" height="1080" fill="url(#paperGrid)" opacity="0.7"/>
      <rect x="50" y="50" width="980" height="980" rx="8" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="4"/>
      <rect x="50" y="50" width="980" height="20" fill="${palette.ink}"/>
      <text x="86" y="112" font-family="${fonts.mono}" font-size="24" font-weight="900" fill="${palette.red}">114年憲判字第1號 · ${panel.no}/10</text>
      <text x="994" y="112" text-anchor="end" font-family="${fonts.mono}" font-size="22" font-weight="900" fill="${palette.muted}">ADD C0URT</text>
      ${panelSvg(panel, data, 86, 148, 908, 820, true)}
    </svg>
  `;
}

function fbSvg(data) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      ${defs()}
      <rect width="1200" height="630" fill="${palette.pearl}"/>
      <rect width="1200" height="630" fill="url(#paperGrid)" opacity="0.55"/>
      <rect x="52" y="52" width="1096" height="526" rx="8" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="4"/>
      <rect x="52" y="52" width="1096" height="18" fill="${palette.ink}"/>
      <text x="92" y="128" font-family="${fonts.mono}" font-size="25" font-weight="900" fill="${palette.red}">114年憲判字第1號</text>
      <text x="92" y="206" font-family="${fonts.serif}" font-size="58" font-weight="900" fill="${palette.ink}">國會可以自己決定</text>
      <text x="92" y="278" font-family="${fonts.serif}" font-size="58" font-weight="900" fill="${palette.ink}">自己有多大的權力嗎？</text>
      ${textLines(["漫畫式懶人包：五大爭議、違憲判定、權力分立一次看懂。", "核心訊息：權力需要界線，誰都不能自己加權。"], 96, 350, 30, 46)}
      ${badge(96, 460, "權力需要界線", "red", 28)}
      ${icon("scale", 720, 188, 1.25)}
      ${owl(data, 846, 212, 280)}
      <text x="1106" y="526" text-anchor="end" font-family="${fonts.mono}" font-size="25" font-weight="900" fill="${palette.muted}">addcourt.tw</text>
    </svg>
  `;
}

function lineSvg(data) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520">
      ${defs()}
      <rect width="520" height="520" fill="${palette.pearl}"/>
      <rect width="520" height="520" fill="url(#paperGrid)" opacity="0.6"/>
      <rect x="24" y="24" width="472" height="472" rx="8" fill="#FFFFFF" stroke="${palette.ink}" stroke-width="3"/>
      <rect x="24" y="24" width="472" height="14" fill="${palette.ink}"/>
      <text x="48" y="78" font-family="${fonts.mono}" font-size="17" font-weight="900" fill="${palette.red}">114年憲判字第1號</text>
      <text x="48" y="130" font-family="${fonts.serif}" font-size="39" font-weight="900" fill="${palette.ink}">權力需要界線</text>
      <text x="48" y="172" font-family="${fonts.sans}" font-size="21" font-weight="800" fill="${palette.ink}">漫畫式懶人包</text>
      ${badge(48, 204, "10 格看懂", "amber", 20)}
      ${icon("court", 44, 276, 0.78)}
      ${owl(data, 252, 230, 202)}
      <text x="472" y="462" text-anchor="end" font-family="${fonts.mono}" font-size="18" font-weight="900" fill="${palette.muted}">addcourt.tw</text>
    </svg>
  `;
}

async function renderPng(svg, fileName, options = {}) {
  let image = sharp(Buffer.from(svg));
  if (options.width) {
    image = image.resize({ width: options.width });
  }
  await image.png().toFile(path.join(outDir, fileName));
}

async function main() {
  const owlData = await dataUri("owl.png");
  const web = webSvg(owlData);
  await fs.writeFile(path.join(outDir, "003-comic-lazybag-114-web.svg"), web.trimStart());
  await renderPng(web, "003-comic-lazybag-114-web@2x.png", { width: 1536 });

  for (const panel of panels) {
    await renderPng(igSvg(panel, owlData), `003-comic-lazybag-114-ig-${panel.no}.png`);
  }

  await renderPng(fbSvg(owlData), "003-comic-lazybag-114-fb.png");
  await renderPng(lineSvg(owlData), "003-comic-lazybag-114-line.png");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
