# tools/ 目录导航

构建期脚本与数据。按「数据 → 更新脚本 → 页面生成 → 验证 → 手动工具」分层，
`package.json` 的 scripts 与 `.github/workflows` 引用的路径均已对应到这里。

## 目录结构

| 目录 | 内容 | 何时运行 |
| --- | --- | --- |
| `data/` | 全部数据文件（源数据 + 构建期/离线生成 + 人工维护） | — |
| `update/` | prebuild 数据更新脚本 + 手动维护脚本 | prebuild 部分每次 `yarn build` 自动执行；`import-spell-history.py` 按需手动运行 |
| `pagegen/` | 构建期页面生成 | 每次 `yarn build` 自动执行（prerender 阶段） |
| `verify/` | 回归验证 | 手动：`yarn verify:hydration` / `yarn verify:cache` |
| `oneoff/` | 手动 / 历史工具 | 按需手动，不在构建链里 |

## data/ — 数据文件

| 文件 | 来源 | 消费方 |
| --- | --- | --- |
| `spells.json` | **自动生成**：`update/update-methods.js` 把 `method_updates.csv` 的增量应用到既有数据上 | `src/lib/spell.ts`、`src/lib/useSpellSync.ts`、`pagegen/` 全部脚本 |
| `spells.csv` | 上游游戏数据（历史源，`oneoff/parse.js` 的输入） | 仅 `oneoff/parse.js` |
| `method_updates.csv` | **人工维护**：新学习途径的增量更新 | `update/update-methods.js` |
| `override.json` | 人工维护：parse.js 的字段覆盖 | 仅 `oneoff/parse.js` |
| `map-keys.json` | **自动生成**：`update/update-map-keys.js` 用 XIVAPI 反查中文地名 | `src/lib/map.ts` |
| `fate-spawns.json` | 按 FATE 名称、游戏 ID 和所属地图维护的游戏内 X、Y 坐标数组 | 途径列表、地图弹窗、技能详情页 |
| `descriptions.json` | **自动生成 + 缓存**：`update/update-descriptions.js` 抓取的官方描述（text + html 双格式） | `pagegen/generate-spell-pages.js`（详情页用 html、llms 用 text） |
| `spell-history.json` | **离线生成，随仓库提交**：`update/import-spell-history.py` 从国服各版本标签的 `ActionTransient.csv` 生成版本索引与逐技能文本差异 | `pagegen/spell-page-template.js`（详情页「历史变更」区块） |
| `spell-history-summaries.json` | **人工维护**：按动作 ID + 变更版本填写中文摘要；缺失时页面显示「描述文本变更」 | `pagegen/spell-page-template.js` |

## 自动化链路

```
yarn build
├─ prebuild   update/update-date.js        改 App.vue 更新日期
│             update/update-methods.js     应用 method_updates.csv 增量
│             update/update-map-keys.js    反查 XIVAPI 生成 map-keys.json
│             update/update-descriptions.js 增量抓取描述（缓存完整时零请求）
├─ vue-tsc → vite build
└─ prerender  pagegen/prerender.js         SSR 渲染注入 dist/index.html
              pagegen/generate-spell-pages.js  生成 124 个技能详情页（含「历史变更」）+ sitemap + llms
```

`spell-history.json` / `spell-history-summaries.json` 是提交进仓库的静态数据，
构建期只读取、不刷新；更新方式见下文「update/ — 手动维护脚本」。

改 `update/` / `pagegen/` 里的脚本后，务必跑一遍 `yarn build` + `yarn verify:hydration`。

## update/ — 手动维护脚本

### `import-spell-history.py` — 技能历史变更数据

