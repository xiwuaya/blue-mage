import rawSpells from "../../tools/spells.json";
import type { SpellStatusArray } from "./interface";

// 1. 在枚举中新增 Treasure
export enum SpellType {
  Map = "map",
  Raid = "raid",
  Dungeon = "dungeon",
  Trail = "trail",
  FATE = "fate",
  Special = "special",
  Treasure = "treasure", // 新增：寻宝类型
  Guildhests = "guildhests", //新增：行会令
}

export interface SpellMethodBase {
  type: SpellType;
  level: number;
  note?: string;
  color?: string;
}

export interface SpellMethodMap extends SpellMethodBase {
  type: SpellType.Map;
  map: string;
  rank: string | null;
  position: [number, number] | [number, number, number] | number[];
  mob: string;
}

export interface SpellMethodInstance extends SpellMethodBase {
  type: SpellType.Raid | SpellType.Dungeon | SpellType.Trail;
  name: string;
  mob: string;
}

export interface SpellMethodFate extends SpellMethodBase {
  type: SpellType.FATE;
  map: string;
  name: string;
  mob: string;
}

export interface SpellMethodSpecial extends SpellMethodBase {
  type: SpellType.Special;
  text: string;
}

// 2. 新增 Treasure 接口 (继承包含 level, color, note 的 Base，再单独指定 name 和 mob)
export interface SpellMethodTreasure extends SpellMethodBase {
  type: SpellType.Treasure;
  name: string;
  mob: string;
}

export interface SpellMethodGuildhests extends SpellMethodBase {
  type: SpellType.Guildhests;
  name: string;
  mob: string;
}

// 3. 将其加入联合类型
export type SpellMethod =
  | SpellMethodMap
  | SpellMethodSpecial
  | SpellMethodFate
  | SpellMethodInstance
  | SpellMethodTreasure // 新增;
  | SpellMethodGuildhests; // 新增;

export interface Spell {
  no: string;
  action: number;
  patch: string;
  spell: string;
  spell_ja?: string;
  spell_en?: string;
  level: number;
  icon: string;
  icon_hr1: string;
  icon_book: string;
  icon_book_hr1: string;
  method: SpellMethod[];
}

export const spells = rawSpells as Spell[];

// 4. 修改 renderSpellMethod，让它和副本/讨伐一样渲染为 "名字 - 怪物"
export function renderSpellMethod(method: SpellMethod) {
  switch (method.type) {
    case SpellType.Map: {
      const pos = method.position;
      return `${method.map} ${method.rank ? `[${method.rank}]` : ""}${
        pos && pos.length
          ? typeof pos === "string"
            ? `(${pos})`
            : `(x:${pos[0]}, y:${pos[1]}${pos[2] ? `, z:${pos[2]}` : ""})`
          : ""
      } - ${method.mob}`;
    }
    case SpellType.Raid:
    case SpellType.Dungeon:
    case SpellType.Trail:
    case SpellType.Treasure:
    case SpellType.Guildhests: // 新增这一行复用渲染逻辑
      return `${method.name} - ${method.mob}`;
    case SpellType.FATE:
      return `${method.map} - ${method.name} - ${method.mob}`;
    case SpellType.Special:
      return `${method.text}`;
  }
}

export const learnedByNo = (spellStatus: SpellStatusArray, no: string) => {
  return spellStatus[indexByNo(no)] === 1;
};

export const indexByNo = (no: string) => +no - 1;
