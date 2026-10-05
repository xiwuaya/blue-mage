# 均衡组队算法开发工作记录（result.md）

> **记录范围**：自「请阅读均衡组队算法开发文档」起至「多队伍结果新增应用该配置按钮」止的完整会话。
> **整理时间**：2026-10-05
> **用途**：后期 review 留档——做了什么、为什么这么做、改了哪些文件、验证结果如何、遗留了什么。
> **前置输入**：《均衡组队算法开发文档.md》v1.0（52 节，本文以「文档 §N」指代其章节）。

---

## 一、工作总览（三个阶段）

| 阶段 | 用户请求 | 交付物 | 状态 |
| --- | --- | --- | --- |
| ① 算法 baseline + Benchmark | 按开发文档实现多队均衡分组算法，先不动 UI | `src/lib/partyGrouping.ts`、`tools/bench-party-grouping.ts`、`package.json` 新增脚本、`benchmark-baseline.md` | ✅ 完成，对拍 425/425 |
| ② 「多队伍组合推荐」UI | 在「最优组队推荐」下方新增一栏，点击按钮触发 Worker 计算，结果按队伍展示 | `src/lib/partyGrouping.worker.ts`、`PartyModal.vue` 大改 | ✅ 完成，浏览器实测通过 |
| ③ 多队伍结果「应用该配置」 | 每队行末新增应用按钮，逻辑/样式复用「最优队伍构成」的现有实现 | `PartyModal.vue` 脚本 + 模板小改 | ✅ 完成，浏览器实测通过 |

**核心原则**（贯穿全程）：先正确性后性能；算法纯函数化与 UI 解耦；优化（`teamMasksByUser`、上界剪枝）留待 Phase 3/4，所有优化必须保证结果一致。

---

## 二、决策记录（含提问与用户选择）

### 2.1 第一轮提问（算法阶段，用户全部选择推荐项）

| 问题 | 选项 | **最终决策** |
| --- | --- | --- |
| 本次开发范围 | 仅算法 / 算法+Bench / 含 UI 一次做完 | **算法 baseline + Benchmark，不动 UI**（符合文档 §45/§52「先算法后 UI」） |
| 待确定① MustInclude 可行性剪枝 | A 只查席位 / B A+排除名额 / C 实际分配可行性 | **B 方案**（剩余 mustInclude ≤ 剩余席位，且剩余普通用户 ≥ 剩余排除名额） |
| 待确定③ DFS 统计方式 | 增量维护 / 叶节点整体计算 | **增量维护** effectiveTotal 与 Σxi²（回溯时回退，叶节点零重算，天然支持 Phase 4 上界剪枝） |
| Benchmark 承载方式 | 独立脚本+esbuild / 组件内临时调试 / 引入 vitest | **独立脚本 + 仓库自带 esbuild**（零新依赖；tsconfig 只含 `src/**`，tools/ 不影响应用构建） |

### 2.2 第二轮提问（UI 阶段，两轮才定，注意过程）

第一轮 4 个 UI 问题用户**未作答**，我按推荐项假设「每行两队」提交计划 → **计划未获批准**，用户要求重新提问。第二轮用户明确决策：

| 问题 | **最终决策** |
| --- | --- |
| 每行显示几个队伍 | **每队一行**（竖排，非最初假设的每行两队——第一版计划因此被否） |
| 成员（用户名）如何展示 | **显示成员徽章**（复用现有 `.user-badge` 样式） |
| DFS 计算怎么跑 | **Web Worker 后台计算**（界面不冻结、可取消；否决了主线程同步+超时方案） |
| N%M≠0 的被排除用户 | **显示排除行**（灰色徽章，与文档 §42 一致） |

> Review 要点：凡用户明确列出「待确定」的事项，必须问到手；用户对显示格式有自己的想法，不要用推荐项替代其明示示例。

### 2.3 实现层面自行拍板的技术决策（已在实际会话中说明理由）

