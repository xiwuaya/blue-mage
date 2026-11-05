# 技能详情页改造记录（result.md）

> 记录人：AI Agent
> 完成日期：2026-10-25
> 提交：`d5a833a` —「feat(seo): 技能详情页 + 构建期描述抓取 + llms.txt，让 bot 可拿到数据」
> 　　　（10 文件，+1184 / -17，dev 分支，记录时未推送）
> 配套文档：同目录 [plan.md](plan.md)（方案选型与决策理由）
> 上游依赖：本轮建立在 `AIWorks/SEO/` 三轮改造（预渲染、meta、缓存）之上

---

## 0. 起点

| 问题 | 实测证据 |
| --- | --- |
| bot 问「寒冰咆哮有什么效果」拿不到 | 描述只在运行时由 kit-tooltip 拉取，静态资源里没有 |
| bot 问「获取途径」也拿不到 | 数据其实在预渲染 HTML 里（231 KB / 124 技能），但单页过大被 bot 截断、信噪比差 |
| 搜索引擎无法命中单个技能 | 全站仅 1 个 URL，`sitemap.xml` 仅 1 条记录，无 per-page meta |
| Cloudflare 拦截 / robots 限制 | 已排除：GPTBot UA 实测 200 全量内容，robots.txt 全放行 |

目标：**不改 bot 行为**的前提下，让每个技能有一个可直接命中的小页面 +
一份无噪音的全量纯文本数据。

---

## 1. 第一轮：五点方案落地（plan.md 第 3 节任务 1–5）

### 1.1 产物清单

| 产物 | 说明 |
| --- | --- |
| `dist/spell/<action>/index.html` × 124 | 每页 ~7.5 KB：面包屑、图标（反查构建产物 hash 文件名）、No./等级/版本、效果描述、全部获取途径（类型徽标 + 颜色 + 攻略备注）、上/下一篇、`?search=` 深链回主应用；per-page title / meta description / canonical / og / JSON-LD；**无 JS、不 hydrate** |
| `dist/sitemap.xml` | 125 条 URL（首页 + 124 详情页），带 `lastmod`，构建期生成 |
| `dist/llms.txt` | llmstxt 约定索引：站点说明 + 124 个详情页链接 |
| `dist/llms-full.txt` | 80.7 KB 纯 Markdown 全量数据：效果（纯文本）+ 途径 + 备注，一抓即得 |
| `tools/descriptions.json` | 124 条描述缓存（提交入库，CI 自动维护） |

### 1.2 文件改动

| 文件 | 改动 |
| --- | --- |
| `tools/update-descriptions.js` | **新增**。构建期从 `xivapi-v2.xivcdn.com`（kit-tooltip 同源）抓取描述；带缓存，缓存完整时零网络请求；失败重试 3 次后中止构建（fail-loud）；API 名称与数据表不一致时警告不阻断 |
| `tools/generate-spell-pages.js` | **新增**。prerender 之后运行：从 `dist/index.html` 推断部署 base（根域 `/` 或子路径 `/blue-mage/`），生成 124 个详情页 + sitemap + llms；内置断言（技能名进页、途径条数一致、页面总数一致、图标 hash 唯一命中） |
| `tools/spell-page-template.js` | **新增**（第二轮抽出）。详情页 HTML 模板纯函数模块，构建脚本与 dev 中间件共用；`methodText` 与 `src/lib/spell.ts` 的 `renderSpellMethod` 格式保持同步（注释互相指认） |
| `package.json` | `prebuild` 追加 `update-descriptions.js`；`prerender` / `prerender:subpath` 追加 `generate-spell-pages.js` |
| `src/components/SpellItem.vue` | 技能标题加金色「详情页」链接（`import.meta.env.BASE_URL` 感知，两种 base 都正确） |
| `src/App.vue` | `onMounted` 读 `?search=` 填入搜索框（挂 onMounted 是为避免 hydration 不一致；该文件同时含 prebuild 自动改的日期行） |
| `public/sitemap.xml` | **删除**（改为构建期生成到 `dist/`） |
| `.github/workflows/publish-to-pages.yml` | Commit 步骤加入 `tools/descriptions.json`（新技能的描述抓取结果随 CI 入库） |
| `vite.config.ts` | 第二轮新增 `spellPagesInDev` 中间件（见第 2 节） |

