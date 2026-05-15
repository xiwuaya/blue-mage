import type { SpellType } from "./spell";

export type SpellStatus = 0 | 1;
export type SpellStatusArray = SpellStatus[];

// 新增：专门为 UI 过滤器定义的分类键名（合并了 fate 和 treasure 为 other）
export type FilterKey = "map" | "raid" | "dungeon" | "trail" | "special" | "other";

// 修改：FilterTypes 不再使用 Record<SpellType, boolean>
export type FilterTypes = Record<FilterKey, boolean>;
