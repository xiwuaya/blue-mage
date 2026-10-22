# SEO 改动记录（result.md）

> 记录人：AI Agent
> 完成日期：2026-10-10
> 提交：`50f21b0` —「三渠道分发，base 按渠道传入并注入 canonical」（第一轮，已部署）
> 　　　`3f2921b` —「构建时预渲染填充 HTML 空壳，并新增 hydration 回归测试」（第二轮，已部署）
> 　　　第三轮（标题 / 描述 / 社交分享卡）待提交
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

## 1. 第一轮：分发层（提交 `50f21b0`，已部署）

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

## 2. 第二轮：预渲染（提交 `3f2921b`，已部署）

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

此处的"待部署生效"已于 2026-10-10 全部复核完毕，结果见下一节。

---

## 4. 上线验证（2026-10-10）

用户手动完成 push 与三渠道部署后的复核结果。

| 渠道 | 页面大小 | 技能条目 | lang | canonical | Teleport | 资源 | 压缩 |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
| **主** EdgeOne `bluemagic.badend.cn` | 222,480 B | **123** | zh-CN | ✅ | ✅ | 3/3 200 | br → 15.1 KB |
| **备用** Cloudflare `blue-mage.badend.cn` | 222,480 B | **123** | zh-CN | ✅ | ✅ | 5/5 200 | br → 15.1 KB |
| **备用** GitHub Pages `blog.badend.cn/blue-mage/` | 222,510 B | **123** | zh-CN | ✅ | ✅ | 3/3 200 | gzip → 18.4 KB |

**结论：三个渠道全部生效。**

- **预渲染生效**：三个渠道的 HTML 里都有 123 个技能条目、11,937 个中文字符
  （改前是 507 字节空壳、零技能条目）。第二轮的验收标准全部达成。
- **R3（压缩）风险解除**：222 KB 的页面实际只传输 15–18 KB，约 93% 压缩率。
- `lang="zh-CN"` 与 canonical（指向主渠道）三处一致。
- **Teleport 紧贴 `<body>`，三处均正确** —— 线上 hydration 的关键前提成立。
- `robots.txt`：三个渠道的应用路径都返回真实的 73 字节文件（不再是 SPA 回退的 HTML）。
- `sitemap.xml`：真实 XML，`<loc>https://bluemagic.badend.cn/</loc>`。
- GitHub Pages 比另外两个大 30 字节，正好是子路径前缀 `/blue-mage` 在两个资源引用上的
  长度差，符合预期。

### 4.1 发现的问题：`blue-mage.badend.cn` 的 DNS 解析

**服务端是好的，但这台机器解析该域名得到的结果是坏的。**

```
本机解析 → CNAME staticdelivery.nexusmods.com → 103.73.220.138
8.8.8.8  → CNAME staticdelivery.nexusmods.com → 104.18.42.54
                        ↑ 两个解析器给的 IP 不一致
```

- 连 `103.73.220.138` 时 TLS 握手直接失败（`schannel: SEC_E_UNTRUSTED_ROOT`，
  证书链根不受信任），加 `-k` 忽略证书也取不到任何内容。
- 用 `--resolve` 固定到 Cloudflare 的 `104.18.42.54` 后，返回 HTTP 200 / 222,480 字节，
  **内容与主渠道完全一致** → **Cloudflare 侧部署无问题**。
- 但该域名在本会话早先能从此机器正常 HTTPS 访问，所以不是"一直如此"。

**无法确定归因**：本机的 DoH 端点（`dns.google`、`cloudflare-dns.com`）均访问不通，
做不了权威查询。两种可能：本地 DNS 污染（CNAME 指向无关域名是典型特征），
或 DNS 记录本身被改动。

**待办：到 DNS 服务商控制台确认 `blue-mage.badend.cn` 的 CNAME 记录。**
若记录正常，则是所在网络的解析问题，换网络即可区分。

### 4.2 本次未复核

- **EdgeOne 软 404**：任意不存在的路径返回 200 + 首页。需要时按 4.3 的命令重测。

### 4.3 可复用的复核命令

```bash
curl -s https://bluemagic.badend.cn/ | grep -o 'class="methods"' | wc -l   # 期望 123
curl -s https://blog.badend.cn/blue-mage/ | grep -o 'class="methods"' | wc -l
curl -sD - -o /dev/null -H "Accept-Encoding: gzip, br" https://bluemagic.badend.cn/ | grep -i content-encoding
```

注意 `grep -c` 数的是**行数**不是匹配数（整页在一行），必须用 `grep -o | wc -l`。

