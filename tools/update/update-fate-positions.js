// FATE 类学习途径的坐标自动补充，三步管线：
//   1. 中文名匹配 —— 枚举 XIVAPI 中文镜像（xivapi-v2.xivcdn.com，与
//      update-map-keys.js 同一数据源）的 Fate 表，拿「CN 名 → FATE id」；
//   2. 坐标获取 —— 用 id 查 Garland Tools（garlandtools.org），返回的
//      coords 已经是游戏内显示坐标（与 spells.json 现有 position 同一约定），
//      直接入库，无需任何换算；
//   3. 只补缺失 —— 已有 position 的手工值一律不覆盖。
//
// 缓存 tools/data/fate-positions.json（名→id 映射 + id→Garland 数据）。
// 名称与坐标全部命中缓存时不发出任何网络请求；spells.json 新增 FATE 名时
// 才增量请求。（需要 Node 18+。）
//
// 已知名字差异（数据表写法 ↔ 客户端原始名），由前缀匹配兜底：
//   - 数据表省略怪物后缀：「来自雪国的刺客」↔「来自雪国的刺客——极地雪藻」
//   - 连锁 FATE 客户端名截断：「飞天魔厨——佩鲁的天敌」↔「飞天魔厨——」
//
// 坐标属于补充信息：镜像 / Garland 任一网络失败只告警不阻断构建。
// Garland 未收录坐标的条目（多为 5.x+ 新 FATE）会在结尾列出，
// 留给人工或本地 datamine（Fate.Location → MapPosition → 显示坐标）补充。

const fs = require("fs");
const path = require("path");

const spellsPath = path.resolve(__dirname, "../data/spells.json");
const cachePath = path.resolve(__dirname, "../data/fate-positions.json");

const MIRROR_BASE = "https://xivapi-v2.xivcdn.com/api/sheet/Fate";
const GARLAND_BASE = "https://www.garlandtools.org/db/doc/fate/en/2";
const PAGE_LIMIT = 500; // 镜像单页行数上限（实测 2110 行 ≈ 5 页）
const REQUEST_INTERVAL_MS = 120; // 对免费镜像保持礼貌
const RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastError = e;
      if (attempt < RETRIES) await sleep(1000 * attempt);
    }
  }
  throw new Error(`${url} 请求失败：${lastError.message}`);
}

// 枚举镜像 Fate 表的全部有名行（CN 名 + 等级），按 row_id 翻页
async function enumerateFates() {
  const rows = [];
  let after = 0;
  for (let page = 0; page < 30; page++) {
    const data = await fetchJson(
      `${MIRROR_BASE}?after=${after}&limit=${PAGE_LIMIT}&fields=Name,ClassJobLevel&language=chs`
    );
    const batch = data.rows || [];
    if (!batch.length) break;
    rows.push(...batch);
    after = batch[batch.length - 1].row_id;
    if (batch.length < PAGE_LIMIT) break;
    await sleep(REQUEST_INTERVAL_MS);
  }
  return rows.filter((r) => r.fields && r.fields.Name);
}

// 名字匹配：先完全一致（忽略空格），再前缀互配兜底上面两种已知差异。
// 命中多行时返回歧义清单，由调用方告警跳过，宁缺毋错。
const norm = (s) => s.replace(/\s+/g, "");
function findFateId(name, rows) {
  const n = norm(name);
  const exact = rows.filter((r) => norm(r.fields.Name) === n);
  const prefix = exact.length
    ? []
    : rows.filter((r) => {
        const c = norm(r.fields.Name);
        return c !== n && (c.startsWith(n) || n.startsWith(c));
      });
  const hits = exact.length ? exact : prefix;
  if (hits.length === 1) return { id: hits[0].row_id };
  if (hits.length > 1) return { ambiguous: hits.map((r) => r.row_id) };
  return null;
}

// Garland 按 id 查 FATE；coords 为 null 表示它未收录该 FATE 的位置
async function fetchGarlandFate(id) {
  const data = await fetchJson(`${GARLAND_BASE}/${id}.json`);
  const fate = data.fate || {};
  return {
    en: fate.name || "",
    patch: fate.patch ?? null,
    lvl: fate.lvl ?? null,
    zoneid: fate.zoneid ?? null,
    coords: Array.isArray(fate.coords) && fate.coords.length === 2 ? fate.coords : null,
  };
}

