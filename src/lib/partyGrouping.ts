/**
 * 均衡组队算法（多队完整分组）—— Phase 1 正确性 baseline
 *
 * 将 activeUsers 划分为 teamCount = floor(N / M) 支 M 人队伍，
 * 并恰好排除 excludedCount = N % M 个普通用户。
 *
 * 评分与比较（依次比较，文档 §33-§40）：
 *   1. effectiveTotalCommonSkillCount 最大
 *      （每队有效共同技能 = min(真实共同技能, MAX_EFFECTIVE_COMMON_SKILLS)）
 *   2. varianceScore 最小（基于有效共同技能的整数方差 T·Σxi² − (Σxi)²）
 *   3. 队伍 userIndices 字典序最小（队内升序，队伍按首成员升序的规范序）
 *   4. 排除用户 userIndices 字典序最小（升序）
 *
 * 实现依据：AIWorks/均衡组队算法/均衡组队算法开发文档.md v1.0
 * 结构：TeamScore 全量预计算（C(N,M) 组合）→ DFS 完整枚举（B 方案可行性剪枝、
 * 最小剩余用户去重、增量维护总分与 Σxi²）→ 四级比较取最优。
 *
 * 注意：本模块不依赖 Vue；spellMasks 的分类过滤（getFilterKey / filterTypes）
 * 由调用方完成后再传入。N ≤ 30（number 位掩码约束）。
 */

export const MAX_EFFECTIVE_COMMON_SKILLS = 12;

/** 单支 M 人队伍的评分 */
export type TeamScore = {
  /** 真实共同技能数量，用于 UI 展示与最终结果记录 */
  commonSkillCount: number;
  /** 算法使用的有效共同技能数量 = min(commonSkillCount, MAX_EFFECTIVE_COMMON_SKILLS) */
  effectiveCommonSkillCount: number;
};

/** 单支队伍的最终结果（userIndices 为 originalIndex，升序） */
export type PartyTeamResult = {
  userIndices: number[];
  commonSkillCount: number;
  effectiveCommonSkillCount: number;
};

/** 完整分组方案的最终结果 */
export type PartyGroupResult = {
  teams: PartyTeamResult[];
  excludedUserIndices: number[];
  effectiveTotalCommonSkillCount: number;
  varianceScore: number;
};

/** DFS 规模统计（供 Benchmark 使用） */
export type PartyGroupingStats = {
  /** dfs() 调用次数（含根节点） */
  dfsNodeCount: number;
  /** 完整分组方案数量（叶节点数） */
  completeGroupCount: number;
};

export type FindBalancedPartyGroupsInput = {
  /** 参与计算的 active 用户数量 N（0 ≤ N ≤ 30，number 位掩码约束） */
  userCount: number;
  /** 每支队伍人数 M（≥ 1） */
  teamSize: number;
  /**
   * 技能编号 → 拥有该技能的 active 用户位掩码（bit i = activeIndex i）。
   * 与 PartyModal.vue 现有 spellMasks 语义一致；分类过滤需由调用方先行完成。
   */
  spellMasks: Map<number, number>;
  /** 必须参加用户位掩码（visibilityState === 1 的 active 用户对应位为 1） */
  mustIncludeMask: number;
  /** activeIndex → originalIndex 映射（originalIndices[i] 为 activeIndex i 的原始索引） */
  originalIndices: number[];
  /** 可选：DFS 规模统计输出（调用方传入可变对象，本函数负责清零并回填） */
  statsOut?: PartyGroupingStats;
  /**
   * 可选：求解墙钟时间预算（毫秒），仅用于 Benchmark 防失控。
   * 超时抛出 PartyGroupingTimeoutError；不传时无任何行为差异。
   */
  timeBudgetMs?: number;
};

/** timeBudgetMs 超时抛出；partialBest 为超时时刻已找到的最优完整分组（可能非全局最优） */
export class PartyGroupingTimeoutError extends Error {
  partialBest: PartyGroupResult | null;

  constructor(partialBest: PartyGroupResult | null) {
    super("party grouping time budget exceeded");
    this.name = "PartyGroupingTimeoutError";
    this.partialBest = partialBest;
  }
}

const popcount = (mask: number): number => {
  let count = 0;
  while (mask > 0) {
    count += mask & 1;
    mask >>>= 1;
  }
  return count;
};

