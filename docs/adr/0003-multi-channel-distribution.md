# 三渠道分发：主域 EdgeOne，备用 Cloudflare 与 GitHub Pages，`base` 改为构建时按渠道传入

站点同时分发在三个地址上，分发的是同一份构建产物：

| 角色 | 渠道 | 地址 | 路径深度 | 构建命令 |
| --- | --- | --- | --- | --- |
| 主 | EdgeOne | `https://bluemagic.badend.cn/` | 根域 | `yarn build` |
| 备用 | Cloudflare | `https://blue-mage.badend.cn/` | 根域 | `yarn build` |
| 备用 | GitHub Pages | `https://blog.badend.cn/blue-mage/` | **子路径** | `yarn build:subpath` |

三个地址内容一致，全部注入
`<link rel="canonical" href="https://bluemagic.badend.cn/" />`（`vite.config.ts` 的
`injectCanonical` 插件），让搜索引擎把两个备用渠道当作主渠道的重复内容而不是三个独立站点。

子路径渠道必须单独构建：`yarn build:subpath` = `vite build --base=/blue-mage/`。

**为什么值得记下来。** 这是 ADR-0002 的直接反转，而且反转的方式很容易被再次误判：

- 根域渠道（主 + Cloudflare）用 `base: "/"`，子路径渠道用 `base: "/blue-mage/"`。
  **同一份源码、两个不同的 `base`**，不存在"正确的那个值"。看到 `vite.config.ts` 里写着
  `base: "/"` 就断定"子路径下会 404、这是个 bug"依然是错的——404 与否取决于**用哪条命令构建**。
- `--base=/blue-mage/` 会把**所有**路径引用一并改写，包括源码里写死的那些：
  HTML 的 js/css/favicon、CSS 里的 `url('/icons/Visible.svg')`（`PartyModal.vue`、
  `SpellList.vue` 共 12 处）、以及 `new Worker("/assets/partyGrouping.worker.*.js")`。
  所以**源码里不需要任何相对路径改写**，这也是没有把那些 `/icons/...` 改成相对路径的原因。
- 反过来，改这些源码为相对路径**会破坏根域渠道**，因为它们正是靠 Vite 的前缀改写才能同时
  服务于两种路径深度。

**`package.json` 里为什么是 `yarn prebuild && ...` 而不是直接 `vue-tsc && vite build`。**
脚本名是 `build:subpath`，yarn 找的 pre 钩子是 `prebuild:subpath`，**不会**触发已有的
`prebuild`。而 `prebuild` 会重新生成 `tools/spells.json` / `method_updates.csv` /
`map-keys.json` 和 `src/App.vue` 的构建日期——GitHub Actions 工作流紧接着就要 commit 这些文件，
漏掉就断链。

**考虑过并否掉的方案：**

- **`base: "./"` 让一份产物通吃所有路径深度。** 实测产物是
  `url(./icons/Visible.svg)`，而这份 CSS 落在 `assets/` 目录下；CSS 里的相对 URL 按
  **样式表自身位置**解析，于是会去找 `/assets/icons/Visible.svg`——但图标在 `/icons/`。
  **根域和子路径都会 404**，等于把 `Visible` / `Invisible` / `palette` 三个遮罩图标一起弄坏。
  Vite 只是把开头的 `/` 换成了 `./`，没有按样式表层级补 `../`。
- **在子路径渠道前面挂反向代理/重写。** GitHub Pages 不提供重写能力，
  等于要把产物搬到别的服务上，失去了这个渠道本身的意义。
- **砍掉子路径渠道。** 保留它是因为 blog 的根域被 Hugo 博客占着，而这条渠道有独立的分发价值。

**遗留。** EdgeOne（主渠道）把不存在的路径一律回退成 SPA 首页并返回 HTTP 200，
所以 `/robots.txt` 和 `/sitemap.xml` 目前都返回 442 字节的 HTML 而不是各自的文件
（即软 404）。需要往 `public/` 里放真实的 `robots.txt` / `sitemap.xml` 才会被覆盖。
