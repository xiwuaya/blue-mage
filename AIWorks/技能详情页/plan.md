# 技能详情页改造计划（plan.md）

> 记录人：AI Agent
> 日期：2026-10-25
> 状态：已全部实施，结果见同目录 [result.md](result.md)
> 提交：`d5a833a`（dev 分支）

---

## 1. 要解决的问题

用户反馈：AI bot（如带联网搜索的助手）访问本站时**拿不到任何技能数据**——

1. 问「寒冰咆哮有什么效果」→ 拿不到。**预期内**：技能描述只在运行时由
   `@thewakingsands/kit-tooltip` 从外部 API 拉取，任何静态资源里都没有。
2. 问「寒冰咆哮的获取途径有哪些」→ 也拿不到。**不符合直觉**：途径数据在
   `tools/spells.json` 里，且上一轮 SEO 改造（见 `AIWorks/SEO/`）的预渲染
   已经把它渲染进了 `dist/index.html`。

### 诊断结论（实施前实测确认）

- 用 GPTBot UA 抓线上 `https://bluemagic.badend.cn/`：HTTP 200，**231 KB 完整 HTML**，
  寒冰咆哮与其 11 条途径确实在 HTML 第 ~64 KB 处，Cloudflare 也没有拦 AI 爬虫。
  → **问题不是数据缺失，而是呈现方式**：
  - 124 个技能挤在一个 231 KB 页面里，AI bot 抓取普遍有截断（几十 KB 或固定
    token 预算），目标技能很容易被截掉；`data-v-*` 属性、内联样式等噪音进一步
    稀释信噪比。
  - **全站只有一个 URL**（`sitemap.xml` 仅 1 条记录），搜索引擎没有任何页面能
    命中「寒冰咆哮 获取途径」这类查询；bot 走「先搜索再抓取」路径时根本到不了本站。
- 约束：**不改变 bot 行为**（不能要求 bot 去读仓库源码或 spells.json），
  只能让网站自身更可达。

---

## 2. 方案选型（关键决策及理由）

### 决策 1：静态技能详情页，而不是 `?search=` 查询参数

讨论中比较过两种形态：维基百科式的独立静态页 vs `/?search=寒冰咆哮` 深链。
选前者，`?search=` 被否决为 bot 方案，理由是三个硬性限制：

1. **静态托管对 query string 不感知**：Cloudflare/EdgeOne 下 `/?search=X` 与 `/`
   返回同一个 231 KB 文件，截断问题原样存在；要按参数改变返回内容只能上
   Worker/SSR，架构复杂度不值。
2. **搜索引擎把 query 参数归一化**：`/?search=X` 被视为 `/` 的变体，
   不会作为独立页面索引，搜索可达性问题依旧。
3. **没有 per-page 的 title / meta description / JSON-LD** 可言。

两者最终**并存、分工**：详情页 = 内容层（给 bot、搜索、分享）；
`?search=` = 交互层（详情页底部「在查询工具中打开」链接，App 读取后填入搜索框）。

### 决策 2：URL 用数字 `action` id，不用中文 slug

`/spell/<action>/`（如 `/spell/11419/`）。中文 slug（`/spell/寒冰咆哮/`）可读性好，
但会 percent-encode、数据改名需迁移重定向；`action` id 永不变化，且与现有
`data-ck-action-id`、外部 API 的键一致。磁盘形态为 `dist/spell/<action>/index.html`，
纯静态托管直接可用。

### 决策 3：描述在构建期落地（打破「描述不存储」的前提）

「效果」问题无法靠呈现方式解决——数据必须先存在于静态资源里。游戏数据静态，
构建期抓一次即可。选 XIVAPI 中文镜像 `xivapi-v2.xivcdn.com`（kit-tooltip 同源），
**带缓存**：已缓存的 id 不再请求，常规构建零网络依赖，只有新增技能才增量抓取。

### 决策 4：详情页是纯内容页，不 hydrate、不带 SPA bundle

交互留在 `/`，内容给 `/spell/*`，各司其职。页面约 5–10 KB，自带内联 CSS，
与主应用 CSS 解耦。跨页互链（主页技能标题 → 详情页、详情页 → 上/下一篇/首页）
保证 bot 顺内链可爬完 124 页。

### 决策 5：base 双适配 + fail-loud 断言

站点在根域（EdgeOne/Cloudflare）与 `/blue-mage/` 子路径（GitHub Pages）两种 base
下部署，生成器从 `dist/index.html` 的资源引用推断 base（与 `tools/prerender.js`
一致）。沿袭本仓库的构建防呆风格：技能名/途径条数/页面数量等断言不过即构建失败，
防止静默产出空壳。

---

## 3. 任务清单（经用户确认的五点）

| # | 任务 | 验收标准 |
| --- | --- | --- |
| 1 | 124 个技能详情页 `/spell/<action>/` | 每页含名称/等级/编号/版本/全部途径+备注、per-page title/meta/canonical/og；构建断言通过 |
| 2 | 构建期抓取描述（带缓存） | 124/124 落盘；缓存完整时构建不发请求 |
| 3 | `sitemap.xml` 改为构建期生成 | 125 条 URL（首页 + 124 详情页），替代仅 1 条的静态文件 |
| 4 | `llms.txt` / `llms-full.txt` | 索引 + 全量纯文本，bot 一抓即得 |
| 5 | 详情页 JSON-LD | FAQPage（「X怎么学？有哪些获取途径？」）+ BreadcrumbList |

配套：主应用每个技能加详情页互链、`?search=` 深链；CI 把描述缓存纳入自动提交。

### 计划外追加（用户验收反馈触发，见 result.md 第 2、3 节）

- **dev 中间件**：详情页是构建产物，`yarn dev` 下点击「详情页」被 SPA fallback
  兜回壳页。为 dev 服务器加按需渲染中间件，与构建共用同一份模板
  （为此把模板抽成 `tools/spell-page-template.js` 共享模块）。
- **描述着色对齐**：kit-tooltip 的颜色来自 API 的 `Description@as(html)` 变换。
  描述缓存升级为 `{ text, html }` 双格式，详情页渲染 html 版本；
  `llms-full.txt` 保持纯文本。

## 4. 非目标

- 不改 bot 行为、不上 Worker/SSR 动态渲染。
- 详情页不做交互、不 hydrate（学习状态标记等留在主应用）。
- 不顺手修既有数据/行为问题：No.109 的「魔力吐息/魔法吐息」名称疑点、
  No.1 水炮因 `notLearnedOnly` 默认开启而不在预渲染列表（均记录进 result.md 交由用户定夺）。

## 5. 风险与对策

| 风险 | 对策 |
| --- | --- |
| API 在 CI 不可达导致构建失败 | 重试 3 次 + 缓存完整时零请求；缓存随 CI 自动提交入库 |
| 模板与主应用渲染逻辑漂移 | `methodText` 注释标注与 `src/lib/spell.ts` 的 `renderSpellMethod` 保持同步 |
| `spells.json` 图标名与构建产物 hash 对不上 | 生成器反查 `dist/assets`，命中数 ≠ 1 即构建失败 |
| 描述 HTML 注入安全 | 全量扫描 124 条：仅 `span`/`br` 两种标签、绿/橙两种内联颜色，条件分支已被 API 解析；与 kit-tooltip 同一信任模型 |
