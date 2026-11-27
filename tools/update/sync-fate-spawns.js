// 用本地 Teamcraft fates.json 更新事件中心，保留人工核实的其他刷新点。
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const target = path.join(__dirname, "../data/fate-spawns.json");
const mapKeys = require("../data/map-keys.json");
const spells = require("../data/spells.json");
const catalog = JSON.parse(fs.readFileSync(target, "utf8"));

const source = process.argv[2];
if (!source) throw new Error("用法：node tools/update/sync-fate-spawns.js <Teamcraft fates.json>");
const upstream = JSON.parse(fs.readFileSync(source, "utf8"));
for (const method of spells.flatMap(spell => spell.method).filter(m => m.type === "fate")) {
  assert(catalog[method.name]?.map === method.map, `请先核对并登记：${method.map} / ${method.name}`);
}

const lines = [];
for (const [name, entry] of Object.entries(catalog)) {
  const point = upstream[entry.id]?.position;
  assert(point && Number.isFinite(point.x) && Number.isFinite(point.y), `缺少事件中心：${name}`);
  assert.strictEqual(point.map, mapKeys[entry.map], `地图编号不匹配：${name}`);
  const positions = [[point.x, point.y]];
  for (const pair of entry.positions.slice(1)) {
    assert(Array.isArray(pair) && pair.length === 2 && pair.every(Number.isFinite), `附加坐标无效：${name}`);
    if (!positions.some(([x, y]) => x === pair[0] && y === pair[1])) positions.push(pair);
  }
  lines.push(`  ${JSON.stringify(name)}: ${JSON.stringify({ ...entry, positions })}`);
}

const next = "{\n" + lines.join(",\n") + "\n}\n";
if (fs.readFileSync(target, "utf8") !== next) fs.writeFileSync(target, next);
console.log(`已核对 ${lines.length} 个 FATE 的事件中心。`);
