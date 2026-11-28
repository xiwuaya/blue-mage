import rawDutyUnlocks from "../../tools/data/duty-unlocks.json";
import rawFateSpawns from "../../tools/data/fate-spawns.json";
import rawHuntSpawns from "../../tools/data/hunt-spawns.json";
import rawSpells from "../../tools/data/spells.json";
import type { SpellStatusArray } from "./interface";

// 1. 在枚举中新增 Treasure
export enum SpellType {
  Map = "map",
  Raid = "raid",
  Dungeon = "dungeon",
  Trail = "trail",
  FATE = "fate",
  Special = "special",
  Treasure = "treasure", // 新增：寻宝
  Guildhests = "guildhests", //新增：行会令
  Hunt = "hunt", //新增：怪物狩猎
  Carnivale = "carnivale", //新增：假面狂欢
  Levequests = "levequests", //新增：理符任务
  Jobquest = "jobquest", //新增：职业任务
}

export interface QuestStart {
  npc: string;
  map: string;
  position: number[];
  mapKey?: number;
  quest?: string;
  questId?: number;
  mainScenario?: boolean;
}
const dutyUnlocks: Record<string, QuestStart> = rawDutyUnlocks;

export interface SpellMethodBase {
  type: SpellType;
  level: number;
  note?: string;
  color?: string;
  questStart?: QuestStart;
}

export interface SpellMethodMap extends SpellMethodBase {
  type: SpellType.Map | SpellType.Hunt | SpellType.Levequests;
  map: string;
  rank?: string | null;
  position?: number[] | null;
  mob: string;
}

// 2.新增类型
export interface SpellMethodInstance extends SpellMethodBase {
  type: SpellType.Raid | SpellType.Dungeon | SpellType.Trail | SpellType.Carnivale | SpellType.Treasure | SpellType.Guildhests | SpellType.Jobquest;
  name: string;
  mob: string;
}

export interface SpellMethodFate extends SpellMethodBase {
  type: SpellType.FATE;
  map: string;
  name: string;
  mob: string;
  /** 单条途径的旧格式坐标，也可用于尚未收录的新事件。 */
  position?: number[];
}

export interface SpellMethodSpecial extends SpellMethodBase {
  type: SpellType.Special;
  text: string;
}


// 3. 将其加入联合类型
export type SpellMethod =
  | SpellMethodMap
  | SpellMethodSpecial
  | SpellMethodFate
  | SpellMethodInstance

export interface MethodMapTarget {
  map: string;
  mapKey?: number;
  label: string;
  positions: number[][];
}

const fateSpawns: Record<string, { map: string; positions: number[][] }> = rawFateSpawns;
const huntSpawns: Record<string, { map: string; positions: number[][] }> = rawHuntSpawns;

export function encounterMap(method: SpellMethod): MethodMapTarget | undefined {
  if (method.type !== SpellType.Map && method.type !== SpellType.Hunt && method.type !== SpellType.FATE) return;
  let spawn;
  if (method.type === SpellType.FATE) spawn = fateSpawns[method.name];
  if (method.type === SpellType.Hunt) spawn = huntSpawns[method.mob];

  const positions = spawn?.map === method.map ? spawn.positions :
    method.position && method.position.length >= 2 ? [method.position] : [];
  if (!positions.length) return;
  const name = method.type === SpellType.FATE ? method.name : method.mob;
  return { map: method.map, label: `${name} Lv.${method.level}`, positions };
}

export function questMap(method: SpellMethod, showMainScenarioUnlocks = true): MethodMapTarget | undefined {
  const duty = "name" in method ? dutyUnlocks[method.name.trim()] : undefined;
  const start = method.questStart ?? duty;
  if (!start || (start.mainScenario && !showMainScenarioUnlocks)) return;
  const purpose = duty && !start.quest && !method.questStart ? "对话解锁" : "任务接取";
  const label = [purpose, start.quest, start.npc].filter(Boolean).join(" · ");
  return { map: start.map, mapKey: start.mapKey, label, positions: [start.position] };
}

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
    case SpellType.Map:
    case SpellType.Hunt:
    case SpellType.Levequests: {
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
    case SpellType.Guildhests:
    case SpellType.Carnivale:
    case SpellType.Jobquest: // 新增这一行复用渲染逻辑
      return `${method.name} - ${method.mob}`;
    case SpellType.FATE: {
      const points = encounterMap(method)?.positions;
      const pos = points?.length === 1 ? points[0] : undefined;
      const posText = pos && pos.length ? ` (x:${pos[0]}, y:${pos[1]}${pos[2] ? `, z:${pos[2]}` : ""})` : "";
      return `${method.map}${posText} - ${method.name} - ${method.mob}`;
    }
    case SpellType.Special:
      return `${method.text}`;
  }
}

export const learnedByNo = (spellStatus: SpellStatusArray, no: string) => {
  return spellStatus[indexByNo(no)] === 1;
};

export const indexByNo = (no: string) => +no - 1;

// --- 锁定技能：No.1 水泡 ---
// 建立青魔法师职业时自动习得，不存在其他获取途径，因此永远处于「已掌握」。
// 存档读取、勾选、批量全选/清空、编号文本导入等所有路径都不得把它改回未掌握。
export const ALWAYS_LEARNED_SPELL_NO = "1";
export const ALWAYS_LEARNED_INDEX = indexByNo(ALWAYS_LEARNED_SPELL_NO);

export const isAlwaysLearnedNo = (no: string | number) =>
  Number(no) === Number(ALWAYS_LEARNED_SPELL_NO);

export const isAlwaysLearnedIndex = (index: number) =>
  index === ALWAYS_LEARNED_INDEX;

/** 把锁定技能的状态修正为已掌握；无需改动时原样返回，避免触发多余重渲染。 */
export const ensureAlwaysLearned = (
  status: SpellStatusArray
): SpellStatusArray => {
  if (status[ALWAYS_LEARNED_INDEX] === 1) return status;
  const next = [...status] as SpellStatusArray;
  next[ALWAYS_LEARNED_INDEX] = 1;
  return next;
};
