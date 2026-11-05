import type { Spell } from "./lib/spell";

// 图标是 Vite 资源（src/assets/icons），构建后文件名带 content hash
// （如 003253.a1b2c3d4.png），因此可以安全地设置一年期 immutable 缓存。
//
// 为什么用 globEager 而不是普通 import：图标文件名来自 tools/data/spells.json 的
// 运行时数据（`icons/spells/${s.icon}`），无法写成静态 import。globEager 会把
// 目录下所有文件在构建期展开成「路径 → 模块」的静态映射，Vite 据此为每个
// 图标产出带 hash 的文件。
//
// 注意：Vite 2.9 的 `{ as: 'url' }` 只对 raw 生效，所以这里取模块的 `.default`
// （图片模块的默认导出就是 URL）。
const spellIconModules = import.meta.globEager<{ default: string }>(
  "./assets/icons/spells/*.png"
);
const typeIconModules = import.meta.globEager<{ default: string }>(
  "./assets/icons/type_*.png"
);

function urlOf(mods: Record<string, { default: string }>, key: string): string {
  return mods[key]?.default ?? "";
}

export function spellIcon(s: Spell, book?: boolean) {
  return urlOf(
    spellIconModules,
    `./assets/icons/spells/${book ? s.icon_book : s.icon}`
  );
}

export function spellIconSrcset(s: Spell, book?: boolean) {
  const one = spellIcon(s, book);
  const two = urlOf(
    spellIconModules,
    `./assets/icons/spells/${book ? s.icon_book_hr1 : s.icon_hr1}`
  );
  return `${one} 1x, ${two} 2x`;
}

export function typeIcon(type: string) {
  return urlOf(typeIconModules, `./assets/icons/type_${type}.png`);
}
