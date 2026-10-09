// 生成 public/og-image.png —— 1200×630 的社交分享卡（Open Graph / Twitter Card）。
//
// 这是**一次性资产生成脚本，不参与构建**：CI 设了 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1，
// 不下载浏览器，所以它不能在 CI 里跑。产出物 og-image.png 直接提交进仓库。
// 需要重新生成时手动执行：
//
//   npx playwright install chromium
//   node tools/make-og-image.mjs
//
// 图标用站点自己的 public/favicon.ico，不用别的图片资源。
// 该 .ico 里只有 48/32/16 三档、且都是 BMP 帧（无 PNG 帧），最大 48×48 ——
// 所以卡片上的图标按 96px 显示（2× 放大），再大就会明显发虚。
//
// 配色取自站点自身（src/App.vue:210 body 背景 #2b2b2b，强调色 #ffbe31）。

import { readFileSync } from "fs";
import { chromium } from "playwright";

const outPath = new URL("../public/og-image.png", import.meta.url);
const iconData = readFileSync(new URL("../public/favicon.ico", import.meta.url)).toString("base64");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: #2b2b2b;
    font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", "Hiragino Sans GB", sans-serif;
    color: #fff;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative;
  }
  /* 顶部一条金色描边，和站内 sponsor-banner 的 accent 呼应 */
  .rule { position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: #ffbe31; }
  .glow {
    position: absolute; width: 900px; height: 900px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,190,49,0.13) 0%, rgba(255,190,49,0) 65%);
    top: -260px; left: 50%; transform: translateX(-50%);
  }
  .inner { position: relative; display: flex; flex-direction: column; align-items: center; }
  .icon { width: 96px; height: 96px; margin-bottom: 36px; }
  h1 { font-size: 68px; font-weight: 700; color: #eee1c5; letter-spacing: 2px; }
  .sub { margin-top: 26px; font-size: 31px; color: #ffbe31; letter-spacing: 1px; }
  .meta { margin-top: 14px; font-size: 25px; color: #9a9a9a; letter-spacing: 1px; }
  .url {
    position: absolute; bottom: 44px; left: 0; width: 100%;
    text-align: center; font-size: 24px; color: #6f6f6f; letter-spacing: 2px;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="rule"></div>
  <div class="inner">
    <img class="icon" src="data:image/x-icon;base64,${iconData}" alt="">
    <h1>青魔法师技能学习地点查询</h1>
    <div class="sub">最终幻想 14 · 124 个青魔法</div>
    <div class="meta">408 条获取途径 · 野怪坐标 / 副本 / 假面狂欢</div>
  </div>
  <div class="url">bluemagic.badend.cn</div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.screenshot({ path: outPath.pathname.replace(/^\//, ""), type: "png" });
await browser.close();

console.log(`[og-image] 已生成 public/og-image.png（1200×630，图标取自 public/favicon.ico）`);
