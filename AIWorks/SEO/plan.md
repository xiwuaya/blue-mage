已经把项目、构建配置、部署链路和线上四个 URL 都摸了一遍。下面是按优先级排的结论。

---

## 先明确现状

这个项目有 **4 个线上地址**在跑同一份东西，而且**其中一个现在是坏的**：

| URL                                           | 状态                                                         |
| --------------------------------------------- | ------------------------------------------------------------ |
| `https://blue-mage.badend.cn/`                | ✅ 正常（Cloudflare，`blue-mage.badend.cn/assets/index.99a295ec.js` → 200） |
| `https://blog.badend.cn/blue-mage/`           | ❌ **白屏**（CI 每次 push 都部署，但资源 404）                |
| `https://thewakingsands.github.io/blue-mage/` | 上游旧版本                                                   |
| `https://guides.xivcdn.com/blue-mage/`        | FFCafe 镜像，`Last-Modified` 停在 2023-12                    |

---

## P0-1 · `blog.badend.cn/blue-mage/` 线上正在白屏

这是我在核查过程中发现的、比 SEO 更急的问题。

`vite.config.ts:8` 的 `base: "/"` 是 [ADR-0002](docs/adr/0002-base-root-path.md) 里有意的决定，但这个决定**只对根域成立**。而 `.github/workflows/publish-to-pages.yml` 仍然把 `dist` 推到 `gh-pages` 分支 —— 那份产物被 GitHub Pages 服务在**子路径** `blog.badend.cn/blue-mage/` 下。

实测：

```
blog.badend.cn/blue-mage/            → 200，HTML 里引用 /assets/index.99a295ec.js
blog.badend.cn/assets/index...js     → 404  (根域是 Hugo 博客，那里没有这个文件)
blog.badend.cn/blue-mage/assets/...  → 200  (文件其实在这儿)
```

`<script type="module">` 404 → `createApp(App).mount("#app")` 永不执行 → 半个字都不显示。ADR 里写的"线上还没重新部署"这个前提**已经过期了**：2026-10-05 那次部署（`8c7c21f`）就是坏的。

**处理**：要么把 workflow 的 gh-pages 部署关掉（既然已经迁到 Cloudflare），要么给它一个能工作的 `base`。现在这个状态比没有还糟 —— 它是一个会被爬虫抓到的、内容为空的重复页。

## P0-2 · 服务端 HTML 是一个空壳，零可索引内容

```
blue-mage.badend.cn/ → 442 字节
  <div id="app"></div>   ← 全部内容都在这里，什么都没有
```

`src/lib/spell.ts:1` 把 `tools/spells.json` 直接 `import` 进 bundle，**124 个技能、408 条途径**全都只活在 420KB 的 JS 里。Google 能渲染 JS 但会延后处理且不稳定；**百度基本跑不动这个 SPA** —— 而对一个全中文的 FF14 工具站来说，百度才是主要入口。

这也是为什么搜 `site:thewakingsands.github.io blue-mage` 一条结果都没有。

**处理**：加构建期预渲染（`vite-plugin-prerender`，或自己写脚本在 `prebuild` 里用 `vue/server-renderer` 把 `App.vue` 渲染成字符串注入 `index.html` —— 正好能塞进你现有的 `tools/` 脚本模式）。

⚠️ 有个坑：`App.vue` 在模块作用域调 `loadSetting()`（读 `localStorage`），SSR 下会直接炸，得先加 `typeof window` 守卫。

## P0-3 · 重复内容没有 canonical

同一份内容散在 4 个域名上，页面里**没有任何 `rel="canonical"`**，权重被摊平。至少要给 `blue-mage.badend.cn` 一个明确的 canonical，并且把 P0-1 的坏地址和 2023 年的 xivcdn 镜像处理掉（301 或下线）。

---

## P1 · 基础 Meta 一条都没有

`index.html` 全文 13 行，除 `title` 外没有任何 SEO 标签：

