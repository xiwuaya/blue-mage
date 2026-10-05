/**
 * 均衡组队算法 Benchmark（开发文档 §46）
 *
 * 运行：npm run bench:party
 *      npm run bench:party -- --budget=120000   自定义单场景时间预算（毫秒，默认 60000）
 *
 * 内容：
 *   0. 手工可验证场景断言（N=6, M=3，技能互不重叠的两组）
 *   1. 正确性对拍：独立暴力参考实现 vs 主算法，随机场景数百组
 *      （覆盖无解、mustInclude 上限、排除名额、12 技能封顶、originalIndex 置换）
 *   2. 规模 Benchmark：N=6/10/12/15/18，记录 DFS 节点数、完整分组数、耗时与结果
 *
 * 本脚本位于 tools/（tsconfig 不包含），经 esbuild 打包后由 node 执行，
 * 不参与应用构建。
 */

import {
  MAX_EFFECTIVE_COMMON_SKILLS,
  PartyGroupingTimeoutError,
  findBalancedPartyGroups,
  generateCombinationMasks,
} from "../src/lib/partyGrouping";
import type { PartyGroupResult, PartyGroupingStats } from "../src/lib/partyGrouping";

// ---------- 基础工具 ----------

const popcount = (mask: number): number => {
  let c = 0;
  while (mask > 0) {
    c += mask & 1;
    mask >>>= 1;
  }
  return c;
};

const maskOf = (users: number[]): number => {
  let mask = 0;
  for (const u of users) mask |= 1 << u;
  return mask;
};

/** 固定种子伪随机数（mulberry32），保证 Benchmark 可复现 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function compareNumberLists(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

// ---------- 0. 手工可验证场景 ----------

function runHandcraftedCheck(): boolean {
  // 用户 0/1/2 共有技能 10..14（5 个），用户 3/4/5 共有技能 20..26（7 个），
  // 两组技能互不重叠 → 跨组混合队伍共同技能为 0，最优解唯一。
  const spellMasks = new Map<number, number>();
  for (let s = 10; s <= 14; s++) spellMasks.set(s, 0b000111);
  for (let s = 20; s <= 26; s++) spellMasks.set(s, 0b111000);

  const result = findBalancedPartyGroups({
    userCount: 6,
    teamSize: 3,
    spellMasks,
    mustIncludeMask: 0,
    originalIndices: [0, 1, 2, 3, 4, 5],
  });
  const actual = JSON.stringify(
    result && {
      teams: result.teams.map((t) => ({
        userIndices: t.userIndices,
        commonSkillCount: t.commonSkillCount,
        effectiveCommonSkillCount: t.effectiveCommonSkillCount,
      })),
      excludedUserIndices: result.excludedUserIndices,
      effectiveTotalCommonSkillCount: result.effectiveTotalCommonSkillCount,
      varianceScore: result.varianceScore,
    },
  );
  const expected = JSON.stringify({
    teams: [
      { userIndices: [0, 1, 2], commonSkillCount: 5, effectiveCommonSkillCount: 5 },
      { userIndices: [3, 4, 5], commonSkillCount: 7, effectiveCommonSkillCount: 7 },
    ],
    excludedUserIndices: [],
    effectiveTotalCommonSkillCount: 12,
    varianceScore: 4, // 2·(5²+7²) − 12² = 4
  });
  if (actual !== expected) {
    console.error("手工场景断言失败：\n  期望 " + expected + "\n  实际 " + actual);
    return false;
  }
  console.log("手工场景断言通过：N=6 M=3 → [0,1,2]=5 + [3,4,5]=7，total=12，varianceScore=4");
  return true;
}

// ---------- 1. 暴力参考实现（独立于主算法） ----------

type RefBest = {
  /** 规范序：每队升序 activeIndex，队伍按首成员升序 */
  teams: number[][];
  /** 与 teams 对齐的真实共同技能数 */
  realCounts: number[];
  /** 升序 */
  excluded: number[];
  total: number;
  variance: number;
} | null;