1. **`excludableMask` 不作为入参**：模块内部推导 `excludableMask = fullMask & ~mustIncludeMask`。依据文档 §7/§31，active 用户只有 state 0/1 两种，「可排除 = 非 must-include」，由调用方传两个掩码反而引入不一致风险。
2. **四级比较器的字典序用「最低差异位」O(1) 掩码法**：等大小集合中，最低差异位属于谁的升序序列更小（数学上与逐元素比较字典序等价）。避免 N=18/M=3 约 1.9 亿叶节点场景下每叶分配数组。对拍参考实现用**普通数组逐元素比较**独立验证了该技巧。
3. **模块内置 `timeBudgetMs` + `PartyGroupingTimeoutError`（携带 partialBest）**：仅用于 Benchmark 防失控（N=18 分钟级跑不完），不传时零行为差异；这样 bench 永远能正常退出并报告已探索规模与当前最好解。
4. **DFS 扫描面用并行数组而非直接遍历 Map**：`teamScoreMap` 仍是文档 §17 规定的缓存结构，但热循环遍历其数组形式（`teamMaskList`/`teamEffectiveList`），避免每次迭代分配 entry 元组。语义与文档 §27「遍历整个 teamScoreMap」一致。
5. **`spellMasks` 语义确认**：值是「拥有该技能」的用户位掩码（`PartyModal.vue` 原 278 行 `currentMask | (1 << i)`），与文档 §11 假设一致；分类过滤（`getFilterKey`/`filterTypes`）留在调用方完成，模块不做。
6. **UI 失效策略 + 应用按钮的快照抑制**（阶段③核心设计）：输入签名变化 → 重置多队伍结果；但「应用该配置」本身就会改三态（隐藏非本队成员），会导致点击瞬间结果消失。方案：应用时记录**应用后的签名快照**，watch 发现新值等于快照则保留结果。选快照比较而非布尔标记，是因为「应用未引起实际变化」时布尔标记会残留、错误吞掉下一次手动变更的重置。
7. **不做「应用整个分组」语义**：应用按钮严格复用单队语义（隐藏非本队所有人），这是用户明示的「处理逻辑同最优队伍构成一样」；文档 §44 的多队结果回写设计仍属后续。

---

## 三、文件清单与改动明细

### 3.1 新增 `src/lib/partyGrouping.ts`（纯算法模块，无 Vue 依赖）

**导出 API**：

```ts
export const MAX_EFFECTIVE_COMMON_SKILLS = 12;

export type TeamScore = { commonSkillCount: number; effectiveCommonSkillCount: number };
export type PartyTeamResult = { userIndices: number[]; commonSkillCount: number; effectiveCommonSkillCount: number };
export type PartyGroupResult = {
  teams: PartyTeamResult[];
  excludedUserIndices: number[];
  effectiveTotalCommonSkillCount: number;
  varianceScore: number;
};
export type PartyGroupingStats = { dfsNodeCount: number; completeGroupCount: number };
export type FindBalancedPartyGroupsInput = {
  userCount: number;            // N ≤ 30（number 位掩码约束）
  teamSize: number;             // M ≥ 1
  spellMasks: Map<number, number>;  // 技能 → 拥有者位掩码（过滤由调用方完成）
  mustIncludeMask: number;
  originalIndices: number[];    // activeIndex → originalIndex 映射
  statsOut?: PartyGroupingStats;
  timeBudgetMs?: number;        // 仅 Benchmark 防失控用
};
export class PartyGroupingTimeoutError extends Error { partialBest: PartyGroupResult | null }

export function generateCombinationMasks(n: number, m: number): number[];   // Gosper's hack
export function calculateTeamScore(partyMask: number, spellMasks: Map<number, number>): TeamScore;
export function findBalancedPartyGroups(input: FindBalancedPartyGroupsInput): PartyGroupResult | null;
```

（模块内部私有：`popcount`、`maskLexLess`。）