### 1.3 关键数字

| 指标 | 改前 | 改后 |
| --- | --- | --- |
| bot 回答「寒冰咆哮获取途径」需抓取 | 231 KB 单页（寒冰咆哮在第 ~64 KB 处） | **10 KB 专页**（含效果 + 14 条途径 + 备注） |
| 可命中「单个技能」查询的页面 | 0 | 124 |
| sitemap URL | 1 | 125 |
| 「效果」数据的存放位置 | 仅运行时 API | 详情页 HTML + llms-full.txt（构建期落盘） |

---

## 2. 第二轮：dev 下点击「详情页」不跳转（用户反馈修复）

**根因**：详情页是构建产物，`yarn dev` 下不存在；Vite 把 `/spell/<id>/` 当 SPA
路由回退到 index.html 壳页（实测 dev 返回 3,436 B 壳页），点击等于原地重载列表。
`yarn preview`（构建产物）实测本来就正常——问题仅存在于 dev。

**修复**：

- 模板从 `generate-spell-pages.js` 抽成共享模块 `tools/spell-page-template.js`。
- `vite.config.ts` 新增 `spellPagesInDev` 中间件（`apply: "serve"`）：
  dev 下按需渲染 `/spell/<id>/`，数据（spells.json / descriptions.json）每次请求现读，
  dev 中改数据刷新即可见；图标指 `/src/` 源文件；未知 id 返回 404；其余路径不受影响。

**验证**（重构后重建，产物与重构前 **md5 逐字节一致** `381b791f…`）：

```
dev  /spell/11419/        → 200, 10,017 B（含尾斜杠与无尾斜杠两种形式）
dev  /spell/99999/        → 404
dev  /src/assets/icons/spells/072237.png → 200
dev  /                    → 200, 3,436 B（SPA 壳页，不受影响）
preview /spell/11419(+/)  → 200, 10,155 B
```

---

## 3. 第三轮：专页描述着色与 kit-tooltip 对齐（用户反馈）

**根因**：颜色不是 kit-tooltip 自己做的——它请求描述用 `transient=[Description@as(html)]`，
**API 服务端**把游戏标记转成带内联颜色的 HTML（绿色 `rgba(0,204,34,1)` 用于
「威力：」「追加效果：」「持续时间：」等标签文字，橙色 `rgba(255,123,26,1)` 用于
「止步」等状态名），kit-tooltip 再 `dangerouslySetInnerHTML` 渲染。
此前缓存的是纯文本变体（`transient.Description`），自然单色。

**改动**：

- `update-descriptions.js` 一次请求同时抓两种格式，缓存升级为
  `{ text, html }`；旧格式条目自动视为缺失并重抓（124 条已全部迁移）。
- 模板的「效果」栏改为渲染 html 版本；`llms-full.txt` 继续用纯文本版（对 bot 零噪音）。
- dev 中间件同步对齐（`loadSpellContext` 返回 `descriptionHtml`）。

**安全性确认**：全量扫描 124 条 html——仅 `span`/`br` 两种标签、绿/橙两种内联颜色；
白骑士之旅等职业条件分支已被服务端解析成纯文本。无需额外 CSS 或清洗，
与 kit-tooltip 同一信任模型。

---

## 4. 验证汇总

