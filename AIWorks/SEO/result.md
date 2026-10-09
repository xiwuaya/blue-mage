# SEO 改动记录（result.md）

> 记录人：AI Agent
> 完成日期：2026-10-10
> 提交：`50f21b0` —「三渠道分发，base 按渠道传入并注入 canonical」（第一轮，已推送）
> 　　　第二轮（预渲染）待提交
> 配套文档：`docs/adr/0002-base-root-path.md`、`0003-multi-channel-distribution.md`、
> 　　　　　`0004-build-time-prerender.md`

---

## 0. 起点：站点对搜索引擎几乎不存在

调查时的实测状态：

| 现象 | 证据 |
| --- | --- |
| 服务端 HTML 是空壳 | 442 字节，`<body><div id="app"></div></body>`，124 个技能全在 410 KB 的 JS 里 |
| 未被收录 | `site:thewakingsands.github.io blue-mage` 返回零结果 |
| 同一份内容散在 4 个域名 | 无 canonical，权重被摊平 |
| 其中一个是坏的 | `blog.badend.cn/blue-mage/` 因 `base: "/"` 与子路径部署冲突，资源 404、整页白屏 |
| 基础 meta 全缺 | 无 description、无 OG/Twitter、无 JSON-LD、无 sitemap、`lang="en"` 而内容是纯中文 |