**算法流程**（对应文档章节）：
1. **守卫**（§4/§10）：N>30、N<M、mustIncludeCount > ⌊N/M⌋×M、普通用户数 < N%M → 返回 null。注意：旧的 `mustIncludeCount > targetM` 单队约束**已按文档 §9 废除**（mustInclude 是整个分组方案的约束，不是单队约束）。
2. **TeamScore 预计算**（§18/§19）：对**全部** C(N,M) 组合计算 `calculateTeamScore`（`(spellMask & partyMask) === partyMask` 判定共同技能），存入 `teamScoreMap: Map<number, TeamScore>`；`effectiveCommonSkillCount = min(commonSkillCount, 12)`。**预计算不受 mustInclude 影响**（§19：不包含全部 mustInclude 的组合仍可能是合法分组中的一队）。
3. **DFS / 回溯**（§24–§32）：
   - 状态：`remainingMask`、已组队伍掩码列表（创建序即规范序）、`curExcludedMask`、t/e 计数、增量 `curTotal`/`curSumSq`。
   - 每层取最小剩余用户 `uBit = remainingMask & -remainingMask`（§25 队伍排列去重）。
   - 节点入口做 **B 方案剪枝**（§32）：剩余 mustInclude > (teamCount−t)×M 或剩余普通用户 < 剩余排除名额 → 剪枝。
   - 分支一：遍历全部候选队（含 uBit 且 ⊆ remaining）；分支二：排除 uBit（名额未满且可排除时）。
   - 不变式：|remaining| = (teamCount−t)·M + (excludedCount−e)，因此 remaining=0 ⟺ 恰好组满队并排除 N%M 人。
4. **四级比较**（§33–§40）：effectiveTotal 大者优先 → `varianceScore = teamCount×Σxi² − (Σxi)²` 小者优先（teamCount 固定，全整数）→ 队伍字典序（掩码最低差异位法）→ 排除字典序（同法）。
5. **物化**：仅对最终最优解把掩码转成升序 `userIndices`，经 `originalIndices` 映射回 UI 索引。

### 3.2 新增 `src/lib/partyGrouping.worker.ts`（Web Worker 封装）

- `self.onmessage` 收 `FindBalancedPartyGroupsInput`（Map 可结构化克隆），调用 `findBalancedPartyGroups`，`postMessage` 回 `{ type: 'done'; result }` 或 `{ type: 'error'; message }`。
- 目的：把 N 较大时秒级~分钟级的 DFS 移出主线程，UI 不冻结、可取消。
- Vite 2.9 `?worker` 导入（env.d.ts 已有 `vite/client` 引用），构建产物独立 chunk `partyGrouping.worker.*.js`（2.65 KiB）。

### 3.3 新增 `tools/bench-party-grouping.ts`（对拍 + Benchmark）

- **固定种子 PRNG**（mulberry32，种子 20261005），结果可复现。
- **手工可验证断言**：用户 0/1/2 有技能 10..14（5 个）、用户 3/4/5 有技能 20..26（7 个），两组互不重叠 → 唯一最优 total=12、varianceScore=4（2·(5²+7²)−12²）。
- **独立暴力参考实现**（不复用主算法任何代码）：枚举排除子集（升序组合）+ 无序队伍划分（最小用户配 m−1 伙伴递归），比较器用**数组逐元素字典序**（独立验证掩码法的正确性）。
- **对拍**：14 组 (N,M) 配置（N=4..10，M=2/3/4）× 30 随机实例 + 5 组显式边界用例（N<M 无解、must 超席位无解×2、must=全部席位可行、普通用户恰好被排除）。随机实例覆盖随机 mustInclude、随机技能拥有率 p∈[0.25,0.75]（高 p 触发 12 封顶）、originalIndex 随机置换（验证索引映射）。
  - 边界用例是**后补的**：最初随机实例受生成规则限制（mustCount ≤ teamCount×M），永远产生不了无解场景，§10.2/§10.3 的 null 分支没被测到。
- **Benchmark**：N=6/10/12/15/18 (M=3) + N=12 (M=4)；K=40 技能、p=0.5、mustInclude={0,1}；单场景默认 60s 预算（CLI `--budget=` 可调），超时捕获 `PartyGroupingTimeoutError` 报告已探索节点数/速率/当前最好解。
- **运行方式**：`npm run bench:party`。

### 3.4 修改 `src/components/PartyModal.vue`

