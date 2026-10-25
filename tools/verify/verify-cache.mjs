// 静态资源缓存策略的验证脚本。
//
//   yarn verify:cache          # 本地 dist + 三个线上渠道
//   yarn verify:cache --local  # 只检查本地产物
//
// 为什么需要它：缓存头是「部署后才生效」的配置，很容易出现
// 「本地构建正确、线上仍是旧头」或「规则被合并成两个 max-age」。
// 脚本把预期分成四级：
//   PASS  符合预期
//   INFO  平台固定、仓库侧无法修改（GitHub Pages 的 max-age=600）
//   WARN  可操作但尚未做（EdgeOne 的 favicon 仍为 0，需控制台配置）
//   FAIL  出现未预期的值，视为回归
// 只有 FAIL / ERROR 会让退出码非 0。

import { existsSync, readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const distDir = fileURLToPath(new URL("../../dist", import.meta.url));
const localOnly = process.argv.includes("--local");

const rows = [];
let failed = 0;

function record(level, scope, name, detail = "") {
  rows.push({ level, scope, name, detail });
  if (level === "FAIL" || level === "ERROR") failed++;
}

// ---------------------------------------------------------------- 本地检查
function checkLocal() {
  const headersPath = path.join(distDir, "_headers");
  if (!existsSync(headersPath)) {
    record("FAIL", "本地", "dist/_headers 存在");
    return;
  }
  const headers = readFileSync(headersPath, "utf-8");
  record(
    headers.includes("/assets/*") && headers.includes("immutable") ? "PASS" : "FAIL",
    "本地",
    "dist/_headers 含 /assets/* 的 immutable 规则"
  );

  // 合并语义：带 Cache-Control 的 /* 兜底会与 /assets/* 拼出两个 max-age。
  // 按块解析，避免把根路径 `/` 误判成 `/*`。
  let inCatchAll = false;
  let catchAllHasCC = false;
  for (const line of headers.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      inCatchAll = t === "/*";
    } else if (inCatchAll && /^Cache-Control:/i.test(t)) {
      catchAllHasCC = true;
    }
  }
  record(
    !catchAllHasCC ? "PASS" : "FAIL",
    "本地",
    "没有带 Cache-Control 的 /* 兜底规则"
  );

  const assetsDir = path.join(distDir, "assets");
  if (!existsSync(assetsDir)) {
    record("FAIL", "本地", "dist/assets 存在");
    return;
  }
  const files = readdirSync(assetsDir);
  const unhashed = files.filter((f) => !/\.[0-9a-f]{8}\.[a-z0-9]+$/i.test(f));
  record(
    unhashed.length === 0 ? "PASS" : "FAIL",
    "本地",
    `dist/assets 全部带 content hash（${files.length} 个文件）`,
    unhashed.slice(0, 3).join(", ")
  );

  record(
    !existsSync(path.join(distDir, "icons")) ? "PASS" : "FAIL",
    "本地",
    "dist/icons 不存在（图标已进入 Vite 资源管道）"
  );

  const html = readFileSync(path.join(distDir, "index.html"), "utf-8");
  const refs = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => u.includes("/assets/"));
  const first = refs[0] || "";
  const prefix = first ? first.slice(0, first.indexOf("assets/")) : "/";
  const missing = refs.filter((u) => !existsSync(path.join(distDir, u.slice(prefix.length))));
  record(
    refs.length > 0 && missing.length === 0 ? "PASS" : "FAIL",
    "本地",
    `index.html 的 ${refs.length} 个 /assets 引用都存在`,
    missing.slice(0, 3).join(", ")
  );
  if (prefix !== "/") {
    record("INFO", "本地", `当前 dist 是子路径构建（${prefix}）`);
  }
}

// ---------------------------------------------------------------- 线上检查
const CHANNELS = [
  { id: "EdgeOne", base: "https://bluemagic.badend.cn/" },
  { id: "Cloudflare", base: "https://blue-mage.badend.cn/" },
  { id: "GitHub Pages", base: "https://blog.badend.cn/blue-mage/" },
];

async function fetchRaw(url) {
  return fetch(url, {
    method: "GET",
    headers: { "user-agent": "blue-mage-cache-verifier/1.0" },
    signal: AbortSignal.timeout(25000),
  });
}