---

## 5. 第三轮：标题、描述与社交分享卡

首轮审计里列出但当时漏做的一项（`index.html` 的 `lang` / canonical / sitemap / robots 做了，
`description` 和 OG 没做）。补上。

| 项 | 改前 | 改后 |
| --- | --- | --- |
| `<title>` | 青魔法来源查询 | **保持不变**（描述性关键词改由 og:title / h1 / description 承载，见 5.1） |
| `meta description` | 无 | 有（含 FF14 / 青魔法师 / 学习地点 / 获取途径等检索词） |
| OG | 无 | `og:type/site_name/locale/title/description/url/image(+width/height/alt)`，`og:title` 为长版本 |
| Twitter Card | 无 | `summary_large_image`，`twitter:title` 为长版本 |
| `<h1>` | **不存在**（层级从 h3 起跳） | `FF14 青魔法师技能学习地点查询`，放在页面底部的页脚（备案 / copyright 位置），12px、`#8a8a8a`，仍是可见文本（见 5.1） |
| 分享图 | 无 | `public/og-image.png`（1200×630） |

**改前实测**（对着线上主渠道产物）：`description` / `og:*` / `twitter:*` / JSON-LD / h1
全部缺失；`<title>` 只有 7 个字。

### 5.1 `<title>` 为什么最终没有改长

一度改成了 `FF14青魔法师技能学习地点查询｜124个青魔法获取途径`，随后按使用者要求改回
「青魔法来源查询」—— 标签页要简洁。

**过程中确认的一条硬约束：标签页和搜索结果里的标题是同一个值，无法分开控制。**
二者都来自 `<title>`；想让它们不同，只能在服务端按 User-Agent 返回不同 HTML，
那正是**标题作弊 / cloaking**，Google Search Essentials 与百度搜索算法规范都明确禁止，
会导致人工处罚。用 JS 在加载后改 `document.title` 也绕不过去 —— Google 渲染 JS，
会看到改后的值，等于两头都输。

**合规的等效做法**：只有 `<title>` 需要短，其余三个位置可以照旧丰富 —
`og:title`（社交卡片，不影响排名）、`h1`（Google 会综合它生成搜索结果标题）、
`description`（搜索结果摘要）。于是关键词从 `<title>` 挪到了这三处。

顺带补上了站点缺失的 `h1` —— 这本来就是独立的 SEO 缺口（改前一个 h1 都没有）。

> **h1 必须是可见文本。** CSS 隐藏的 h1 属于「隐藏文本」，与 cloaking 同属搜索引擎
> 明确禁止的做法，不能用来"既让爬虫看到又不打扰用户"。

**最终摆放：页脚。** 一开始把 h1 放在主内容区顶部（与「当前状态」同一行），但实测
视觉上过于抢眼、与工具的定位不符，改为放到页面底部的 `<footer class="site-footer">`
（备案信息 / copyright 通常所在的位置），并刻意做小做淡：

```css
.site-footer h1 {
  font-size: 0.75rem;   /* 12px */
  font-weight: 400;
  color: #8a8a8a;       /* 在 #2b2b2b 上约 3.9:1 对比度，仍是真实可读文本 */
  letter-spacing: 1px;
}
```

`h1` 的位置对搜索排名没有要求，Google 会综合 `<title>` 与 `<h1>` 生成结果标题 ——
放在页脚不影响它发挥作用。**但绝不能用 `display:none` / `visibility:hidden` /
移出屏幕来"藏"它**，那才是会被判定为隐藏文本的做法；缩小字号、降低对比度不在此列。

### 5.2 分享图是生成的，不是手绘

分享图用 Playwright 按站点自身配色（`#2b2b2b` 底、`#ffbe31` 金、`#eee1c5` 米白，
取自 `src/App.vue:210`）渲染成 1200×630 卡片。图标取自站点自己的
`public/favicon.ico`（金色假面，呼应游戏内的「假面狂欢」）。

生成脚本是 `tools/make-og-image.mjs`，**一次性资产生成，不参与构建**
（CI 设了 `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`，跑不了），产出物直接提交进仓库。
需要重新生成时：`npx playwright install chromium && node tools/make-og-image.mjs`。

> **图标只有 48×48。** 该 .ico 里是 48 / 32 / 16 三档，且全是 BMP 帧（无 PNG 帧），
> 最大 48×48 —— 所以卡片上的图标按 96px 显示（2×），再大就会明显发虚。
> 若要提高分享图质感，得先补一档更大的 favicon。
>
> 早先版本用的是 `src/assets/logo.png`（96×96 的游戏内青魔法书图标），
> 该文件**全项目从未被引用过**，已作为废弃资产删除。