| 处 | 改动 |
| --- | --- |
| imports | 增加 `onBeforeUnmount`；新增 `import PartyGroupingWorker from '@/lib/partyGrouping.worker?worker'` 与 `import type { PartyGroupResult } from '@/lib/partyGrouping'` |
| **行为保持重构** | 原 `bestParty` 内的数据准备段（原 222–280 行：activeUsers 构建、mustIncludeMask、validSpellNos、spellMasks）**原样提取**为 `buildAlgoInputData()`，新旧功能共用；`bestParty` 的 Gosper 枚举、评分、返回结构一行未动。顺带把过滤回调里遮蔽外层 `m` ref 的参数 `(m)` 改名 `(method)` |
| 新增第 5 节脚本 | `displayName(originalIndex)`（与原模板 394 行取名逻辑一致）；`type MultiTeamStatus = 'idle'|'computing'|'done'|'error'`；`type MultiTeamWorkerMessage`；refs：`multiTeamStatus/multiTeamResult/multiTeamError/multiTeamElapsed`；非响应式 `multiTeamWorker/multiTeamTimer`；`resetMultiTeam()`（terminate worker + 清计时器 + 清状态）；`algoSourceSignature` computed（JSON.stringify 输入签名）+ `watch`（快照抑制，见下）；`applyMultiTeamConfiguration(teamIndices)`；`startMultiTeamCompute()`（computing 中点击=取消；校验 m 1–8、n>30 报错；起 Worker、postMessage；onmessage/onerror 收尾）；`onBeforeUnmount` 兜底清理 |
| 模板 | `.algo-content` 内、`.best-party-result` 之后新增 `.multi-team-section`：标题、说明文案、触发按钮（`开始计算/重新计算/取消计算` 三态文案，m 未填禁用并提示）、computing 耗时提示、结果区（每队一行：`队伍N` 金色标签 + `.user-badge` 成员徽章 + `：共可学习 X 个技能`（真实 commonSkillCount，文档 §43）+ `.apply-text` 应用按钮）+ 排除行（`.user-badge.excluded` 灰徽章，仅 N%M≠0 时）+ 无解/错误提示（复用 `.no-skills-tips`） |
| 样式 | `.multi-team-section/-title/-desc/-toolbar/-btn/-hint/-result/-row/-label/-colon/-excluded` 与 `.user-badge.excluded`，沿用金色 #ffbe31 主色与虚线分隔风格 |

**「应用该配置」的关键设计（阶段③）**：

```ts
let applySignatureSnapshot: string | null = null;
watch(algoSourceSignature, (val) => {
  if (applySignatureSnapshot !== null && val === applySignatureSnapshot) {
    applySignatureSnapshot = null;   // 本次变化由「应用该配置」引起 → 保留结果
    return;
  }
  applySignatureSnapshot = null;
  resetMultiTeam();                  // 手动变更 → 照常重置
});
const applyMultiTeamConfiguration = (teamIndices: number[]) => {
  applyConfiguration(teamIndices);               // 完全复用「最优队伍构成」的现有逻辑
  applySignatureSnapshot = algoSourceSignature.value;  // 记录应用后的签名
};
```

若不加此机制，点击应用按钮改三态 → 签名变化 → 结果被清空 → 按钮形同虚设。「最优队伍构成」的对应行为是应用后面板继续显示，故对齐。

### 3.5 修改 `package.json`

```json
"bench:party": "esbuild tools/bench-party-grouping.ts --bundle --platform=node --format=cjs --outfile=node_modules/.cache/bench-party-grouping.cjs && node node_modules/.cache/bench-party-grouping.cjs"
```

esbuild 随 Vite 2 自带（`node_modules/.bin/esbuild`），产物输出到 `node_modules/.cache`（gitignore 内），零新增依赖。

### 3.6 新增 `AIWorks/均衡组队算法/benchmark-baseline.md`

Phase 2 结果记录：环境、正确性验证清单、规模数据表、结论与 Phase 3/4 依据、§47 勘误、手工场景附录。

### 3.7 本文件 `AIWorks/均衡组队算法/result.md`

---

## 四、验证记录

### 4.1 静态与构建

- `npx vue-tsc --noEmit`：每次改动后均通过（覆盖 `src/lib/partyGrouping.ts`、worker、PartyModal.vue，含 `?worker` 类型）。
- `npx vite build`：通过；worker 独立 chunk 正常产出。
- `PartyModal.vue` 阶段①未动；阶段②③的改动均通过 git status 复核。

### 4.2 算法正确性（`npm run bench:party`）

- 手工场景断言 ✅（total=12、varianceScore=4 与手算一致）
- 暴力对拍 420 + 边界 5 = **425/425 通过**（其中 3 组双方均判定无解）
- **理论精确吻合**：N=12/M=3 完整分组数 = 15,400（与文档 §47 一致）；DFS 节点数 32,396 = 1 + 55 + 1,540 + 15,400 + 15,400（根 + t=1..4 层状态数），逐层吻合，证明 DFS 去重与候选展开无重复无遗漏
- N=10/M=3 完整分组 2,240 = 8（可排除普通用户数）× 280（其余 9 人分 3 队）——B 方案剪枝正确把 mustInclude 用户挡在排除名额外