(async () => {
  const spells = JSON.parse(fs.readFileSync(spellsPath, "utf-8"));
  const cache = fs.existsSync(cachePath)
    ? JSON.parse(fs.readFileSync(cachePath, "utf-8"))
    : { names: {}, fates: {} };
  if (!cache.names) cache.names = {};
  if (!cache.fates) cache.fates = {};
  let cacheChanged = false;

  // 收集全部 fate 方法与其在 method 数组里的下标（回写时要按下标替换整个对象）
  const fateMethods = [];
  spells.forEach((spell) => {
    (spell.method || []).forEach((m, index) => {
      if (m.type === "fate") fateMethods.push({ spell, index, m });
    });
  });
  const uniqueNames = [...new Set(fateMethods.map(({ m }) => m.name))];

  // 第 1 步：名 → id（缓存优先，未命中才枚举镜像）
  const unresolved = [];
  const uncachedNames = uniqueNames.filter((name) => !cache.names[name]);
  if (uncachedNames.length) {
    let rows = null;
    for (const name of uncachedNames) {
      if (rows === null) {
        try {
          rows = await enumerateFates();
          console.log(`🔍 已从镜像枚举 ${rows.length} 条 FATE，开始匹配…`);
        } catch (e) {
          console.warn(`⚠️  镜像枚举失败，本次跳过未缓存名字的匹配：${e.message}`);
          rows = false; // 标记枚举不可用，剩余名字留到下次运行
        }
      }
      if (rows === false) continue; // 镜像不可用，留到下次运行
      const hit = findFateId(name, rows);
      if (hit && hit.id) {
        cache.names[name] = hit.id;
        cacheChanged = true;
        console.log(`🔍 「${name}」→ Fate #${hit.id}`);
      } else if (hit && hit.ambiguous) {
        console.warn(`⚠️  「${name}」匹配到多行 FATE（${hit.ambiguous.join("、")}），跳过，请人工确认`);
      } else {
        unresolved.push(name);
      }
    }
  }

  // 第 2 步：id → 坐标（缓存优先；coords 为 null 也缓存，避免对未收录条目重复请求）
  const needIds = [...new Set(Object.values(cache.names))].filter(
    (id) => !(id in cache.fates)
  );
  for (const id of needIds) {
    try {
      cache.fates[id] = await fetchGarlandFate(id);
      cacheChanged = true;
      await sleep(REQUEST_INTERVAL_MS);
    } catch (e) {
      console.warn(`⚠️  Garland 查询 Fate #${id} 失败：${e.message}（下次运行会重试）`);
    }
  }

  // 第 3 步：回写 spells.json，只补缺失的 position
  const filled = [];
  const manual = [];
  const noCoords = new Set();
  for (const { spell, index, m } of fateMethods) {
    const id = cache.names[m.name];
    if (!id) continue;
    const info = cache.fates[id];
    if (!info || !info.coords) {
      noCoords.add(m.name);
      continue;
    }
    if (m.position && m.position.length) {
      manual.push(m.name);
      continue;
    }
    // position 插在 map 之后，与既有条目的字段顺序一致
    const next = {};
    for (const [k, v] of Object.entries(m)) {
      next[k] = v;
      if (k === "map") next.position = [info.coords[0], info.coords[1], 0];
    }
    spell.method[index] = next;
    filled.push({ no: spell.no, spell: spell.spell, fate: m.name, coords: next.position });
  }

  if (filled.length) {
    fs.writeFileSync(spellsPath, JSON.stringify(spells, null, 2), "utf-8");
    console.log(`🎉 已补充 ${filled.length} 条 FATE 坐标：`);
    filled.forEach(({ no, spell, fate, coords }) =>
      console.log(`   #${no} ${spell}｜${fate} → (x:${coords[0]}, y:${coords[1]})`)
    );
  }

  if (cacheChanged) {
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf-8");
  }

  const manualNames = [...new Set(manual)];
  if (manualNames.length) {
    console.log(`⏭️  ${manualNames.length} 个 FATE 已有手工坐标，未覆盖：${manualNames.join("、")}`);
  }
  const noCoordNames = [...noCoords];
  if (noCoordNames.length) {
    console.log(`⚠️  ${noCoordNames.length} 个 FATE Garland 未收录坐标，待人工补充：${noCoordNames.join("、")}`);
  }
  if (unresolved.length) {
    console.log(`⚠️  ${unresolved.length} 个 FATE 名未匹配到镜像数据：${unresolved.join("、")}`);
  }
  if (!filled.length && !cacheChanged) {
    console.log("✅ 缓存完整，本次运行零网络请求，spells.json 无改动。");
  }
})();