function bruteForceBestGrouping(
  n: number,
  m: number,
  spellMasks: Map<number, number>,
  mustIncludeMask: number,
): RefBest {
  const fullMask = (1 << n) - 1;
  if (n < m) return null;
  const teamCount = Math.floor(n / m);
  const excludedCount = n % m;
  const clampedMust = mustIncludeMask & fullMask;
  if (popcount(clampedMust) > teamCount * m) return null;
  const excludableMask = fullMask & ~clampedMust;
  if (popcount(excludableMask) < excludedCount) return null;

  const teamRealScore = (teamMask: number): number => {
    let c = 0;
    for (const sMask of spellMasks.values()) {
      if ((sMask & teamMask) === teamMask) c++;
    }
    return c;
  };

  let best: RefBest = null;

  const consider = (teams: number[][], realCounts: number[], excluded: number[]) => {
    let total = 0;
    let sumSq = 0;
    for (const real of realCounts) {
      const eff = Math.min(real, MAX_EFFECTIVE_COMMON_SKILLS);
      total += eff;
      sumSq += eff * eff;
    }
    const variance = teamCount * sumSq - total * total;

    const save = () => {
      best = {
        teams: teams.map((t) => t.slice()),
        realCounts: realCounts.slice(),
        excluded: excluded.slice(),
        total,
        variance,
      };
    };
    const cur = best;
    if (!cur) {
      save();
      return;
    }
    if (total !== cur.total) {
      if (total > cur.total) save();
      return;
    }
    if (variance !== cur.variance) {
      if (variance < cur.variance) save();
      return;
    }
    for (let k = 0; k < teams.length; k++) {
      const c = compareNumberLists(teams[k], cur.teams[k]);
      if (c !== 0) {
        if (c < 0) save();
        return;
      }
    }
    for (let k = 0; k < excluded.length; k++) {
      if (excluded[k] !== cur.excluded[k]) {
        if (excluded[k] < cur.excluded[k]) save();
        return;
      }
    }
  };

  // 枚举排除集合：从可排除用户中选恰好 excludedCount 个（升序组合）
  const excludedChoice: number[] = [];
  const enumerateExcluded = (fromUser: number) => {
    if (excludedChoice.length === excludedCount) {
      const excludedMask = maskOf(excludedChoice);
      const rest: number[] = [];
      for (let i = 0; i < n; i++) {
        if ((excludedMask & (1 << i)) === 0) rest.push(i);
      }
      partition(rest, [], []);
      return;
    }
    for (let i = fromUser; i < n; i++) {
      if ((excludableMask & (1 << i)) === 0) continue;
      excludedChoice.push(i);
      enumerateExcluded(i + 1);
      excludedChoice.pop();
    }
  };

  // 无序队伍划分：每次取最小剩余用户，枚举其 m−1 个队友 → 每个无序划分恰好一次
  const partition = (users: number[], teams: number[][], realCounts: number[]) => {
    if (users.length === 0) {
      consider(teams, realCounts, excludedChoice);
      return;
    }
    const first = users[0];
    const rest = users.slice(1);
    const combo: number[] = [];
    const choose = (start: number) => {
      if (combo.length === m - 1) {
        const team = [first].concat(combo); // first 为剩余最小，队伍天然升序
        const remaining = rest.filter((u) => combo.indexOf(u) === -1);
        teams.push(team);
        realCounts.push(teamRealScore(maskOf(team)));
        partition(remaining, teams, realCounts);
        teams.pop();
        realCounts.pop();
        return;
      }
      for (let i = start; i < rest.length; i++) {
        combo.push(rest[i]);
        choose(i + 1);
        combo.pop();
      }
    };
    choose(0);
  };

  enumerateExcluded(0);
  return best;
}

// ---------- 1.1 随机实例与对拍 ----------

type RandomInstance = {
  spellMasks: Map<number, number>;
  mustIncludeMask: number;
  originalIndices: number[];
};

function randomInstance(rng: () => number, n: number, m: number): RandomInstance {
  const skillCount = 20 + Math.floor(rng() * 20); // 20..39 个技能
  const p = 0.25 + rng() * 0.5; // 0.25..0.75，高 p 会触发 12 技能封顶
  const spellMasks = new Map<number, number>();
  for (let s = 0; s < skillCount; s++) {
    let mask = 0;
    for (let u = 0; u < n; u++) {
      if (rng() < p) mask |= 1 << u;
    }
    spellMasks.set(1000 + s, mask);
  }

  const teamCount = Math.floor(n / m);
  const maxMust = Math.min(n, teamCount * m);
  const mustCount = Math.floor(rng() * (maxMust + 1)); // 含无解场景
  const mustUsers: number[] = [];
  while (mustUsers.length < mustCount) {
    const u = Math.floor(rng() * n);
    if (mustUsers.indexOf(u) === -1) mustUsers.push(u);
  }

  // originalIndices 用随机置换，顺带验证 activeIndex → originalIndex 映射
  const originalIndices: number[] = [];
  for (let u = 0; u < n; u++) originalIndices.push(u);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = originalIndices[i];
    originalIndices[i] = originalIndices[j];
    originalIndices[j] = tmp;
  }

  return { spellMasks, mustIncludeMask: maskOf(mustUsers), originalIndices };
}