### 4.3 规模 Benchmark（K=40、p=0.5、mustInclude={0,1}）

| N | M | C(N,M) | DFS 节点 | 完整分组 | 耗时 | 结论 |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 6 | 3 | 20 | 21 | 10 | 0.1ms | ✅ |
| 10 | 3 | 120 | 5,065 | 2,240 | 1.5ms | ✅ 走排除分支 |
| 12 | 3 | 220 | 32,396 | 15,400 | 6.7ms | ✅ 接 UI 无压力 |
| 12 | 4 | 495 | 11,716 | 5,775 | 3.4ms | ✅ |
| 15 | 3 | 455 | 2,948,037 | 1,401,400 | ~780ms | ⚠️ 接近交互上限 |
| 18 | 3 | 816 | 1.18 亿（预算内） | 5,610 万（预算内） | 60s 超时 | ❌ baseline 不可行，估算全程 15 分钟量级 |

结论：瓶颈确如文档 §47 预判在 DFS 搜索而非预计算；Phase 3（`teamMasksByUser`，N=18 时单层候选 816→136）与 Phase 4（上界剪枝）有明确依据。

### 4.4 浏览器实测（dev server + 应用内浏览器）

**流程驱动**：展开「更多设置」→ 多人模式「配置」→ 展开「最优组队推荐」面板 → 种入 4 人数据（我=2..124，用户2={2,3,4}，用户3={2,3,4,5,6}，用户4={2,3,4,5}）→ 队伍人数 m。

| 用例 | 期望 | 实测 |
| --- | --- | --- |
| m=2 计算 | 队伍1=[我,用户3] 5 个、队伍2=[用户2,用户4] 3 个（总分 8 优于备选 7） | ✅ 一致 |
| 每队一行格式 | 队伍N 金色标签 + 成员徽章 + 共可学习 X 个技能 | ✅ 截图确认 |
| m=3 计算（排除分支） | 队伍1=[我,用户3,用户4] **4 个**（交集 {2,3,4,5}，优于直觉的 3）+ 排除用户2 | ✅ 算法找到更优解 |
| 失效策略 | 改数据/m/三态后按钮重置为「开始计算」 | ✅ 多次验证 |
| 按钮三态 | 开始计算 → 取消计算 → 重新计算 | ✅（取消路径与已验证的 resetMultiTeam 共代码，未专门拦截中间态） |
| 应用队伍1 | 页面三态更新（用户2/用户4 隐藏）+ **结果保留** + 旧面板按新池重算（5 个） | ✅ |
| 应用后切换队伍2 | 配置翻转（我/用户3 隐藏）+ 结果保留 | ✅ |
| 应用后手动点眼睛 | 结果照常重置（防陈旧保护不被快照机制绕过） | ✅ |
| 全程 JS 错误 | — | 0（挂 `app.config.errorHandler` + window error 监听确认） |

---

## 五、测试环境怪癖记录（review 时勿误判为产品 bug）

以下均为 **IAB 自动化环境**现象，真实浏览器不受影响；数据注入用了 `el._assign(...)`（Vue v-model 指令挂到元素上的赋值器，与 change 处理器同一代码路径）：

1. **`v-model.lazy` 的 textarea 不响应 Playwright `fill()`/合成 `change` 事件**：`fill()` 只派发 `input`（lazy 监听 `change`）；手动 `dispatchEvent(new Event('change'))` 与原生 Tab 失焦也无效（原因未完全定论，已排除 `el.composing` 卡 true、`_vei` 缺失属正常——v-model 指令监听是原生 addEventListener，不经 patchEvent）。
2. **响应式调度队列出现过一次「状态已变、DOM 未刷」的停滞**（multiTeamStatus=idle 但按钮仍显示重新计算），下一次触发后自愈追平（bestParty 一次性补上了此前积压的状态）。期间无任何 JS 错误。未深究根因，疑似环境相关。
3. **Playwright actionability 假阳性**：按钮明明在最顶层（`elementFromPoint` 命中自身）却报"covered by .modal-backdrop"/点击超时，改用 DOM `.click()` 绕过。
4. **getByRole name 默认子串匹配**：`button "配置"` 会同时命中「配置组队成员」，需 `exact: true`。
5. **`el._vei` 只存 `@click` 类 invoker**，v-model 指令监听查不到——不能据此断言监听缺失。
6. **「更多设置」/弹窗开合状态被 localStorage 持久化**，刷新后不重置，驱动脚本需先读状态再决定点不点。