/** 只读响应头，不下载 body（图标最大 14 MB） */
async function head(url) {
  const res = await fetchRaw(url);
  res.body?.cancel?.();
  return res;
}

/** 需要读取 body（HTML） */
async function fetchText(url) {
  const res = await fetchRaw(url);
  return { res, text: await res.text() };
}

const ccOf = (res) => (res.headers.get("cache-control") || "").toLowerCase();
const hasImmutable = (cc) => /\bimmutable\b/.test(cc);
const maxAge = (cc) => {
  const ages = [...cc.matchAll(/max-age=(\d+)/g)].map((m) => Number(m[1]));
  return ages.length ? Math.max(...ages) : null;
};

async function checkChannel({ id, base }) {
  let html;
  try {
    const { res, text } = await fetchText(base + "?__cb=" + Date.now().toString(36));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = text;
  } catch (e) {
    record("ERROR", id, "无法获取首页", e.message);
    return;
  }

  const pick = (re) => {
    const m = html.match(re);
    return m ? new URL(m[1], base).href : null;
  };
  const js = pick(/(?:src)="([^"]*\/assets\/[^"]+\.js)"/);
  const icon = pick(/(?:src)="([^"]*\/assets\/[^"]+\.(?:png|svg))"/);
  const favicon = new URL("favicon.ico", base).href;

  const isGH = id === "GitHub Pages";
  const isEdge = id === "EdgeOne";

  // HTML
  {
    const res = await head(base + "?__cb=" + Date.now().toString(36));
    const cc = ccOf(res);
    if (isGH) {
      record("INFO", id, "/ 由 GitHub Pages 固定缓存", cc);
    } else {
      const ok = /max-age=0/.test(cc) && /must-revalidate/.test(cc) && !hasImmutable(cc);
      record(ok ? "PASS" : "FAIL", id, "/ 必须回源校验", cc);
    }
  }

  // hashed JS
  if (js) {
    const res = await head(js);
    const cc = ccOf(res);
    if (isGH) record("INFO", id, "/assets/*.js（平台固定）", cc);
    else {
      const ok = maxAge(cc) === 31536000 && hasImmutable(cc);
      record(ok ? "PASS" : "FAIL", id, "/assets/*.js immutable 一年", cc);
    }
  } else {
    record("FAIL", id, "HTML 里找不到 /assets/*.js 引用");
  }

  // hashed icon（图标已进入 /assets/）
  if (icon) {
    const res = await head(icon);
    const cc = ccOf(res);
    if (isGH) record("INFO", id, "图标 /assets/*（平台固定）", cc);
    else {
      const ok = maxAge(cc) === 31536000 && hasImmutable(cc);
      record(ok ? "PASS" : "FAIL", id, "图标 /assets/* immutable 一年", cc);
    }
  } else {
    record("WARN", id, "HTML 里找不到 hashed 图标引用（可能尚未部署新版）");
  }

  // favicon（未 hash）
  {
    const res = await head(favicon);
    const cc = ccOf(res);
    if (isGH) record("INFO", id, "favicon.ico（平台固定）", cc);
    else if (isEdge && maxAge(cc) === 0) {
      record("WARN", id, "favicon.ico 仍为 max-age=0（EdgeOne 需控制台配置）", cc);
    } else {
      record(maxAge(cc) === 86400 ? "PASS" : "FAIL", id, "favicon.ico 缓存 1 天", cc);
    }
  }
}

// ---------------------------------------------------------------- 主流程
checkLocal();
if (!localOnly) {
  for (const channel of CHANNELS) {
    await checkChannel(channel);
  }
}

const icon = { PASS: "✓", INFO: "i", WARN: "!", FAIL: "✗", ERROR: "✗" };
let lastScope = "";
for (const r of rows) {
  if (r.scope !== lastScope) {
    console.log(`\n${r.scope}`);
    lastScope = r.scope;
  }
  console.log(`  ${icon[r.level]} ${r.level.padEnd(5)} ${r.name}${r.detail ? "  — " + r.detail : ""}`);
}

const count = (l) => rows.filter((r) => r.level === l).length;
console.log(
  `\n汇总：${count("PASS")} PASS / ${count("INFO")} INFO / ${count("WARN")} WARN / ` +
    `${count("FAIL")} FAIL / ${count("ERROR")} ERROR`
);
process.exit(failed ? 1 : 0);
