// hydration 回归测试：用真实浏览器验证预渲染产物的行为。
//
//   yarn build && yarn verify:hydration
//
// 为什么需要它：预渲染引入了一类静态检查发现不了的失败模式 ——
// Teleport 注入位置不对时，Vue 的 handleMismatch 走的是 remove(node) 而非打补丁，
// 会把 <div id="app"> 整个删掉。见 docs/adr/0004-build-time-prerender.md。
//
// 需要先跑 `yarn build`（产出 dist/），并且必须是**根域**构建（base=/）：
// 本脚本用 vite preview，它读 vite.config.ts 的 base，不读构建时的 --base 参数。
//
// 首次使用需下载浏览器：npx playwright install chromium

import { preview } from "vite";
import { chromium } from "playwright";

const distIndex = new URL("../dist/index.html", import.meta.url);
const results = [];
let failed = 0;

function check(name, ok, detail = "") {
  const oneLine = String(detail).replace(/\s+/g, " ").trim();
  results.push(`${ok ? "  PASS" : "  FAIL"}  ${name}${oneLine ? "  — " + oneLine.slice(0, 160) : ""}`);
  if (!ok) failed++;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- 前置检查
const { readFileSync, existsSync } = await import("fs");
if (!existsSync(distIndex)) {
  console.error("找不到 dist/index.html —— 请先执行 `yarn build`。");
  process.exit(1);
}
const distHtml = readFileSync(distIndex, "utf-8");
if (!/class="methods"/.test(distHtml)) {
  console.error(
    "dist/index.html 里没有预渲染内容（找不到 class=\"methods\"）—— 请执行 `yarn build`，" +
      "不要跳过其中的 prerender 步骤。"
  );
  process.exit(1);
}
if (/\/blue-mage\/assets\//.test(distHtml)) {
  console.error(
    "dist/ 当前是**子路径**构建（引用了 /blue-mage/assets/...），本脚本只能测根域构建。" +
      "请先执行 `yarn build` 重新产出根域版本。"
  );
  process.exit(1);
}
const prerendered = (distHtml.match(/class="methods"/g) || []).length;

// ---------------------------------------------------------------- 启动预览服务器
const server = await preview({
  logLevel: "silent",
  preview: { port: 5050, strictPort: true },
});
const port = server.httpServer.address().port;
// 不要叫 URL：会遮蔽全局 URL 构造函数，让上面的 `new URL(...)` 落进暂时性死区
const PAGE_URL = `http://localhost:${port}/`;
console.log(`预览服务器 ${PAGE_URL}（dist/index.html 预渲染了 ${prerendered} 个技能条目）\n`);

const browser = await chromium.launch();

// ---------------------------------------------------------------- 场景执行器
async function run(name, { storage, fn }) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  const pageErrors = [];
  const hydrationMsgs = [];

  if (storage) {
    await context.addInitScript((s) => {
      for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
    }, storage);
  }

  const page = await context.newPage();
  page.on("console", (m) => {
    const t = m.text();
    if (/hydrat/i.test(t)) hydrationMsgs.push(t);
    if (m.type() === "error") consoleErrors.push(t);
  });
  page.on("pageerror", (e) => pageErrors.push(e.message));

  const start = results.length;
  try {
    await fn(page, { hydrationMsgs });
  } catch (e) {
    check(`${name} · 执行异常`, false, e.message);
  }

  const realErrors = consoleErrors.filter((t) => !/hydrat/i.test(t));
  check(`${name} · 无未捕获异常`, pageErrors.length === 0, pageErrors.join(" | "));
  check(`${name} · 无 console.error`, realErrors.length === 0, realErrors.join(" | "));

  console.log(`\n### ${name}`);
  console.log(results.slice(start).join("\n"));
  await context.close();
}

// 0 = 未掌握，1 = 已掌握。参数是"前 N 个为未掌握"，其余已掌握。
const statusFirstNUnlearned = (n) =>
  JSON.stringify(Array.from({ length: 124 }, (_, i) => (i < n ? 0 : 1)));