---

## 六、勘误与发现

1. **文档 §47 数表勘误**：N=18/M=3 的完整分组数应为 **190,590,400**（= 18!/(3!⁶·6!)），文档写的 17,153,136 有误（约差 11.1 倍）；N=6（10）、N=12（15,400）两行无误。已写入 benchmark-baseline.md，未回改开发文档原文。该勘误不影响结论方向，但影响 N=18 耗时预期。
2. **§10.3 实为 §10.2 的推论**：普通用户数 = N − mustIncludeCount ≥ N − teamCount×M = N%M，即「mustInclude ≤ 总席位」成立时「普通用户 ≥ 排除名额」必然成立。两个守卫都保留（文档明示且无害），但意味着实际不存在仅违反 §10.3 的输入。
3. **随机实例的覆盖盲区**：mustCount 上限取 teamCount×M 时，随机场景永远无解不了——对拍必须显式构造边界用例（已补）。
4. **N=12/M=3 的节点数公式可作回归断言**：1 + C(11,2) + C(11,2)×C(8,2) + 2×15,400 = 32,396（每层新队必含最小剩余用户且必含其最小值，后续队伍选择数依次为 C(8,2)、C(5,2)…）。

---

## 七、明确未做 / 后续建议

| 事项 | 状态 | 备注 |
| --- | --- | --- |
| Phase 3：`teamMasksByUser` 索引 | 未做 | 单层候选 816→136，N=15/18 复测后决定 |
| Phase 4：剩余总分上界剪枝 | 未做 | 需保证结果与 baseline 完全一致（对拍脚本可复用） |
| `applyConfiguration` 多队整体语义（文档 §44） | 未设计 | 当前应用按钮为单队语义（用户明示）；「应用整个分组（隐藏被排除者）」是候选后续 |
| 「取消计算」路径的实测 | 未实测 | 代码即 `resetMultiTeam()`，已被其他用例间接覆盖；可用 15 人场景专门验证 |
| 文档 §47 勘误回写开发文档 | 未做 | 仅记录于 benchmark-baseline.md |
| UI 每队展示 `effectiveCommonSkillCount`/总分汇总 | 未做 | 遵循 §43 只显示真实数量；如需展示算法口径可加副行 |

---

## 八、会话中走过的弯路（供复盘）

1. UI 显示格式第一版按推荐项假设「每行两队」提交计划被否——用户示例与其真实意图（每队一行）不一致时，应以其明确选择为准。
2. 对拍最初没有无解场景（生成规则决定），第一轮就发现并补齐了边界用例。
3. 浏览器测试中为「输入不生效」排查了很久（fill→input 事件、change 派发、composing、_vei、游离 DOM、props 回写环、调度停滞……），最终确认是 IAB 环境的 `v-model.lazy` + 合成事件限制，改用 `el._assign` 注入数据完成验证。教训：先区分「产品 bug」与「测试环境限制」，后者尽早绕过。
4. 恢复测试状态时用同步循环读 `classList` 判断三态，被 Vue 异步渲染坑（多点了几次眼睛），改为直接写组件 setupState 解决。

---

## 九、当前 git 工作区状态（截至记录时，dev 分支）

- **新增**：`src/lib/partyGrouping.ts`、`src/lib/partyGrouping.worker.ts`、`tools/bench-party-grouping.ts`、`AIWorks/均衡组队算法/`（开发文档、benchmark-baseline.md、本文件）
- **修改**：`src/components/PartyModal.vue`、`package.json`（+1 行脚本）
- **与本次会话无关的既有改动**：`plan_1.md`、`result.md`、`地图集成开发文档.md` 的删除，`.zcode/`、`AIWorks/` 目录本身为未跟踪状态（会话开始前已存在）
- dev server 在后台运行（`npm run dev`，http://localhost:3000）
