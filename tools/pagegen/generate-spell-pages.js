// 构建期生成「对 bot 友好的静态层」：技能详情页 + sitemap.xml + llms.txt。
//
// 背景：整站只有一个 URL，124 个技能挤在一份 ~230 KB 的预渲染 HTML 里。
// AI bot 抓取普遍有截断，搜索引擎也没有任何页面能命中「单个技能 + 获取途径」
// 的查询。本脚本从 tools/data/spells.json（prebuild 自动重生成）为每个技能产出：
//
//   dist/spell/<action id>/index.html —— 5~8 KB 的纯内容页：名称、等级、编号、
//     版本、官方效果（tools/data/descriptions.json，构建期抓取）、全部获取途径与
//     打法备注、上/下一篇、FAQPage + BreadcrumbList JSON-LD。
//     不含任何 JS，不 hydrate —— 交互留在主应用，这里只做内容层。
//     页面 HTML 由 tools/pagegen/spell-page-template.js 渲染（yarn dev 的按需
//     渲染中间件复用同一份模板，见 vite.config.ts）。
//
//   dist/sitemap.xml —— 首页 + 全部详情页（原 public/sitemap.xml 只有一条记录）。
//   dist/llms.txt   —— llmstxt 约定的站点索引（详情页链接清单）。
//   dist/llms-full.txt —— 全部技能的效果与途径的纯 Markdown，一抓即得。
//
// base 适配：部署在根域（EdgeOne / Cloudflare）与 /blue-mage/ 子路径（GitHub
// Pages）两种 base 下都要能工作，所以从 dist/index.html 的资源引用推断 base
// （与 prerender.js 的做法一致）；canonical / sitemap / llms 里的绝对地址
// 统一用 SITE_ORIGIN。

const fs = require("fs");
const path = require("path");
const {
  renderSpellPage,
  beijingToday,
  TYPE_LABELS,
  methodText,
} = require("./spell-page-template.js");

const distDir = path.resolve(__dirname, "../../dist");
const spellsPath = path.resolve(__dirname, "../data/spells.json");
const descriptionsPath = path.resolve(__dirname, "../data/descriptions.json");

// 与 public/robots.txt、index.html 的 og:url 保持一致（都是硬编码同一域名）
const SITE_ORIGIN = "https://bluemagic.badend.cn";

// 从 dist/index.html 的第一个 /assets/ 引用推断部署 base：
// 根域构建 → "/"，子路径构建 → "/blue-mage/"。返回值恒以 / 结尾。
function detectBasePrefix() {
  const html = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
  const localRefs = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
  const first = localRefs.find((u) => u.includes("/assets/"));
  if (!first) {
    throw new Error("dist/index.html 里找不到 /assets/ 引用，无法推断部署 base。请先执行 vite build。");
  }
  return first.slice(0, first.indexOf("assets/"));
}

let hashedAssets = null;
// 把 spells.json 里的原始图标名（072237.png）映射到构建产物里带 content hash
// 的文件名（072237.e0453b74.png）。详情页不进 Vite 资源管道，只能反查产物目录。
// 命中数不是 1 就让构建失败 —— 静默用错图标比没有图标更糟。
function findHashedAsset(iconName) {
  if (!hashedAssets) hashedAssets = fs.readdirSync(path.join(distDir, "assets"));
  const m = iconName.match(/^(.*)\.([a-z0-9]+)$/i);
  if (!m) throw new Error(`图标文件名不合法：${iconName}`);
  const re = new RegExp(`^${m[1]}\\.[0-9a-f]{8}\\.${m[2]}$`, "i");
  const hits = hashedAssets.filter((f) => re.test(f));
  if (hits.length !== 1) {
    throw new Error(
      `dist/assets 里找不到唯一的 ${m[1]}.<hash>.${m[2]}（命中 ${hits.length} 个）。` +
        `通常是 spells.json 的图标名与 src/assets/icons 不同步。`
    );
  }
  return hits[0];
}