### 5.3 新增一道防过期的构建断言

标题和描述里写死了「124 个青魔法」，而 `tools/spells.json` 由 `prebuild` 自动重新生成 ——
加了技能却忘记改文案，数字就会悄悄过期。`tools/prerender.js` 现在会校验**每一处**出现
（description / og:title / og:description / twitter:title / twitter:description，共 5 处），
对不上就让构建失败，并在错误信息里提示同步重生成 `og-image.png`。

> 这道断言的第一版只校验了首个匹配 —— 用"只改描述、标题保持 124"的场景一测就露馅了：
> 标题的 124 先被匹配到，描述里的错误数字被跳过，静默放行。已改为校验全部出现处。

### 5.4 一处刻意的取舍

所有 meta 标签写成**单行**。不少社交平台的 OG 抓取器是正则解析而非 HTML 解析，
跨行属性会让它们取不到值 —— 这个风险不值得为排版美观承担。

### 5.5 验收

- 根域与子路径两种构建的产物 head 里，12 项 meta 全部存在且取值正确
- `og:image` 是绝对 URL，**不随 `base` 改写**（子路径构建下已验证）
- `public/og-image.png` 正确进入 `dist/`
- **hydration 回归测试仍 20/20 通过** —— 改 `index.html` 没有破坏预渲染
- 数字断言的正反用例都实测过：正常数据通过、篡改数字构建失败（退出码 1）

---

## 6. 第四轮：静态资源长期缓存（2026-10-22）

把「带 content hash 的资源」全部设为一年期 `immutable`，并把 523 个图标
（14 MB）从 `public/` 迁入 Vite 资源管道，让它们也获得 content hash。

### 6.1 改前 / 目标

| 资源 | 改前（EdgeOne / Cloudflare / GH Pages） | 目标 |
| --- | --- | --- |
| `/assets/*.js、css` | immutable / **0** / 600 | 三渠道尽可能 immutable |
| `/icons/**`（14 MB，523 个） | 0 / 0 / 600，**文件名不带 hash，不能 immutable** | 迁入 `/assets/*` 并带 hash |
| `/`（HTML） | 0 / 0 / 600 | 永远回源校验 |
| `favicon.ico`、`og-image.png` | 0 / 0 / 600 | 1 天 |
| `robots.txt`、`sitemap.xml` | 0 / 0 / 600 | 1 小时 |

### 6.2 图标迁入 Vite 资源管道

- `public/icons/` → `src/assets/icons/`（523 个文件）。
- `src/icon.ts` 用 `import.meta.globEager` 建立「文件名 → 带 hash URL」映射；
  新增 `typeIcon()` 给 `Method.vue` / `TypeFilter.vue` 共用。
- `Method.vue` 的 `map.svg` 改为静态 import；两处 CSS 遮罩改用相对
  `url('../assets/icons/*.svg')`，由 Vite 处理并加 hash。
- `vite.config.ts` 增加 `build.assetsInlineLimit: 0`：图标普遍 2–4 KB，
  默认 4 KB 阈值会把相当一部分内联成 base64，既失去缓存又撑大 JS。
- 子路径构建的 SSR 也必须同 base：新增 `prerender:subpath`
  （`vite build --ssr ... --base=/blue-mage/`），否则预渲染出的图标 URL
  会缺少 `/blue-mage` 前缀。

构建后实测：`dist/assets` 共 **532 个文件**（526 个 png/svg），
预渲染 HTML 里 **278 个**图标引用全部形如 `/assets/003253.dc98cd26.png`。

### 6.3 `public/_headers`

Cloudflare Workers Static Assets 会解析 `dist/_headers`（文件本身不对外提供）：

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/ 、/index.html
  Cache-Control: public, max-age=0, must-revalidate
/favicon.ico 、/og-image.png
  Cache-Control: public, max-age=86400
/robots.txt 、/sitemap.xml
  Cache-Control: public, max-age=3600