function moduleSignature(r: PartyGroupResult | null): string {
  if (r === null) return "null";
  return JSON.stringify({
    teams: r.teams.map((t) => [t.userIndices, t.commonSkillCount, t.effectiveCommonSkillCount]),
    excluded: r.excludedUserIndices,
    total: r.effectiveTotalCommonSkillCount,
    variance: r.varianceScore,
  });
}

function referenceSignature(r: RefBest, originalIndices: number[]): string {
  if (r === null) return "null";
  return JSON.stringify({
    teams: r.teams.map((members, k) => [
      members.map((u) => originalIndices[u]),
      r.realCounts[k],
      Math.min(r.realCounts[k], MAX_EFFECTIVE_COMMON_SKILLS),
    ]),
    excluded: r.excluded.map((u) => originalIndices[u]),
    total: r.total,
    variance: r.variance,
  });
}

function runCrossCheck(): boolean {
  const configs: Array<[number, number]> = [
    [4, 2],
    [5, 2],
    [5, 3],
    [6, 2],
    [6, 3],
    [7, 2],
    [7, 3],
    [8, 2],
    [8, 3],
    [9, 2],
    [9, 3],
    [10, 2],
    [10, 3],
    [10, 4],
  ];
  const trialsPerConfig = 30;
  const seed = 20261005;
  let pass = 0;
  let fail = 0;
  let bothNull = 0;

  for (let c = 0; c < configs.length; c++) {
    const n = configs[c][0];
    const m = configs[c][1];
    for (let t = 0; t < trialsPerConfig; t++) {
      const rng = mulberry32(seed + c * 1000 + t);
      const inst = randomInstance(rng, n, m);
      const moduleResult = findBalancedPartyGroups({
        userCount: n,
        teamSize: m,
        spellMasks: inst.spellMasks,
        mustIncludeMask: inst.mustIncludeMask,
        originalIndices: inst.originalIndices,
      });
      const refResult = bruteForceBestGrouping(n, m, inst.spellMasks, inst.mustIncludeMask);
      const a = moduleSignature(moduleResult);
      const b = referenceSignature(refResult, inst.originalIndices);
      if (a === b) {
        pass++;
        if (moduleResult === null) bothNull++;
      } else {
        fail++;
        if (fail <= 3) {
          console.error(
            `对拍失败：N=${n} M=${m} trial=${t}\n  主算法: ${a}\n  参考实现: ${b}`,
          );
        }
      }
    }
  }
  console.log(
    `正确性对拍：${configs.length} 组配置 × ${trialsPerConfig} 实例 → 通过 ${pass}，失败 ${fail}（其中双方均判定无解 ${bothNull} 组）`,
  );

  // 边界用例：随机实例受生成规则限制覆盖不到的无解/极限场景（空技能表即可）
  const edgeCases: Array<{ n: number; m: number; must: number[]; desc: string }> = [
    { n: 2, m: 3, must: [], desc: "N < M → 无解" },
    { n: 5, m: 2, must: [0, 1, 2, 3, 4], desc: "must 5 > teamCount×M=4 → 无解" },
    { n: 7, m: 3, must: [0, 1, 2, 3, 4, 5, 6], desc: "must 7 > teamCount×M=6 → 无解" },
    { n: 6, m: 3, must: [0, 1, 2, 3, 4, 5], desc: "must 6 = 全部席位 → 可行" },
    { n: 7, m: 3, must: [0, 1, 2, 3, 4, 5], desc: "must 6 + 1 普通 + 需排除 1 → 普通用户必被排除" },
  ];
  for (const ec of edgeCases) {
    const inst: RandomInstance = {
      spellMasks: new Map<number, number>(),
      mustIncludeMask: maskOf(ec.must),
      originalIndices: Array.from({ length: ec.n }, (_, u) => u),
    };
    const moduleResult = findBalancedPartyGroups({
      userCount: ec.n,
      teamSize: ec.m,
      spellMasks: inst.spellMasks,
      mustIncludeMask: inst.mustIncludeMask,
      originalIndices: inst.originalIndices,
    });
    const refResult = bruteForceBestGrouping(ec.n, ec.m, inst.spellMasks, inst.mustIncludeMask);
    const a = moduleSignature(moduleResult);
    const b = referenceSignature(refResult, inst.originalIndices);
    if (a === b) {
      pass++;
      if (moduleResult === null) bothNull++;
      console.log(`  边界用例通过：${ec.desc}`);
    } else {
      fail++;
      console.error(`边界用例失败：${ec.desc}\n  主算法: ${a}\n  参考实现: ${b}`);
    }
  }

  console.log(
    `正确性对拍合计：通过 ${pass}，失败 ${fail}（其中双方均判定无解 ${bothNull} 组）`,
  );
  return fail === 0;
}