| 项 | 结果 |
| --- | --- |
| `yarn build`（typecheck + vite + prerender + 页面生成） | ✅ 通过（prerender 123 条目为既有基线，见 5.2） |
| 模板重构后重建 | ✅ `dist/spell/11419/index.html` md5 与重构前一致 |
| `yarn verify:hydration` | ✅ 21/21 通过（两轮改动后各跑一次） |
| 描述抓取 | ✅ 124/124，text + html 双格式，无空条目 |
| 构建产物 `spell/11419` | ✅ 7,540 B，含 3 个绿色 span + `<br>`，14 条途径、JSON-LD（FAQPage + BreadcrumbList）、canonical/per-page meta |
| 构建产物 `spell/18310`（白骑士之旅） | ✅ 橙色状态名 + 已解析的条件分支 |
| `llms-full.txt` | ✅ 无任何 HTML 标签，纯文本 |
| 本地静态服务器模拟 bot 抓取 | ✅ 详情页 / llms.txt / sitemap.xml / 图标全部 200 |

---

## 5. 已知问题与偏差（review 重点）

1. **No.109 名称疑点（未处理，需用户定夺）**：抓取时 API 返回「魔法吐息」，
   `tools/spells.json` 写的是「魔力吐息」。脚本按设计打了警告未阻断；
   若数据表有误应改 CSV/JSON 后重跑。
2. **No.1 水炮不在预渲染列表里（既有行为，非本次引入）**：
   `SpellList.vue:37` 的 `notLearnedOnly` 默认 `true`，且水炮默认标记已掌握
   （`useSpellSync.ts` 初始化 `spellStatus[0] = 1`），预渲染默认走"未掌握"视图。
   后果：主列表渲染 123 个技能、123 条「详情页」内链，而 sitemap 有 124 页——
   水炮的详情页只能经 sitemap / llms.txt 发现，主列表无入口。详情页本身覆盖完整 124。
3. **CI 部署渠道**：本次提交只推动 GitHub Pages（`build:subpath`）自动部署；
   EdgeOne / Cloudflare 若为手动或独立构建，需各自重新构建部署才能拿到详情页。
4. **dev 下 canonical / og 为相对路径**：dev 无域名，属设计内行为；
   正式构建恒为绝对地址 `https://bluemagic.badend.cn/...`。
5. **API 可用性**：仅当新增技能且本地无缓存时构建才请求 API；
   此时若 API 不可达，构建按设计失败（重试 3 次后中止），属 fail-loud 取舍。

---

## 6. 复核命令（review / 回归用）

```bash
yarn build                      # 全链路：prebuild → typecheck → vite → prerender → 页面生成
yarn verify:hydration           # Playwright 回归（~12s）
ls dist/spell | wc -l           # 期望 124
grep -o 'rgba(0,204,34,1)' dist/spell/11419/index.html | wc -l   # 期望 3（绿色标签文字）
python -c "print('<span' in open('dist/llms-full.txt',encoding='utf-8').read())"  # 期望 False
# 部署后线上复核：
curl -s https://bluemagic.badend.cn/spell/11419/ | grep -o '<title>[^<]*</title>'
curl -s https://bluemagic.badend.cn/llms.txt | head -6
curl -s https://bluemagic.badend.cn/sitemap.xml | grep -c '<loc>'  # 期望 125
```

回滚：单次提交 `d5a833a`，`git revert` 即可整体退回；
`public/sitemap.xml` 会随之恢复，无需其他清理。

---

## 7. 遗留与下一步

1. **推送 `dev` 并部署**：验证线上三渠道（EdgeOne / Cloudflare / GitHub Pages）
   的 `/spell/<id>/`、`sitemap.xml`、`llms.txt` 均可访问（用第 6 节命令）。
2. **向搜索引擎提交新 sitemap**：Google Search Console / Bing / 百度资源平台；
   收录非即时，之后用 `site:bluemagic.badend.cn` 复核详情页收录情况。
3. **No.109 名称核对**（见 5.1）。
4. **水炮列表入口**：若希望主列表也链到水炮详情页，需调整 `notLearnedOnly`
   默认行为或预渲染策略——属产品决策，未纳入本次范围。
5. **`spell_ja` / `spell_en` 利用**（承接 SEO result.md 遗留项 3）：
   详情页可补多语言别名行，覆盖日/英搜索词；数据已在 `tools/spells.json`（44 个技能带字段）。