/**
 * 生成 [0, n) 中恰好包含 m 个用户的所有位掩码（Gosper's hack）。
 * 只负责组合枚举，不理解 mustInclude 等业务约束（文档 §19-§21）。
 */
export function generateCombinationMasks(n: number, m: number): number[] {
  const masks: number[] = [];
  if (n <= 0 || m <= 0 || m > n || n > 30) return masks;

  let state = (1 << m) - 1;
  const limit = 1 << n;
  while (state < limit) {
    masks.push(state);
    const c = state & -state;
    const r = state + c;
    state = (((state ^ r) >>> 2) / c) | r;
  }
  return masks;
}

/** 计算一支 M 人队伍的共同技能评分（文档 §11/§22） */
export function calculateTeamScore(partyMask: number, spellMasks: Map<number, number>): TeamScore {
  let commonSkillCount = 0;
  for (const spellMask of spellMasks.values()) {
    if ((spellMask & partyMask) === partyMask) {
      commonSkillCount++;
    }
  }
  return {
    commonSkillCount,
    effectiveCommonSkillCount: Math.min(commonSkillCount, MAX_EFFECTIVE_COMMON_SKILLS),
  };
}

/**
 * 两个等大小用户集合的字典序比较（升序序列意义上 a 是否更小）。
 * 等大小集合中，最低差异位属于谁，谁的升序序列更小。
 */
const maskLexLess = (a: number, b: number): boolean => {
  const diff = a ^ b;
  const low = diff & -diff;
  return (a & low) !== 0;
};

/**
 * 求解完整多队分组方案。无解或输入非法时返回 null。
 */
