import rawMapKeys from "../../tools/map-keys.json";
import { getRegion } from "@thewakingsands/eorzea-interactive-map";
import type { EorzeaMapRegionMap } from "@thewakingsands/eorzea-interactive-map";

/**
 * 地图名 → Waking Sands map key。
 *
 * 优先查构建时生成的静态表 tools/map-keys.json（由 tools/update-map-keys.js 产出，
 * 数据来自 XIVAPI，可在构建时人工核对，且已解决重名歧义）。
 * 静态表里没有时才回退到地图库自带的 getRegion() 索引 ——
 * 那份 region.json 是 create() 初始化时本来就要拉的，所以回退不产生额外请求。
 */

const staticMapKeys = rawMapKeys as Record<string, number>;

/** getRegion() 结果的 `名字 → key` 索引，构建一次后复用 */
let regionIndex: Map<string, number> | null = null;

/**
 * 从 region.json 的记录里挑出"主地图"。
 *
 * region.json 有大量重名（1073 条里 534 条重名，很多是同一地区的不同楼层/子区域），
 * 所以必须过滤：
 *  - subName 非空的条目是子区域（如"黑衣森林南部林区 - 兀尔德泉"），排除
 *  - id 以 default/ 开头的是占位条目（key 187 → default/00），排除
 *  - id 以 region/ 开头的是区域级条目（key 91 → region/04），排除
 *
 * 过滤后仍可能有多个候选（如"摩杜纳"有 key 25 / 105 两个楼层），取最小 key ——
 * 实测这与 XIVAPI 的判定结果一致。
 */
function isMainMap(m: EorzeaMapRegionMap): boolean {
  return !!m.name && !m.subName && !!m.id && !m.id.startsWith("default") && !m.id.startsWith("region");
}

async function buildRegionIndex(): Promise<Map<string, number>> {
  if (regionIndex) return regionIndex;

  const index = new Map<string, number>();
  const regions = await getRegion();

  for (const region of regions) {
    for (const m of region.maps || []) {
      if (!isMainMap(m)) continue;
      const existing = index.get(m.name);
      if (existing === undefined || m.key < existing) {
        index.set(m.name, m.key);
      }
    }
  }

  regionIndex = index;
  return index;
}

/**
 * 解析地图名对应的 map key，解析不到返回 null。
 */
export async function resolveMapKey(mapName: string): Promise<number | null> {
  const fromTable = staticMapKeys[mapName];
  if (typeof fromTable === "number") return fromTable;

  try {
    const index = await buildRegionIndex();
    return index.get(mapName) ?? null;
  } catch {
    // getRegion() 是网络请求，失败时静默返回 null，交由调用方展示错误态
    return null;
  }
}