```

**关键约束：不能写带 `Cache-Control` 的 `/*` 兜底。** Cloudflare 的多条规则是
「合并」而不是覆盖，同名头会用逗号拼接 —— `/*` 的 `max-age=0` 会和
`/assets/*` 的 `immutable` 拼成两个 `max-age`，行为不可靠。

### 6.4 构建期安全网

`tools/prerender.js` 新增 4 条断言，任何一条失败都让构建失败：

1. `dist/assets/` 下每个文件都匹配 `/\.[0-9a-f]{8}\.[a-z0-9]+$/`；
2. `dist/icons` 不存在（防止 `public/icons` 被误留）；
3. `dist/_headers` 存在且含 `/assets/*` + `immutable`；
4. `dist/index.html` 里所有 `/assets/...` 引用都真实存在
   —— 专防 SSR 与客户端构建的 hash 不一致。

负向测试已实测：往 `dist/assets` 放一个 `vendor.js` → 构建失败；
删掉 `dist/_headers` → 构建失败；恢复后通过。

### 6.5 验证

`tools/verify-cache.mjs`（`yarn verify:cache`）分 PASS / INFO / WARN / FAIL：

- **本地**：`_headers` 内容、无 `/*` 兜底、assets 全 hash、`dist/icons` 不存在、
  HTML 引用全部存在。当前 **5 PASS**。
- **线上**（部署前实测）：
  - EdgeOne：HTML 与 `/assets/*` PASS；favicon 仍 0（需控制台配置）→ WARN。
  - Cloudflare：HTML PASS；`/assets/*` 与 favicon 仍 0 → FAIL（等待重新部署）。
  - GitHub Pages：全部 600 → INFO（平台固定，仓库侧无法修改）。
  - 三渠道的图标检查均为 WARN —— 线上还是旧版，尚未部署 hashed 图标。

部署后应变为：Cloudflare 的 `/assets/*`、图标、favicon 全部 PASS；
EdgeOne 仅剩 favicon 一条 WARN；GitHub Pages 保持 INFO。

### 6.6 附带改动

- `.gitattributes` 强制 `public/_headers` 使用 LF。
- `public/.nojekyll`；`deploy` 脚本改为 `gh-pages -d dist --nojekyll`。
- GitHub Actions 部署加 `clean-exclude: assets/`：GitHub Pages 的 HTML 固定缓存
  600s，保留旧 `assets/` 可避免部署后 10 分钟内旧 HTML 请求旧 hash 资源时 404。
- `wrangler.jsonc` 显式 `not_found_handling: "none"`：防止缺失的 hashed 资源被
  SPA 回退成首页、再被 `immutable` 缓存一年。

### 6.7 已知偏差

- **EdgeOne** 的 `/assets/*` 本来就正确；favicon / robots / sitemap 的缓存规则
  只能在控制台配置，仓库侧无法覆盖。
- **GitHub Pages** 不支持自定义响应头，固定 600s。
- **`og-image.png`** 的社交平台抓取缓存不受 `Cache-Control` 控制；
  换图时需改 URL（加 `?v=`），本次未做。

---

## 7. 遗留问题与下一步

按预期收益排序：

1. **124 个技能的独立落地页（`/spell/<编号>`）** —— 目前全站只有一个 URL，
   要同时竞争上百个长尾词。`tools/spells.json` 已是结构化数据，构建时可以按技能生成静态页。
   这是剩余空间里最大的一块。
2. **图片 `alt`** —— 线上实测 504 个 `<img>` 里 **426 个没有 alt**
   （有 alt 的 78 个是地图图标）。这是白丢的图片搜索流量。
   （`<h1>` 已在第三轮补上，见 5.1。）
3. **`spell_ja` / `spell_en` 未利用** —— `tools/spells.json` 里 44 个技能带这两个字段，
   全项目从未渲染。日/英技能名是日英搜索词的直接命中项。
4. **JSON-LD 结构化数据** —— 仍是空白。
5. **~~未 hash 资源的缓存策略~~** —— **已完成（见第 6 节）**：
   图标已迁入 Vite 资源管道并带 content hash，`/assets/*` 统一一年 immutable。
6. **EdgeOne 软 404** —— 任意不存在的路径都返回 200 + 首页，需控制台改回源规则。
7. **提交 sitemap 到各搜索引擎** —— 主渠道 `https://bluemagic.badend.cn/sitemap.xml`。
   Google Search Console、Bing Webmaster、**百度资源平台**（对中文站点最关键）。
   收录不即时，提交后需过几天用 `site:bluemagic.badend.cn` 复核。
8. **`blue-mage.badend.cn` 的 DNS 记录待确认** —— 见 4.1。
9. **Playwright 不参与 CI** —— 当前是手动执行（`yarn verify:hydration`，约 11 秒）。
   要不要并入 CI、以及并进去后如何避免每次都下 150 MB 浏览器，是个独立决定。

---

## 8. 附：本次确立的工程约定

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