从[拂晓国服解包仓库](https://github.com/thewakingsands/ffxiv-datamining-cn)的
`ActionTransient.csv` 历版快照，生成 `data/spell-history.json`：顶层 `versions`
记录版本 → 提交 SHA，`spells[动作 ID]` 记录可还原两侧全文的差异片段。技能详情页的
「历史变更」区块由 `pagegen/spell-page-template.js` 读取该文件渲染。

本脚本**不在** `yarn build` 链里，只在维护历史数据时手动运行。需要 Python 3.8 以上。

```sh
# 在线刷新（默认）：自动读取 patch-* 标签与对应 CSV，网络错误最多重试 3 次
python tools/update/import-spell-history.py

# 离线：使用本地已有的解包仓库（需带 patch-* 标签）
python tools/update/import-spell-history.py /path/to/ffxiv-datamining-cn
```

两种模式都会重建 `data/spell-history.json`。在线模式会重新获取 4.5 之后的全部快照，
原始 CSV 合计约 81 MiB。输出先写同目录临时文件再原子替换，失败时保留原有 JSON。
刷新后：

1. `git diff -- tools/data/spell-history.json` 核对新增或变化的差异；
2. 按动作 ID 和变更版本更新 `data/spell-history-summaries.json`（人工摘要）；
3. `yarn build` 后打开 `/spell/<动作 ID>/` 检查渲染结果。

只调整摘要时无需重跑导入脚本。

## oneoff/ — 手动 / 历史工具

- `make-og-image.mjs`：重新生成 `public/og-image.png` 分享卡
  （先 `npx playwright install chromium`）。
- `bench-party-grouping.ts`：组队分组算法基准（`yarn bench:party`）。
- `parse.js`、`5.15.js`：**历史脚本，当前无法直接运行** —— 输入
  （`gamedata/cn/*.csv`、`Action.csv` 等）不在仓库里。保留用于追溯
  `data/spells.json` 的最初来源；现行数据更新请走 `method_updates.csv`
  + `update/` 管线。

### 获取途径地图数据

- 单条途径可以在 `spells.json` 里添加可选的 `questStart`，例如 `{"npc":"艾洛因","map":"伊修加德基础层","position":[10.1,10.3]}`。接取地点与途径本身的战斗地图分别维护。
- 同名副本共用 `duty-unlocks.json` 的记录，以去除首尾空格后的途径名称查找。`quest` 是开放任务，`questId` 可用于复查游戏数据。需要完成前置剧情后直接对话开放的内容只记录对话对象。副本有多种开放方式时，记录其中一条可行途径。巴哈姆特大迷宫等按章节开放的内容标记该章节的起始任务。
- `mapKey` 指定接取 NPC 所在的实际地图或楼层。任务接取人和坐标取自[国服游戏数据](https://github.com/thewakingsands/ffxiv-datamining-cn/tree/ae29be8b21a32329e3356709422427540bf7e364)，由 Quest 的 Issuer{Start}、Issuer{Location} 关联 ENpcResident、Level 和 Map。开放条件可在[副本前置条件表](https://ff14.huijiwiki.com/wiki/模块:Instance/Preq)复核。
- 狩猎刷新点维护在 `hunt-spawns.json`，每只怪物一条记录。`positions` 中每对数字是一个候选点的游戏内 X、Y 坐标。同怪出现在多个技能中时只需更新一次。A级点位取自 [Scout 的怪物与刷新点对照表](https://github.com/pm-wobbuffet/scout/blob/11ae48b79098d6564c757394ffc9120e815113e0/resources/csv/SPAWN_POINT_MOBS.csv)，按区域、怪物和 valid_mobs 筛选。B、S 级点位取自 [PuniMapper](https://punimapper.ffxivhunts.com/about/)，B 级使用该怪物的专属点和额外点，S 级使用该地区的 S 级候选点。

### FATE 刷新位置

`data/fate-spawns.json` 按途径里的事件名共享记录。`id` 是游戏 Fate 表的行号，`map` 是事件发生地图。`positions[0]` 保存事件中心；有独立来源确认其他候选点时，在数组末尾追加游戏内 `[X, Y]` 并在本节记录出处。地图会一次展示所有位置。不同资料对同一事件中心的取整差异不计作新的刷新点。

本次 26 个事件的身份通过[国服 Fate 表](https://github.com/thewakingsands/ffxiv-datamining-cn/blob/ae29be8b21a32329e3356709422427540bf7e364/Fate.csv)核对，坐标取自 [Teamcraft fates.json 快照](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/blob/cb9eede14f45cd16b4ee229e7a80e624a44c0209/libs/data/src/lib/json/fates.json)。该表每个事件提供一个中心点。本次未确认这些事件有额外的随机位置。

新增事件时，核对游戏 ID 和地图，登记名称、`id`、`map`、`positions: []` 并确认 `map-keys.json` 包含该地图。下载上游 JSON 后运行以下命令。脚本检查途径覆盖和地图编号，只刷新首个位置，保留人工补充的点。日常构建直接读取已提交的结果。

```sh
node tools/update/sync-fate-spawns.js /path/to/fates.json
```
