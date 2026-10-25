// 构建期抓取技能描述：从 XIVAPI 中文镜像（xivapi-v2.xivcdn.com，与
// @thewakingsands/kit-tooltip 同一数据源）拉取每个青魔法的官方描述，
// 缓存到 tools/descriptions.json（以 action id 为键）。
//
// 每条缓存两种格式：
//   text —— 纯文本（v2 API 的 transient.Description），供 llms-full.txt 使用；
//   html —— 服务端把游戏标记转好的 HTML（transient["Description@as(html)"]，
//           内联颜色 span + <br>，条件分支已被解析），供技能详情页渲染，
//           与 kit-tooltip 的着色效果一致。
//
// 增量：已缓存且格式正确的 action id 不再请求。全部命中缓存时本脚本不发出
// 任何网络请求；只有 spells.json 新增技能时才增量抓取。（需要 Node 18+。）
//
// 失败即中止构建，与 prerender.js 的 fail-loud 风格一致：拿不到描述时
// 详情页 / llms-full.txt 会静默缺失那一栏，没人会发现。

const fs = require("fs");
const path = require("path");

const spellsPath = path.resolve(__dirname, "spells.json");
const descriptionsPath = path.resolve(__dirname, "descriptions.json");

const API_BASE = "https://xivapi-v2.xivcdn.com/api/sheet/Action";
const REQUEST_INTERVAL_MS = 120; // 对免费镜像保持礼貌
const RETRIES = 3;

async function fetchDescription(actionId, spellName) {
  const url =
    `${API_BASE}/${actionId}?language=chs&fields=Name` +
    `&transient=Description,Description@as(html)`;
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const transient = json.transient || {};
      const text = (transient.Description || "").replace(/\r\n/g, "\n").trim();
      // 服务端把游戏标记转成内联样式的 HTML（全量 124 条只出现 span/br
      // 两种标签和绿/橙两种颜色；条件分支如白骑士之旅已被解析成纯文本）
      const html = (transient["Description@as(html)"] || "").trim();
      if (!text || !html) throw new Error("响应里缺少 Description / Description@as(html)");
      // 名称对不上通常意味着 spells.json 的 action id 映射错了。
      // 提醒但不阻断：阻断会让一次小笔误挡住整个部署。
      const apiName = json.fields && json.fields.Name;
      if (apiName && apiName !== spellName) {
        console.warn(
          `⚠️  action ${actionId} 的 API 名称「${apiName}」与数据表「${spellName}」不一致，请核对 tools/spells.json。`
        );
      }
      return { text, html };
    } catch (e) {
      lastError = e;
      if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error(`抓取 action ${actionId}（${spellName}）描述失败：${lastError.message}`);
}

// 旧版缓存是纯字符串（只有 text），自动视为缺失并重抓升级
function isCacheEntryValid(entry) {
  return !!entry && typeof entry === "object" && !!entry.text && !!entry.html;
}

async function main() {
  const spells = JSON.parse(fs.readFileSync(spellsPath, "utf-8"));
  const cache = fs.existsSync(descriptionsPath)
    ? JSON.parse(fs.readFileSync(descriptionsPath, "utf-8"))
    : {};

  const missing = spells.filter((s) => !isCacheEntryValid(cache[s.action]));
  if (!missing.length) {
    console.log(`📝 技能描述缓存完整（${spells.length} 条，text + html），跳过抓取。`);
    return;
  }
  const stale = missing.filter((s) => cache[s.action]).length;
  console.log(
    `📝 需要抓取 ${missing.length} 条技能描述` +
      (stale ? `（其中 ${stale} 条是旧格式，需升级为 text + html）` : "") +
      `，缓存已有 ${spells.length - missing.length} 条...`
  );

  for (const s of missing) {
    cache[s.action] = await fetchDescription(s.action, s.spell);
    console.log(`   ✔ No.${s.no} ${s.spell}`);
    await new Promise((r) => setTimeout(r, REQUEST_INTERVAL_MS));
  }

  // 只保留 spells.json 里存在的 id，清掉数据表已删除技能的残留
  const valid = {};
  for (const s of spells) valid[s.action] = cache[s.action];
  fs.writeFileSync(descriptionsPath, JSON.stringify(valid, null, 2) + "\n", "utf-8");
  console.log(`📝 tools/descriptions.json 已更新，共 ${Object.keys(valid).length} 条（text + html）。`);
}

main().catch((e) => {
  console.error("[update-descriptions] 失败：", e.message || e);
  process.exit(1);
});