- **`index.html:2` 是 `lang="en"`** —— 内容是纯中文，应为 `zh-CN`
- 无 `meta description`（搜索结果里现在是一片空白）
- **无 OG / Twitter Card** —— 这个站主要在 NGA、QQ 群、Discord 里传播，没有卡片就是一条干链接，点击率损失很直接
- 无 JSON-LD 结构化数据
- **无 `sitemap.xml`**（`/sitemap.xml` → 404）；`robots.txt` 是 Cloudflare 自动生成的一堆注释，没有 `Sitemap:` 指令
- **`index.html:7` 的 title 是退化的**：现在是「青魔法来源查询」，而线上旧版曾是「青魔法师技能学习指南」。后者含 `青魔法师`/`技能`/`指南` 三个真实搜索词，前者只覆盖一个

推荐 title 方向：`FF14 青魔法师技能学习地点查询 - 124 个青魔法获取途径 | Blue Mage`

## P2 · 内容结构

- **全站没有 `<h1>`** —— 标题层级从 `Title.vue:2` 的 `<h3>` 和 `SpellItem.vue:36` 的 `<h4>` 开始，品牌/主题词从未出现在任何标题里
- **所有 `<img>` 没有 `alt`** —— 技能图标（`src/components/Book.vue:60`、`SpellItem.vue:29`）、类型图标（`src/components/TypeFilter.vue:31`）全是裸 `<img>`，白白丢掉图片搜索流量
- **默认视图是过滤态**：`src/components/SpellList.vue:37` 的 `notLearnedOnly` 默认 `true`，`minUnlearned` 默认 1 —— 预渲染时要按"全部技能"渲染，别把这个默认态固化进静态 HTML
- 搜索框 `<input class="search">` 没有 `<label>`

## P2-2 · 最大的机会：把 124 个技能拆成 124 个落地页

现在**全站只有一个 URL**，要同时去竞争"青魔法 水炮在哪学""FF14 钻头炮怎么得""青魔 假面狂欢 技能"等等上百个长尾词。

而 `tools/spells.json` 里每个技能都已经是结构化的（技能名、编号、等级、版本、408 条途径含地图/怪物/副本名）。**在构建时按技能生成静态页**，每个页面天然就是一篇"XX 技能获取攻略"，这是这个项目 SEO 天花板最高的地方。

对比竞品，这块是被验证过的：`eorzeantavern.com/blue-mage-spells/` 就是靠"每个技能一个锚点+独立描述"覆盖英文搜索的。

## P3 · 性能

- **带 content-hash 的静态资源没有长缓存**：`/assets/index.99a295ec.js` 和所有图标返回的都是 `Cache-Control: public, max-age=0, must-revalidate`。哈希文件名本来就是为 `max-age=31536000, immutable` 设计的，现在每次访问都要重新校验
- 单 JS chunk 420KB（Leaflet + eorzea-interactive-map 全打进主包），`MapModal` 可以懒加载拆出去
- `dist/` 15MB，主要是 124×2 张技能 PNG

---

## 建议的动手顺序

1. **今天**：修 `blog.badend.cn/blue-mage/` 白屏（关掉 gh-pages 部署，或按子路径重新构建）
2. **这周**：`index.html` 补 `lang="zh-CN"` + description + OG + canonical；加 `sitemap.xml` 和 robots 的 `Sitemap:` 指令
3. **然后**：预渲染让 HTML 里带上技能列表 —— 这一步做完，前面的 meta 才有意义
4. **再然后**：给 124 个技能生成独立静态页
5. **同步做**：把 sitemap 提交到 Google Search Console / Bing / **百度资源平台**；NGA 上现有的推荐帖指向的是上游 `thewakingsands.github.io`，迁移域名时要处理好这个权重继承

---

**Sources:**
- [NGA 导航站推荐帖（推荐了 blue-mage 站点）](https://ngabbs.com/read.php?tid=39649000)
- [NGA 青魔技能习得途径](https://ngabbs.com/read.php?tid=16170790)
- [FFXIV Blue Mage Spell Database（英文竞品）](https://eorzeantavern.com/blue-mage-spells/)
- [FFXIV Collect](https://ffxivcollect.com/spells)
- [青魔法学习记录工具（日文竞品）](https://ffxiv.ariya.jp/bluemage/)

要不要我把这份清单整理成一个带勾选状态的页面，方便你按顺序推进？