// ---------------------------------------------------------------- 场景 1：全新访客
await run("场景1 全新访客（localStorage 全空）", {
  fn: async (page, { hydrationMsgs }) => {
    await page.goto(PAGE_URL, { waitUntil: "load" });
    await sleep(1500); // 等 hydration 跑完

    const appChildren = await page.evaluate(() => document.querySelectorAll("#app > *").length);
    check(
      "场景1 #app 只有 1 个元素子节点（handleMismatch 没有删掉容器）",
      appChildren === 1,
      `实际 ${appChildren}`
    );
    check("场景1 #app > section 存在", await page.evaluate(() => !!document.querySelector("#app > section")));

    const spellCount = await page.evaluate(() => document.querySelectorAll(".methods").length);
    check("场景1 技能列表完整（123 —— 水炮按业务默认已掌握）", spellCount === 123, `实际 ${spellCount}`);

    await page.waitForSelector(".modal-backdrop", { timeout: 4000 }).catch(() => {});
    const helpVisible = await page.locator(".modal-backdrop").first().isVisible().catch(() => false);
    check("场景1 帮助弹窗正常出现", helpVisible);

    check("场景1 hydration 零警告", hydrationMsgs.length === 0, hydrationMsgs.join(" | "));
  },
});

// ---------------------------------------------------------------- 场景 2：老用户
await run("场景2 老用户（已存档进度 + 等级 30 + 关掉 raid/trail/dungeon）", {
  storage: {
    "spell-status": statusFirstNUnlearned(50),
    "has-seen-help": "true",
    level: "30",
    "filter-types": JSON.stringify({
      carnivale: true,
      map: true,
      dungeon: false,
      trail: false,
      raid: false,
      other: true,
    }),
    notLearnedOnly: "true",
  },
  fn: async (page, { hydrationMsgs }) => {
    await page.goto(PAGE_URL, { waitUntil: "load" });
    await sleep(1800);

    const appChildren = await page.evaluate(() => document.querySelectorAll("#app > *").length);
    check("场景2 #app 只有 1 个元素子节点", appChildren === 1, `实际 ${appChildren}`);

    const spellCount = await page.evaluate(() => document.querySelectorAll(".methods").length);
    check("场景2 列表按本地配置过滤（0 < n < 123）", spellCount > 0 && spellCount < 123, `实际 ${spellCount}`);

    const helpVisible = await page.locator(".modal-backdrop").first().isVisible().catch(() => false);
    check("场景2 老用户不再弹帮助弹窗", !helpVisible);

    // 已拍板接受的状态不一致：允许出现，但只允许这一条。
    const unexpected = hydrationMsgs.filter((t) => !/Hydration completed but contains mismatches/.test(t));
    check("场景2 hydration 只出现预期内的 mismatch 提示", unexpected.length === 0, unexpected.join(" | "));
  },
});

// ---------------------------------------------------------------- 场景 3：交互与懒加载
await run("场景3 交互（搜索 / 勾选 / 地图弹窗懒加载）", {
  storage: { "has-seen-help": "true", "spell-status": statusFirstNUnlearned(124) },
  fn: async (page) => {
    await page.goto(PAGE_URL, { waitUntil: "load" });
    await sleep(1200);

    const full = await page.evaluate(() => document.querySelectorAll(".methods").length);
    check("场景3 初始列表完整（124 —— 显式存档时水炮也算未掌握）", full === 124, `实际 ${full}`);

    await page.fill("input.search", "水炮");
    await sleep(600);
    const searchCount = await page.evaluate(() => document.querySelectorAll(".methods").length);
    check("场景3 搜索「水炮」后列表收敛", searchCount > 0 && searchCount < 20, `实际 ${searchCount}`);
    await page.fill("input.search", "");
    await sleep(400);

    const mapIconCount = await page.locator('img[alt="在地图中查看"]').count();
    check("场景3 存在地图入口图标", mapIconCount > 0, `实际 ${mapIconCount} 个`);

    if (mapIconCount > 0) {
      const chunks = [];
      page.on("request", (r) => {
        if (/MapModal|map\.[0-9a-f]+\.js/.test(r.url())) chunks.push(r.url().split("/").pop());
      });
      await page.locator('img[alt="在地图中查看"]').first().click();
      await sleep(4000);
      check("场景3 地图懒加载 chunk 被按需请求", chunks.length > 0, chunks.join(", "));

      const mapRendered = await page.evaluate(() => {
        const c = document.querySelector(".leaflet-container");
        return !!c && c.getBoundingClientRect().height > 50;
      });
      check("场景3 地图容器渲染且可见", mapRendered);
    }
  },
});

// ---------------------------------------------------------------- 收尾
await browser.close();
await new Promise((resolve) => server.httpServer.close(resolve));

console.log("\n" + "=".repeat(72));
console.log(failed === 0 ? `全部通过（${results.length} 项）` : `${failed} / ${results.length} 项失败`);
process.exit(failed === 0 ? 0 : 1);
