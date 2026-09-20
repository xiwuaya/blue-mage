const fs = require('fs');

const spellsPath = './tools/spells.json';
const mapKeysPath = './tools/map-keys.json';

const XIVAPI_BASE = 'https://xivapi-v2.xivcdn.com';
const CONCURRENCY_DELAY = 120; // XIVAPI 限速，逐个查询之间稍作等待

// 收集 spells.json 里所有 type === 'map' 的唯一地图名
function collectMapNames(spells) {
  const names = new Set();
  spells.forEach(spell => {
    (spell.method || []).forEach(m => {
      if (m.type === 'map' && m.map) names.add(m.map);
    });
  });
  return [...names].sort();
}

// 查 XIVAPI：用中文地名反查 Map.row_id
// PlaceNameSub.row_id === 0 表示这是主地图，而非其下的子区域
async function findMapRowId(mapName) {
  const query = `PlaceName.Name="${mapName}"`;
  const url =
    `${XIVAPI_BASE}/api/search` +
    `?sheets=Map` +
    `&fields=Id,PlaceName.Name,PlaceNameSub.Name` +
    `&query=${encodeURIComponent(query)}` +
    `&language=chs`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const main = (data.results || []).find(r => r.fields && r.fields.PlaceNameSub && r.fields.PlaceNameSub.row_id === 0);

  return main ? main.row_id : null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const spells = JSON.parse(fs.readFileSync(spellsPath, 'utf-8'));
  const names = collectMapNames(spells);

  // 读入已有结果，作为"网络失败时不清空"的保底，同时避免重复请求没变化的地名
  let previous = {};
  if (fs.existsSync(mapKeysPath)) {
    try {
      previous = JSON.parse(fs.readFileSync(mapKeysPath, 'utf-8'));
    } catch (e) {
      console.warn('⚠️  已有 map-keys.json 解析失败，将重新生成。');
    }
  }

  const result = {};
  const unresolved = [];
  let failed = 0;

  for (const name of names) {
    // 地名没变就直接沿用，省一次请求
    if (typeof previous[name] === 'number') {
      result[name] = previous[name];
      continue;
    }

    try {
      const rowId = await findMapRowId(name);
      if (rowId === null) {
        unresolved.push(name);
        console.warn(`[未解析] "${name}" —— XIVAPI 查不到该地名（可能是错字，或不是主地图）`);
      } else {
        result[name] = rowId;
      }
    } catch (e) {
      failed++;
      console.warn(`[请求失败] "${name}" —— ${e.message}`);
    }

    await sleep(CONCURRENCY_DELAY);
  }

  // 全部请求都失败：保留旧文件，不要把表清空
  if (failed > 0 && Object.keys(result).length === 0 && Object.keys(previous).length > 0) {
    console.warn('⚠️  所有请求均失败，保留原有 map-keys.json 不覆盖。');
    process.exit(0);
  }

  // 请求失败的地名沿用旧值
  for (const name of names) {
    if (result[name] === undefined && typeof previous[name] === 'number') {
      result[name] = previous[name];
    }
  }

  // 按地名排序输出，便于人工核对
  const sorted = {};
  Object.keys(result).sort().forEach(k => { sorted[k] = result[k]; });

  fs.writeFileSync(mapKeysPath, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');

  console.log(`🗺️  地图名 → key 已写入 ${mapKeysPath}（共 ${Object.keys(sorted).length} 条）`);
  if (unresolved.length) {
    console.warn(`⚠️  有 ${unresolved.length} 个地名无法解析：${unresolved.join('、')}`);
  }
  if (failed) {
    console.warn(`⚠️  有 ${failed} 个地名因网络问题未更新（沿用旧值）。`);
  }
})();