站点在 NGA 上是有真实推荐流量的（[导航站推荐帖](https://ngabbs.com/read.php?tid=39649000) 里
被评价为"比游戏内青魔法书更好用"），所以问题不是没人用，而是**搜索引擎看不见它**。

---

## 1. 第一轮：分发层（提交 `50f21b0`，已推送）

### 1.1 做了什么

把"一份源码"正确地分发到三个地址，并让搜索引擎知道谁是主渠道：

| 角色 | 渠道 | 地址 | 路径深度 | 构建命令 |
| --- | --- | --- | --- | --- |
| 主 | EdgeOne | `https://bluemagic.badend.cn/` | 根域 | `yarn build` |
| 备用 | Cloudflare | `https://blue-mage.badend.cn/` | 根域 | `yarn build` |
| 备用 | GitHub Pages | `https://blog.badend.cn/blue-mage/` | **子路径** | `yarn build:subpath` |

- `--base` 参数化：子路径渠道用 `vite build --base=/blue-mage/`。
  实测 Vite 会把 HTML 引用、CSS 里 12 处 `url('/icons/*.svg')` 和
  `new Worker('/assets/...')` **一并改写**，源码无需任何相对路径改造。
- 三个地址都注入 `<link rel="canonical" href="https://bluemagic.badend.cn/" />`。
- 新增 `public/robots.txt` 与 `public/sitemap.xml`
  （覆盖 EdgeOne 的 SPA fallback 软 404）。
- `index.html` 的 `lang="en"` → `zh-CN`。
- 堵住两个会重演白屏的入口：`deploy` 脚本改为先跑子路径构建；
  `dist/` 默认回填根域构建（Cloudflare 的 `wrangler.jsonc` 直接读 `./dist`）。

### 1.2 文件

| 文件 | 改动 |
| --- | --- |
| `vite.config.ts` | 新增 `injectCanonical()` 插件 |
| `package.json` | 新增 `build:subpath`；`deploy` 改为先构建再推 |
| `.github/workflows/publish-to-pages.yml` | `yarn build` → `yarn build:subpath` |
| `public/robots.txt`、`public/sitemap.xml` | 新增 |
| `README.md` | 分发渠道表改为三渠道 |
| `docs/adr/0003-*.md` | 新增；`0002` 标注被修订 |

### 1.3 验收

- 子路径渠道白屏修复**已上线验证**：`blog.badend.cn/blue-mage/` 全部资源 200，
  CSS 遮罩图标指向 `/blue-mage/icons/*.svg`，canonical 正确。
- 两种 base 的资源路径逐一探测均 200。

**遗留（未做）**：EdgeOne 对**任意**不存在的路径都返回 200 + 首页（真正的软 404），
需要控制台侧改回源规则，不在仓库范围内。

---

## 2. 第二轮：预渲染（待提交）

### 2.1 做了什么

用 `@vue/server-renderer` 在构建时把 App 渲染成 HTML 注入 `dist/index.html`，
客户端 `createSSRApp().mount()` 做 hydration。

| 指标 | 改前 | 改后 |
| --- | ---: | ---: |
| `dist/index.html` | 507 B | **222,480 B**（gzip 17.3 KB） |
| HTML 里的技能条目 | 0 | **123** |
| 可索引中文字符 | 个位数 | **11,937**（982 个不重复字形） |
| 首屏 JS | 420 KB 单包 | **243 KB**（地图库拆成 167 KB 懒加载 chunk） |
| 构建耗时 | ~5.2 s | ~5.7 s（SSR 构建 + 渲染合计约 0.5 s） |

**为什么是 123 而不是 124**：`src/lib/useSpellSync.ts:17` 在无存档时把
`spellStatus[0] = 1`（1 号「水炮」默认已掌握），而默认 `mode` 是 `notLearned`。
这是刻意的业务默认，预渲染结果与真实浏览器首屏**完全一致** —— 正是 hydration 需要的性质。
（Playwright 场景 3 反向印证了这点：显式存档为"全部未掌握"时是 124 条。）

### 2.2 文件

| 文件 | 行数 | 作用 |
| --- | ---: | --- |
| `src/entry-server.ts` | 16 | 新增。只导出 `createApp()`，不挂载、不碰浏览器 API |
| `src/entry-client.ts` | 8 | 由 `src/main.ts` 改名；`createApp` → `createSSRApp` |
| `tools/prerender.js` | 105 | 新增。渲染 + 注入 `dist/index.html`，带三重断言 |
| `tools/verify-hydration.mjs` | 209 | 新增。Playwright 回归测试，自带预览服务器 |
| `docs/adr/0004-*.md` | 82 | 新增。记录四条代码里看不出来的约束 |

| 文件 | 改动 |
| --- | --- |
| `index.html` | 抽出 `<!--teleport-html-->` / `<!--app-html-->` 两个占位符；`lang="zh-CN"` |
| `src/lib/setting.ts` | `loadSetting`/`saveSetting` 开头加 `typeof window === "undefined"` 守卫 |
| `src/App.vue` | `MapModal` 改 `defineAsyncComponent`；帮助弹窗判定从 `onBeforeMount` 挪到 `onMounted` |
| `src/lib/map.ts`、`src/components/MapModal.vue` | 地图库改为**函数内动态 import** |
| `vite.config.ts` | 新增 `ssr.external` 与 `stripPrerenderPlaceholders()` |
| `package.json` | 新增 `prerender` / `verify:hydration`；两个 build 脚本串上 prerender；新增 devDep `playwright` |
| `.github/workflows/publish-to-pages.yml` | 加 `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`（CI 不跑浏览器测试，避免每次多下 150 MB） |

### 2.3 三条会崩的链（实测，全部已切断）

| 链 | 入口 | 处理 |
| --- | --- | --- |
| `setting.ts` 的裸 `localStorage` / `document.cookie` | `useSpellSync.ts:8-50` **模块顶层**调用 → `App.vue:13` import 即崩 | 函数内 `typeof window` 守卫 |
| `@thewakingsands/kit-tooltip` 顶层 `document.createElement` | 仅 `main.ts:3,7` | 入口拆分后自然切断 |
| `@thewakingsands/eorzea-interactive-map` 顶层 `window` | 仅 `MapModal.vue` 与 `lib/map.ts` | `defineAsyncComponent` + `ssr.external` + **函数内动态 import** |

### 2.4 实施中推翻的两个判断

**① `defineAsyncComponent` 单独不够（计划里低估了）。**
Vite 2.9 在 `vite build --ssr <entry>` 时设 `inlineDynamicImports: true`，
动态 import 会被内联进单文件。所以 MapModal 在 SSR 产物里仍被内联，
它和 `lib/map.ts` 里对地图库的**静态 import** 于是变成急切求值的顶层 `require`
（实测产物第 12 行），加载即抛 `window is not defined`。
必须把这两处改成**函数内动态 import**。

**② Teleport 内容必须手动注入且紧贴 `<body>`（计划里标为"暂时无需处理"，是错的）。**
`hydrateTeleport` 从 `target._lpa || target.firstChild` 起步
（`@vue/runtime-core/dist/runtime-core.esm-bundler.js:6569`），失配走 `handleMismatch`，
后者是 **`remove(node)` + 重新 patch**（同文件 `:4950`）——
**是删节点，不是打补丁**。两个 `to="body"` 的 Teleport 若找不到
`<!--teleport anchor-->` 串起的 `_lpa` 链，第二个会退回 `body.firstChild`，
**可能把 `<div id="app">` 本身删掉**。

### 2.5 验收

**A. 构建期断言**（`tools/prerender.js` 内置，失败即构建失败）

- 占位符缺失 → 抛错，而不是 `String.replace` 静默 no-op 产出空壳
- 技能条目 < 100 → 抛错（`tools/spells.json` 会被 prebuild 重生成，故卡下限而非等值）
- Teleport 内容未紧贴 `<body>` → 抛错
- SSR 产物里出现 `YZWF`（地图库 UMD 全局名）→ 说明 `ssr.external` 失效

**B. 两种 base 均构建通过**，资源引用、canonical、预渲染三者共存正确。

**C. 真实浏览器验收**：`yarn build && yarn verify:hydration`，**20 项全部通过**：

| 场景 | 关键结果 |
| --- | --- |
| 全新访客（localStorage 全空） | `#app` 仍是 1 个元素子节点（未被 `handleMismatch` 删掉）、123 条技能、帮助弹窗正常出现、**hydration 零警告零 mismatch** |
| 老用户（已存档进度 + 等级 30 + 关掉三种类型） | `#app` 完好、列表正确过滤到 20 条、不弹帮助弹窗、**只有一条预期内的** `Hydration completed but contains mismatches.`、无任何未捕获异常 |
| 交互 | 搜索收敛、勾选生效、**78 个地图图标**、地图弹窗懒加载 chunk 按需拉起（`MapModal.js` + `MapModal.css` + `map.js`）、地图容器渲染可见 |

第一项是老用户场景里最关键的断言 —— 计划阶段判定"Teleport 注入位置不对会删掉 `#app`"，
实测确认注入正确、容器完好。

**D. 关于 hydration 不一致**：这是**有意接受**的设计（见 ADR-0004）。
服务端只能按"全新访客"状态出 HTML，而老用户的 localStorage 状态不同。
数据表明代价可控：全新访客零警告，老用户只在由本地配置派生的列表区域出现一次 mismatch。
若要彻底消除，需引入 cookie 分叉渲染，明确不在本次范围。

---

## 3. 验收汇总

| 项 | 状态 |
| --- | --- |
| 子路径渠道白屏 | ✅ 已上线修复（`50f21b0`） |
| 三渠道 canonical 收敛 | ✅ 已上线 |
| robots.txt / sitemap.xml | ✅ 已在仓库，待主渠道重新部署生效 |
| 服务端 HTML 空壳 | ✅ 已修复（待部署） |
| hydration 正确性 | ✅ 真实浏览器 20 项通过 |
| 两种 base 构建 | ✅ 通过 |

**部署后需要复核**（三个域名都要查）：

```bash
curl -s https://bluemagic.badend.cn/ | grep -c 'class="methods"'      # ≈123
curl -s https://blog.badend.cn/blue-mage/ | grep -c 'class="methods"' # ≈123
curl -sI -H "Accept-Encoding: gzip" https://bluemagic.badend.cn/ | grep -i content-encoding
```

最后一条别省略：HTML 从 507 字节涨到 222 KB raw，**三个渠道都必须开 compress**，
否则首屏字节量涨约 440 倍。EdgeOne / Cloudflare / GitHub Pages 默认都开，但要实测确认。

---

## 4. 遗留问题与下一步

按预期收益排序：

1. **124 个技能的独立落地页（`/spell/<编号>`）** —— 目前全站只有一个 URL，
   要同时竞争上百个长尾词。`tools/spells.json` 已是结构化数据，构建时可以按技能生成静态页。
   这是剩余空间里最大的一块。
2. **`meta description`** —— 搜索结果里的摘要目前是空白。预渲染解决了"能读到内容"，
   但摘要文本仍需显式声明。
3. **`spell_ja` / `spell_en` 未利用** —— `tools/spells.json` 里 44 个技能带这两个字段，
   全项目从未渲染。日/英技能名是日英搜索词的直接命中项，本次因"不动 UI"未做。
4. **EdgeOne 软 404** —— 任意不存在的路径都返回 200 + 首页，需控制台改回源规则。
5. **Playwright 不参与 CI** —— 当前是手动执行（`yarn verify:hydration`，约 11 秒）。
   要不要并入 CI、以及并进去后如何避免每次都下 150 MB 浏览器，是个独立决定。

---

## 5. 附：本次确立的工程约定

- **预渲染相关约束集中在 `docs/adr/0004`**。改 `index.html` 的占位符、
  `vite.config.ts` 的 `ssr.external`、地图库的 import 位置之前，先读它。
- **改动 hydration 相关代码后跑 `yarn verify:hydration`**。静态检查（`vue-tsc`、构建断言）
  发现不了 `handleMismatch` 删容器那类失败模式。
- **构建失败的方向要正确**：`ssr.external` 漏配时构建会失败而不是上线空壳，
  这是刻意的 —— 看到 `window is not defined` 不要顺手把配置删掉。

### 回滚路径（三层递进）

1. **一键停用预渲染**：从 `package.json` 两个 build 脚本里删掉 `&& yarn prerender`。
   产物回到加预渲染之前的状态。
2. **`git revert`**：改动面全是新增或局部，无业务逻辑纠缠。
3. **单点降级地图部分**：把 `MapModal` 换回静态 import 时，
   **必须同步删掉 `vite.config.ts` 里 `ssr.external` 的地图库那一项**，
   否则是"静态 import + external = 顶层 require = 加载即崩"。
