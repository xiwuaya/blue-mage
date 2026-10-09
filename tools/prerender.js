// 构建时预渲染：把 App 渲染成静态 HTML 注入 dist/index.html。
//
// 为什么是 CommonJS：package.json 没有 "type": "module"，tools/ 下现有脚本
// 全是 CJS，而且 vite build --ssr 的产物固定是 CJS，require() 直连最省事。
//
// 运行前提：先执行 `vite build --ssr src/entry-server.ts --outDir dist-ssr`。
// 见 package.json 的 "prerender" 脚本。

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const distDir = path.resolve(__dirname, "../dist");
const ssrEntry = path.resolve(__dirname, "../dist-ssr/entry-server.js");
const indexPath = path.join(distDir, "index.html");

const APP_PLACEHOLDER = "<!--app-html-->";
const TELEPORT_PLACEHOLDER = "<!--teleport-html-->";

/**
 * 替换必须用 replacer 函数形式：SSR 出来的 HTML 里只要出现 $& / $' / $1
 * 这类片段，String.replace 会把它当替换模式解析，静默产出错乱的 HTML。
 *
 * 占位符缺失时直接抛错而不是静默 no-op —— 静默 no-op 的产物正是这次要消灭的
 * 那个 442 字节空壳，而且构建会"成功"，没人会发现。
 */
function inject(html, placeholder, value) {
  if (!html.includes(placeholder)) {
    throw new Error(
      `dist/index.html 里找不到占位符 ${placeholder}。预渲染中止 —— ` +
        `否则会静默产出一个空壳页面。请检查 index.html 是否被改动。`
    );
  }
  return html.replace(placeholder, () => value);
}

async function main() {
  if (!fs.existsSync(ssrEntry)) {
    throw new Error(
      `找不到 SSR 产物 ${ssrEntry}。` +
        `请先执行 vite build --ssr src/entry-server.ts --outDir dist-ssr`
    );
  }
  if (!fs.existsSync(indexPath)) {
    throw new Error(`找不到 ${indexPath}，请先执行 vite build`);
  }

  // 在纯 node 里 require：地图库 / kit-tooltip 只要有一条链没断干净，
  // 这里会立刻抛 "window is not defined"，构建失败而不是悄悄上线空壳。
  const { createApp } = require(ssrEntry);
  const { renderToString } = require("@vue/server-renderer");

  const ctx = {};
  const appHtml = await renderToString(createApp(), ctx);

  // 冒烟断言：tools/spells.json 会被 prebuild 重新生成，条目数可能变化，
  // 所以卡下限而不是等值 123，避免数据更新时误伤。
  const spellCount = (appHtml.match(/class="methods"/g) || []).length;
  if (spellCount < 100) {
    throw new Error(
      `预渲染只产出 ${spellCount} 个技能条目（期望 ~123），中止。` +
        `这通常意味着 App 渲染提前失败或过滤逻辑变了。`
    );
  }

  let html = fs.readFileSync(indexPath, "utf-8");

  // index.html 的标题/描述里写死了技能数量（"124 个青魔法"），而 tools/spells.json
  // 由 prebuild 自动重新生成 —— 加了技能却忘记改标题，数字就会悄悄过期。
  // 对不上就让构建失败，而不是让搜索结果里挂着一个错误数字。
  // 必须校验**每一处**出现，不能只看第一个：title 和 description 里的数字
  // 若互相不一致（改了一处忘了另一处），只取首个匹配会静默放行。
  const totalSpells = require("../tools/spells.json").length;
  const statedAll = [...html.matchAll(/(\d+)\s*个青魔法/g)].map((m) => Number(m[1]));
  const wrong = [...new Set(statedAll.filter((n) => n !== totalSpells))];
  if (wrong.length) {
    throw new Error(
      `index.html 里出现「${wrong.join("、")} 个青魔法」，但 tools/spells.json 里有 ${totalSpells} 个` +
        `（共检查到 ${statedAll.length} 处）。` +
        `请同步更新 index.html（title / description / og:* / twitter:*）` +
        `以及 public/og-image.png（用 tools/make-og-image.mjs 重新生成）。`
    );
  }

  // Teleport 内容落在 renderToString 的第二个参数（SSR context）里，不进主 HTML。
  // 必须注入到 <body> 的第一个子节点位置：hydration 时 hydrateTeleport 从
  // `target._lpa || target.firstChild` 起步（即 document.body.firstChild），
  // 失配会走 handleMismatch —— 那是 remove(node) 而不是打补丁，可能把 #app 删掉。
  const teleportHtml = (ctx.teleports && ctx.teleports.body) || "";
  html = inject(html, TELEPORT_PLACEHOLDER, teleportHtml);

  const bodyAt = html.indexOf("<body>");
  if (bodyAt < 0) {
    throw new Error("dist/index.html 里找不到 <body>");
  }
  if (teleportHtml) {
    const actual = html.slice(bodyAt + "<body>".length, bodyAt + "<body>".length + teleportHtml.length);
    if (actual !== teleportHtml) {
      throw new Error(
        "Teleport 内容没有紧贴 <body>，hydration 会走 handleMismatch 删节点。" +
          "请确认 index.html 里 <!--teleport-html--> 后面没有空格或换行。"
      );
    }
  }

  html = inject(html, APP_PLACEHOLDER, appHtml);

  fs.writeFileSync(indexPath, html, "utf-8");

  const bytes = Buffer.byteLength(html, "utf8");
  const gzip = zlib.gzipSync(Buffer.from(html, "utf8")).length;
  const zh = (html.match(/[一-龥]/g) || []).length;
  console.log(
    `[prerender] ${spellCount} 个技能条目 / ${zh} 个中文字符，` +
      `HTML ${(bytes / 1024).toFixed(1)} KB（gzip ${(gzip / 1024).toFixed(1)} KB）`
  );
}

main().catch((e) => {
  console.error("[prerender] 失败：", e.message || e);
  process.exit(1);
});