function buildSitemap(spells, base) {
  const today = beijingToday();
  const urls = [
    `  <url>\n    <loc>${SITE_ORIGIN}${base}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
    ...spells.map(
      (s) =>
        `  <url>\n    <loc>${SITE_ORIGIN}${base}spell/${s.action}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

function buildLlmsFull(spells, descriptions, base) {
  const sections = spells.map((s) => {
    const desc = descriptions[s.action] && descriptions[s.action].text;
    const methods = s.method
      .map((m, i) => {
        const label = TYPE_LABELS[m.type] || m.type;
        const lv = m.level ? `（Lv.${m.level}）` : "";
        const note = m.note ? `\n   备注：${m.note}` : "";
        return `${i + 1}. [${label}] ${methodText(m)}${lv}${note}`;
      })
      .join("\n");
    return [
      `## ${s.spell}（No.${s.no} · Lv.${s.level} · ${s.patch}版本）`,
      "",
      desc ? `效果：${desc}` : "效果：（缺失，请检查 tools/data/descriptions.json）",
      "",
      `获取途径（${s.method.length} 条）：`,
      methods,
      "",
      `详情页：${SITE_ORIGIN}${base}spell/${s.action}/`,
    ].join("\n");
  });
  return (
    `# FF14 青魔法师全技能效果与获取途径\n\n` +
    `> 最终幻想14（FFXIV）青魔法师（Blue Mage）全部 ${spells.length} 个青魔法的官方效果与获取途径。\n` +
    `> 逐技能的独立网页见 llms.txt；交互式查询工具（按副本 / 地图筛选、标记学习进度）在首页。\n\n` +
    sections.join("\n\n") +
    "\n"
  );
}

function buildLlmsIndex(spells, base) {
  const links = spells.map(
    (s) => `- [${s.spell}（No.${s.no} · Lv.${s.level} · ${s.patch}版本）](${SITE_ORIGIN}${base}spell/${s.action}/)`
  );
  return (
    `# 青魔法来源查询\n\n` +
    `> 最终幻想14（FFXIV）青魔法师（Blue Mage）全部 ${spells.length} 个青魔法的学习地点与获取途径查询。\n` +
    `> 每个技能有独立详情页：官方效果描述、全部获取途径、掉落怪物等级与打法备注。\n` +
    `> 全量纯文本数据见 [llms-full.txt](${SITE_ORIGIN}${base}llms-full.txt)。\n\n` +
    `## 技能详情页\n\n${links.join("\n")}\n`
  );
}

function main() {
  const spells = JSON.parse(fs.readFileSync(spellsPath, "utf-8"));
  const descriptions = fs.existsSync(descriptionsPath)
    ? JSON.parse(fs.readFileSync(descriptionsPath, "utf-8"))
    : {};
  if (!spells.length) throw new Error("tools/data/spells.json 是空的。");

  const base = detectBasePrefix();
  const spellDir = path.join(distDir, "spell");
  fs.mkdirSync(spellDir, { recursive: true });

  const sorted = [...spells].sort((a, b) => Number(a.no) - Number(b.no));
  const resolveIcon = (iconName) => `${base}assets/${findHashedAsset(iconName)}`;

  let missingDesc = 0;
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    const descEntry = descriptions[s.action];
    if (!descEntry || !descEntry.text || !descEntry.html) missingDesc++;
    const html = renderSpellPage({
      spell: s,
      descriptionHtml: (descEntry && descEntry.html) || "",
      origin: SITE_ORIGIN,
      base,
      prev: sorted[i - 1] || null,
      next: sorted[i + 1] || null,
      resolveIcon,
    });

    // 冒烟断言：技能名和全部途径必须真的进了页面，防止模板或数据问题
    // 静默产出空壳（与 prerender.js 的风格一致）。
    if (!html.includes(s.spell)) throw new Error(`No.${s.no} ${s.spell} 的详情页里没有技能名。`);
    const methodCount = (html.match(/class="method"/g) || []).length;
    if (methodCount !== s.method.length) {
      throw new Error(
        `No.${s.no} ${s.spell} 的详情页只有 ${methodCount} 条途径（期望 ${s.method.length}）。`
      );
    }
    const dir = path.join(spellDir, String(s.action));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
  }

  fs.writeFileSync(path.join(distDir, "sitemap.xml"), buildSitemap(sorted, base), "utf-8");
  fs.writeFileSync(path.join(distDir, "llms.txt"), buildLlmsIndex(sorted, base), "utf-8");
  fs.writeFileSync(path.join(distDir, "llms-full.txt"), buildLlmsFull(sorted, descriptions, base), "utf-8");

  if (missingDesc) {
    console.warn(
      `⚠️  ${missingDesc} 个技能没有缓存描述（tools/data/descriptions.json），` +
        `对应详情页将没有「效果」一栏。请先运行 node tools/update/update-descriptions.js。`
    );
  }

  const pages = fs.readdirSync(spellDir).length;
  if (pages !== sorted.length) {
    throw new Error(`dist/spell/ 下有 ${pages} 个页面，期望 ${sorted.length} 个。`);
  }
  const llmsFullBytes = Buffer.byteLength(
    fs.readFileSync(path.join(distDir, "llms-full.txt"))
  );
  console.log(
    `[spell-pages] ${pages} 个详情页（base=${base}）+ sitemap.xml（${sorted.length + 1} 条 URL）+ ` +
      `llms.txt / llms-full.txt（${(llmsFullBytes / 1024).toFixed(1)} KB）生成完毕` +
      (missingDesc ? `，⚠️ ${missingDesc} 个技能缺描述` : "")
  );
}

main();
