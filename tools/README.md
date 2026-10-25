# tools/ 目录导航

构建期脚本与数据。按「数据 → 更新脚本 → 页面生成 → 验证 → 手动工具」分层，
`package.json` 的 scripts 与 `.github/workflows` 引用的路径均已对应到这里。

## 目录结构

| 目录 | 内容 | 何时运行 |
| --- | --- | --- |
| `data/` | 全部数据文件（源数据 + 构建期生成） | — |
| `update/` | prebuild 数据更新脚本 | 每次 `yarn build` 自动执行 |
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
| `descriptions.json` | **自动生成 + 缓存**：`update/update-descriptions.js` 抓取的官方描述（text + html 双格式） | `pagegen/generate-spell-pages.js`（详情页用 html、llms 用 text） |

## 自动化链路

```
yarn build
├─ prebuild   update/update-date.js        改 App.vue 更新日期
│             update/update-methods.js     应用 method_updates.csv 增量
│             update/update-map-keys.js    反查 XIVAPI 生成 map-keys.json
│             update/update-descriptions.js 增量抓取描述（缓存完整时零请求）
├─ vue-tsc → vite build
└─ prerender  pagegen/prerender.js         SSR 渲染注入 dist/index.html
              pagegen/generate-spell-pages.js  生成 124 个技能详情页 + sitemap + llms
```

改 `update/` / `pagegen/` 里的脚本后，务必跑一遍 `yarn build` + `yarn verify:hydration`。

## oneoff/ — 手动 / 历史工具

- `make-og-image.mjs`：重新生成 `public/og-image.png` 分享卡
  （先 `npx playwright install chromium`）。
- `bench-party-grouping.ts`：组队分组算法基准（`yarn bench:party`）。
- `parse.js`、`5.15.js`：**历史脚本，当前无法直接运行** —— 输入
  （`gamedata/cn/*.csv`、`Action.csv` 等）不在仓库里。保留用于追溯
  `data/spells.json` 的最初来源；现行数据更新请走 `method_updates.csv`
  + `update/` 管线。
