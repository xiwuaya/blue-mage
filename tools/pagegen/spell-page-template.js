// 技能详情页 HTML 模板 —— 纯函数模块，不落盘、不读构建产物。
//
// 两个消费方：
//   1. tools/pagegen/generate-spell-pages.js —— 构建期写 dist/spell/<id>/index.html
//      （resolveIcon 反查 dist/assets 里带 content hash 的文件名）；
//   2. vite.config.ts 的 spellPagesInDev 中间件 —— yarn dev 下按需渲染，
//      因为构建产物在 dev 服务器里不存在，点击「详情页」会被 SPA fallback
//      兜回壳页（resolveIcon 直接指 /src/ 源文件路径）。
//
// 途经文本的渲染格式与 src/lib/spell.ts 的 renderSpellMethod 保持一致 ——
// 那边是唯一事实来源，改动渲染格式时两处要一起改。

const fs = require("fs");
const path = require("path");

// 与 Method.vue 的 colorAliasMap 一致（缺省白色）
const COLOR_ALIAS = {
  red: "#ca3a3a",
  blue: "#0000ff",
  green: "#00ff00",
  yellow: "#ffff00",
  grey: "#666",
};

// 类型徽标文案。以 tools/update/update-methods.js 的 typeMap（CSV 中文列）为基准，
// fate / special 补常用叫法。
const TYPE_LABELS = {
  map: "野怪",
  raid: "大型任务",
  dungeon: "迷宫",
  trail: "讨伐战",
  fate: "危命任务",
  special: "特殊",
  treasure: "寻宝",
  guildhests: "行会令",
  hunt: "怪物狩猎",
  carnivale: "假面狂欢",
  levequests: "理符任务",
  jobquest: "职业任务",
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// 与 update-date.js 相同的北京时间偏移（避免 UTC 差一天）
function beijingToday() {
  const now = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
  const p = (n) => String(n).padStart(2, "0");
  return `${now.getUTCFullYear()}-${p(now.getUTCMonth() + 1)}-${p(now.getUTCDate())}`;
}

function truncate(s, max) {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function methodText(m) {
  switch (m.type) {
    case "map":
    case "hunt":
    case "levequests": {
      const pos = m.position;
      const posText =
        pos && pos.length
          ? typeof pos === "string"
            ? `(${pos})`
            : `(x:${pos[0]}, y:${pos[1]}${pos[2] ? `, z:${pos[2]}` : ""})`
          : "";
      return `${m.map} ${m.rank ? `[${m.rank}]` : ""}${posText} - ${m.mob}`;
    }
    case "raid":
    case "dungeon":
    case "trail":
    case "treasure":
    case "guildhests":
    case "carnivale":
    case "jobquest":
      return `${m.name} - ${m.mob}`;
    case "fate":
      return `${m.map} - ${m.name} - ${m.mob}`;
    case "special":
      return `${m.text}`;
    default:
      return m.name || m.map || m.text || "";
  }
}

// 途径的「地点短语」（meta description / llms 索引用）
function methodLocation(m) {
  return m.name || m.map || m.text || "";
}

function methodColor(m) {
  if (!m.color) return "#ffffff";
  return COLOR_ALIAS[m.color.toLowerCase()] || m.color;
}

const PAGE_CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#2b2b2b;color:#fff;font-family:"Avenir",Helvetica,Arial,sans-serif;line-height:1.65}
.crumbs{max-width:760px;margin:0 auto;padding:16px 16px 0;font-size:.85rem;opacity:.8}
.crumbs a{color:#ffbe31;text-decoration:none}
.crumbs a:hover{text-decoration:underline}
main{max-width:760px;margin:0 auto;padding:4px 16px 32px}
.head{display:flex;gap:16px;align-items:center;margin:20px 0 8px}
.icon{width:64px;height:64px;border-radius:6px;box-shadow:0 2px 2px #070707;flex:none}
h1{margin:0;font-size:1.6rem;font-weight:600}
.facts{margin:4px 0 0;opacity:.8;font-size:.9rem}
h2{font-size:1.05rem;color:#ffbe31;margin:28px 0 8px}
.method{margin:0 0 14px;list-style:none}
ol.methods{padding-left:0}
.badge{display:inline-block;font-size:.72rem;background:#3a3a3a;border-radius:4px;padding:1px 6px;margin-right:8px;vertical-align:1px;color:#ddd}
sup{opacity:.8}
.note{margin:3px 0 0;font-size:.8rem;opacity:.75}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:28px}
.pager a{color:#ffbe31;text-decoration:none}
.pager a:hover{text-decoration:underline}
footer{border-top:1px solid #444;margin-top:28px;padding-top:12px;font-size:.85rem}
footer a{color:#ffbe31;text-decoration:none}
footer a:hover{text-decoration:underline}
.meta{opacity:.6;font-size:.78rem}
@media (max-width:480px){.head{gap:10px}.icon{width:48px;height:48px}h1{font-size:1.3rem}}
`;

/**
 * 渲染一个技能详情页的完整 HTML。
 *
 * @param {object} opts
 * @param {object} opts.spell         tools/data/spells.json 里的一条
 * @param {string} [opts.descriptionHtml]
 *     官方效果描述的 HTML 版本（tools/data/descriptions.json 的 html 字段，
 *     由 API 的 Description@as(html) 变换生成：内联颜色 span + <br>，
 *     全量数据只含 span/br 两种标签）。与 kit-tooltip 一样按可信内容
 *     直接注入，不做转义 —— 转义会失去着色效果。
 * @param {string} [opts.origin]      绝对地址 origin（如 https://bluemagic.badend.cn），
 *                                    dev 传空串，canonical / og 退化为相对路径
 * @param {string} [opts.base]        部署 base，恒以 / 结尾（"/" 或 "/blue-mage/"）
 * @param {object|null} [opts.prev]   上一篇（按 no 排序）
 * @param {object|null} [opts.next]   下一篇
 * @param {(iconName: string) => string} opts.resolveIcon
 *     把 spells.json 里的图标文件名（072237.png）解析成可访问的 URL。
 *     构建期反查 dist/assets 的 hash 文件名；dev 指向 /src/ 源文件。
 * @param {string} [opts.buildDate]   页脚展示的构建日期
 */
function renderSpellPage({
  spell,
  descriptionHtml = "",
  origin = "",
  base = "/",
  prev = null,
  next = null,
  resolveIcon,
  buildDate = beijingToday(),
}) {
  if (typeof resolveIcon !== "function") {
    throw new Error("renderSpellPage 需要 resolveIcon 函数（构建期与 dev 的图标解析方式不同）。");
  }

  const urlPath = `${base}spell/${spell.action}/`;
  const absUrl = `${origin}${urlPath}`;
  const locationList = [...new Set(spell.method.map(methodLocation).filter(Boolean))];
  const metaDesc = truncate(
    `${spell.spell}（No.${spell.no}，Lv.${spell.level}，${spell.patch} 版本）的获取途径共 ` +
      `${spell.method.length} 条：${locationList.slice(0, 3).join("、")}。含掉落怪物、等级与打法备注。`,
    155
  );
  const title = `${spell.spell} - FF14青魔法获取途径与学习地点`;

  const answerText =
    `${spell.spell}（No.${spell.no}，Lv.${spell.level}）是最终幻想14青魔法师技能，共 ${spell.method.length} 条获取途径：\n` +
    spell.method
      .map((m, i) => {
        const label = TYPE_LABELS[m.type] || m.type;
        const lv = m.level ? `（Lv.${m.level}）` : "";
        const note = m.note ? ` 备注：${m.note}` : "";
        return `${i + 1}. [${label}] ${methodText(m)}${lv}${note}`;
      })
      .join("\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "青魔法来源查询",
            item: `${origin}${base}`,
          },
          { "@type": "ListItem", position: 2, name: spell.spell, item: absUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `FF14 ${spell.spell}怎么学？有哪些获取途径？`,
            acceptedAnswer: { "@type": "Answer", text: answerText },
          },
        ],
      },
    ],
  };

  const iconUrl = resolveIcon(spell.icon_book);
  const iconSrcset = `${iconUrl} 1x, ${resolveIcon(spell.icon_book_hr1)} 2x`;

  const methodsHtml = spell.method
    .map(
      (m) => `
      <li class="method">
        <span class="badge">${esc(TYPE_LABELS[m.type] || m.type)}</span>
        <span style="color:${esc(methodColor(m))}">${esc(methodText(m))} <sup>Lv.${esc(m.level ?? "")}</sup></span>
        ${m.note ? `<p class="note">${esc(m.note)}</p>` : ""}
      </li>`
    )
    .join("");

  const descHtml = descriptionHtml
    ? `<section><h2>效果</h2><p>${descriptionHtml}</p></section>`
    : "";

  const pager = `
    <nav class="pager">
      ${prev ? `<a href="${base}spell/${prev.action}/" rel="prev">« No.${esc(prev.no)} ${esc(prev.spell)}</a>` : "<span></span>"}
      ${next ? `<a href="${base}spell/${next.action}/" rel="next">No.${esc(next.no)} ${esc(next.spell)} »</a>` : "<span></span>"}
    </nav>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${esc(absUrl)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="青魔法来源查询">
<meta property="og:locale" content="zh_CN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${esc(absUrl)}">
<meta property="og:image" content="${origin}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(metaDesc)}">
<meta name="twitter:image" content="${origin}/og-image.png">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>${PAGE_CSS}</style>
</head>
<body>
<nav class="crumbs"><a href="${base}">首页</a> › <a href="${base}">青魔法一览</a> › ${esc(spell.spell)}</nav>
<main>
<header class="head">
  <img class="icon" src="${iconUrl}" srcset="${iconSrcset}" alt="${esc(spell.spell)}图标" width="64" height="64">
  <div>
    <h1>${esc(spell.spell)}</h1>
    <p class="facts">No.${esc(spell.no)} · Lv.${esc(spell.level)} · ${esc(spell.patch)} 版本 · 最终幻想14 青魔法师技能</p>
  </div>
</header>
${descHtml}
<section>
<h2>获取途径（${spell.method.length} 条）</h2>
<ol class="methods">${methodsHtml}
</ol>
</section>
${pager}
<footer>
<p><a href="${base}?search=${encodeURIComponent(spell.spell)}">在查询工具中打开「${esc(spell.spell)}」</a>（可按副本 / 地图筛选，标记学习进度）</p>
<p class="meta">青魔法来源查询 · 构建于 ${esc(buildDate)} · 游戏数据来源：最终幻想14</p>
</footer>
</main>
</body>
</html>
`;
}

// dev 中间件用：按 action id 找技能、取描述、算上/下一篇，
// 与 generate-spell-pages.js 的 main() 保持同一套取数逻辑。
function loadSpellContext(actionId) {
  const spellsPath = path.resolve(__dirname, "../data/spells.json");
  const descriptionsPath = path.resolve(__dirname, "../data/descriptions.json");
  const spells = JSON.parse(fs.readFileSync(spellsPath, "utf-8"));
  const descriptions = fs.existsSync(descriptionsPath)
    ? JSON.parse(fs.readFileSync(descriptionsPath, "utf-8"))
    : {};
  const sorted = [...spells].sort((a, b) => Number(a.no) - Number(b.no));
  const index = sorted.findIndex((s) => String(s.action) === String(actionId));
  if (index < 0) return null;
  const descEntry = descriptions[sorted[index].action];
  return {
    spell: sorted[index],
    descriptionHtml: (descEntry && descEntry.html) || "",
    prev: sorted[index - 1] || null,
    next: sorted[index + 1] || null,
  };
}

module.exports = {
  COLOR_ALIAS,
  TYPE_LABELS,
  esc,
  beijingToday,
  methodText,
  methodLocation,
  renderSpellPage,
  loadSpellContext,
};