// ---------- 2. 规模 Benchmark ----------

function buildBenchInstance(n: number, m: number, seed: number): RandomInstance {
  // 固定参数：K=40 技能、p=0.5、mustInclude = 用户 0 和 1
  const rng = mulberry32(seed);
  const skillCount = 40;
  const p = 0.5;
  const spellMasks = new Map<number, number>();
  for (let s = 0; s < skillCount; s++) {
    let mask = 0;
    for (let u = 0; u < n; u++) {
      if (rng() < p) mask |= 1 << u;
    }
    spellMasks.set(1000 + s, mask);
  }
  const originalIndices: number[] = [];
  for (let u = 0; u < n; u++) originalIndices.push(u);
  const mustIncludeMask = maskOf([0, 1]);
  return { spellMasks, mustIncludeMask, originalIndices };
}

function formatResultLine(r: PartyGroupResult | null): string {
  if (!r) return "（无解）";
  const teams = r.teams
    .map((t) => `[${t.userIndices.join(",")}]=${t.commonSkillCount}`)
    .join(" ");
  const excluded = r.excludedUserIndices.length
    ? `排除 [${r.excludedUserIndices.join(",")}]`
    : "排除 -";
  return `总分(eff)=${r.effectiveTotalCommonSkillCount} 方差=${r.varianceScore} | ${teams} | ${excluded}`;
}

function runBenchmark(budgetMs: number): void {
  const scenarios = [
    { n: 6, m: 3 },
    { n: 10, m: 3 }, // N%M=1，走排除分支
    { n: 12, m: 3 },
    { n: 12, m: 4 },
    { n: 15, m: 3 },
    { n: 18, m: 3 },
  ];
  console.log(`\n规模 Benchmark（K=40 技能、p=0.5、mustInclude={0,1}、种子 20261005、单场景预算 ${budgetMs}ms）`);

  let allCompleted = true;
  for (const sc of scenarios) {
    const inst = buildBenchInstance(sc.n, sc.m, 20261005 ^ (sc.n * 131 + sc.m));
    const stats: PartyGroupingStats = { dfsNodeCount: 0, completeGroupCount: 0 };
    const combinationCount = generateCombinationMasks(sc.n, sc.m).length;

    let result: PartyGroupResult | null = null;
    let timedOut = false;
    const t0 = performance.now();
    try {
      result = findBalancedPartyGroups({
        userCount: sc.n,
        teamSize: sc.m,
        spellMasks: inst.spellMasks,
        mustIncludeMask: inst.mustIncludeMask,
        originalIndices: inst.originalIndices,
        statsOut: stats,
        timeBudgetMs: budgetMs,
      });
    } catch (e) {
      if (e instanceof PartyGroupingTimeoutError) {
        timedOut = true;
        allCompleted = false;
        result = e.partialBest;
      } else {
        throw e;
      }
    }
    const elapsed = performance.now() - t0;
    const rate = elapsed > 0 ? Math.round(stats.dfsNodeCount / (elapsed / 1000)) : stats.dfsNodeCount;

    console.log(
      `N=${String(sc.n).padStart(2)} M=${sc.m} | C(N,M)=${String(combinationCount).padStart(7)} | ` +
        `节点 ${String(stats.dfsNodeCount).padStart(12)} | 完整分组 ${String(stats.completeGroupCount).padStart(12)} | ` +
        `耗时 ${elapsed.toFixed(1).padStart(9)} ms（≈${rate.toLocaleString("en-US")} 节点/s）` +
        (timedOut ? " | 【超时未完成，以下为当前最好解】" : ""),
    );
    console.log(`        → ${formatResultLine(result)}`);
  }

  if (!allCompleted) {
    console.log(
      "\n提示：部分场景未在预算内完成——这正是文档 §47 的预期：N 增大后瓶颈来自 DFS 分组搜索。" +
        "可在 Phase 3/4 引入 teamMasksByUser 与上界剪枝后再复测。",
    );
  }
}

// ---------- 入口 ----------

function main(): void {
  let budgetMs = 60000;
  for (const arg of process.argv.slice(2)) {
    const match = /^--budget=(\d+)$/.exec(arg);
    if (match) budgetMs = parseInt(match[1], 10);
  }

  console.log(
    `均衡组队算法 Benchmark（MAX_EFFECTIVE_COMMON_SKILLS=${MAX_EFFECTIVE_COMMON_SKILLS}，node ${process.version}）\n`,
  );

  const handcraftedOk = runHandcraftedCheck();
  console.log("");
  const crossCheckOk = runCrossCheck();
  runBenchmark(budgetMs);

  if (!handcraftedOk || !crossCheckOk) {
    process.exitCode = 1;
  }
}

main();