export function findBalancedPartyGroups(input: FindBalancedPartyGroupsInput): PartyGroupResult | null {
  const n = input.userCount;
  const m = input.teamSize;

  if (input.statsOut) {
    input.statsOut.dfsNodeCount = 0;
    input.statsOut.completeGroupCount = 0;
  }

  if (!Number.isInteger(n) || n < 0 || n > 30) return null;
  if (!Number.isInteger(m) || m < 1) return null;
  if (input.originalIndices.length !== n) return null;
  if (n < m) return null; // 文档 §10.1

  const teamCount = Math.floor(n / m);
  const excludedCount = n % m;
  const fullMask = (1 << n) - 1;
  const mustIncludeMask = input.mustIncludeMask & fullMask;
  // 只有普通用户（visibilityState === 0，即非 must-include 的 active 用户）可被排除（文档 §7/§31）
  const excludableMask = fullMask & ~mustIncludeMask;

  if (popcount(mustIncludeMask) > teamCount * m) return null; // 文档 §10.2
  if (popcount(excludableMask) < excludedCount) return null; // 文档 §10.3

  // ---- TeamScore 预计算：全部 C(N,M) 组合，不受 mustInclude 影响（文档 §18/§19）----
  const teamScoreMap = new Map<number, TeamScore>();
  for (const teamMask of generateCombinationMasks(n, m)) {
    teamScoreMap.set(teamMask, calculateTeamScore(teamMask, input.spellMasks));
  }
  // DFS 扫描面：teamScoreMap 的数组形式（避免热循环中每次迭代分配 entry 元组）
  const teamMaskList: number[] = [];
  const teamEffectiveList: number[] = [];
  for (const [teamMask, score] of teamScoreMap) {
    teamMaskList.push(teamMask);
    teamEffectiveList.push(score.effectiveCommonSkillCount);
  }

  // ---- DFS / Backtracking（文档 §24-§32）----
  let bestTeamMasks: number[] = [];
  let bestExcludedMask = 0;
  let bestTotal = 0; // 增量：Σ effective
  let bestSumSq = 0; // 增量：Σ effective²
  let foundAny = false;

  const curTeamMasks: number[] = [];
  let curExcludedMask = 0;
  let curTotal = 0;
  let curSumSq = 0;

  const deadline = input.timeBudgetMs !== undefined ? Date.now() + input.timeBudgetMs : 0;
  let nodeTick = 0;

  const save = () => {
    foundAny = true;
    bestTeamMasks = curTeamMasks.slice();
    bestExcludedMask = curExcludedMask;
    bestTotal = curTotal;
    bestSumSq = curSumSq;
  };

  const recordIfBetter = () => {
    if (!foundAny) {
      save();
      return;
    }
    if (curTotal !== bestTotal) {
      if (curTotal > bestTotal) save();
      return;
    }
    // teamCount 固定，整数方差比较等价于真实方差比较（文档 §35）
    const varianceScore = teamCount * curSumSq - curTotal * curTotal;
    const bestVariance = teamCount * bestSumSq - bestTotal * bestTotal;
    if (varianceScore !== bestVariance) {
      if (varianceScore < bestVariance) save();
      return;
    }
    const teamCmp = compareTeamLists(curTeamMasks, bestTeamMasks);
    if (teamCmp !== 0) {
      if (teamCmp < 0) save();
      return;
    }
    if (curExcludedMask !== bestExcludedMask && maskLexLess(curExcludedMask, bestExcludedMask)) {
      save();
    }
  };

  /** 比较两组规范顺序队伍的字典序：-1 / 0 / 1（每队内部按升序 userIndices） */
  const compareTeamLists = (a: number[], b: number[]): number => {
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] ^ b[i];
      if (diff !== 0) {
        const low = diff & -diff;
        return (a[i] & low) !== 0 ? -1 : 1;
      }
    }
    return 0;
  };

  const materializeBest = (): PartyGroupResult | null => {
    if (!foundAny) return null;
    const teams: PartyTeamResult[] = bestTeamMasks.map((teamMask) => {
      const score = teamScoreMap.get(teamMask)!;
      const userIndices: number[] = [];
      for (let i = 0; i < n; i++) {
        if ((teamMask & (1 << i)) !== 0) {
          userIndices.push(input.originalIndices[i]);
        }
      }
      return {
        userIndices,
        commonSkillCount: score.commonSkillCount,
        effectiveCommonSkillCount: score.effectiveCommonSkillCount,
      };
    });
    const excludedUserIndices: number[] = [];
    for (let i = 0; i < n; i++) {
      if ((bestExcludedMask & (1 << i)) !== 0) {
        excludedUserIndices.push(input.originalIndices[i]);
      }
    }
    return {
      teams,
      excludedUserIndices,
      effectiveTotalCommonSkillCount: bestTotal,
      varianceScore: teamCount * bestSumSq - bestTotal * bestTotal,
    };
  };

  const dfs = (remainingMask: number, teamsFormed: number, excludedSoFar: number): void => {
    nodeTick++;
    if (input.statsOut) input.statsOut.dfsNodeCount++;
    if ((nodeTick & 0x3fff) === 0 && deadline !== 0 && Date.now() > deadline) {
      throw new PartyGroupingTimeoutError(materializeBest());
    }

    // B 方案可行性剪枝（文档 §32）
    const seatsLeft = (teamCount - teamsFormed) * m;
    if (popcount(remainingMask & mustIncludeMask) > seatsLeft) return;
    const exclusionsLeft = excludedCount - excludedSoFar;
    if (popcount(remainingMask & excludableMask) < exclusionsLeft) return;

    if (remainingMask === 0) {
      // 不变式：|remaining| = (teamCount - teamsFormed)·M + (excludedCount - excludedSoFar)
      // 因此 remaining 为空当且仅当队伍与排除名额恰好用尽
      if (input.statsOut) input.statsOut.completeGroupCount++;
      recordIfBetter();
      return;
    }

    // 每个新队伍必须包含剩余用户中索引最小者（文档 §25，消除队伍排列重复）
    const uBit = remainingMask & -remainingMask;

    // 分支一：组成包含最小剩余用户的队伍（第一版遍历全部候选，文档 §27）
    for (let i = 0; i < teamMaskList.length; i++) {
      const teamMask = teamMaskList[i];
      if ((teamMask & uBit) === 0) continue;
      if ((teamMask & ~remainingMask) !== 0) continue;
      const eff = teamEffectiveList[i];
      curTeamMasks.push(teamMask);
      curTotal += eff;
      curSumSq += eff * eff;
      dfs(remainingMask & ~teamMask, teamsFormed + 1, excludedSoFar);
      curTeamMasks.pop();
      curTotal -= eff;
      curSumSq -= eff * eff;
    }

    // 分支二：排除当前最小剩余用户（必要时才产生排除分支，文档 §30/§31）
    if (exclusionsLeft > 0 && (excludableMask & uBit) !== 0) {
      curExcludedMask |= uBit;
      dfs(remainingMask & ~uBit, teamsFormed, excludedSoFar + 1);
      curExcludedMask &= ~uBit;
    }
  };

  dfs(fullMask, 0, 0);

  return materializeBest();
}
