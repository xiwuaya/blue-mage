# 静态资源缓存：只有 content-hash 的资源才 immutable，图标迁入 Vite 资源管道

`public/_headers` 给 Cloudflare Workers Static Assets 配置响应头：

| 资源 | Cache-Control |
| --- | --- |
| `/assets/*` | `public, max-age=31536000, immutable` |
| `/`、`/index.html` | `public, max-age=0, must-revalidate` |
| `/favicon.ico`、`/og-image.png` | `public, max-age=86400` |
| `/robots.txt`、`/sitemap.xml` | `public, max-age=3600` |

**为什么值得记下来。** 这套配置里有几条约束在代码里完全看不出来，
每一条被「顺手清理」掉都会造成长期故障：

- **`_headers` 里绝对不能出现带 `Cache-Control` 的 `/*` 兜底规则。**
  Cloudflare 的多条规则是**合并**而不是覆盖，同名头会用逗号拼接。
  `/*` 的 `max-age=0` 会和 `/assets/*` 的 `immutable` 拼成
  `public, max-age=0, must-revalidate, public, max-age=31536000, immutable`，
  两个 `max-age` 同时存在，浏览器行为不可靠。
  构建期与 `yarn verify:cache` 都会检查这一点。
- **`/assets/*` 下必须永远只有带 8 位 content hash 的文件。**
  `immutable` 的含义是「一年内不再回源」，文件名不变就无法失效。
  `tools/prerender.js` 会逐个校验 `dist/assets/` 的文件名，
  出现任何未 hash 的文件就让构建失败。
- **`vite.config.ts` 的 `build.assetsInlineLimit: 0` 不能删。**
  图标普遍只有 2–4 KB，默认的 4 KB 阈值会把相当一部分图标内联成 base64
  塞进 JS —— 既失去独立 URL 和缓存，又把首屏 bundle 撑大。
- **子路径构建的 SSR 必须使用相同的 `base`。**
  `package.json` 里 `build:subpath` 调 `prerender:subpath`，后者给
  `vite build --ssr` 也传 `--base=/blue-mage/`。漏了的话，预渲染出的图标
  URL 缺少 `/blue-mage` 前缀，GitHub Pages 渠道整站图标 404。

**为什么要把图标从 `public/` 迁到 `src/assets/`。**
`public/` 下的文件会被原样复制，Vite 命中 `checkPublicFile` 时只拼 `base`，
**永远不加 hash**。图标的引用又是运行时拼接的
（`src/icon.ts` 的 `icons/spells/${s.icon}`、`Method.vue` 的 `icons/type_${type}.png`），
Vite 的 `assetFileNames` / `manifest` 都帮不上忙。
做法是把 523 个文件迁到 `src/assets/icons/`，用 `import.meta.globEager`
在构建期展开成「文件名 → 带 hash URL」的静态映射：

```ts
const spellIconModules = import.meta.globEager<{ default: string }>(
  "./assets/icons/spells/*.png"
);
```

注意路径是 `./assets/...` 而不是 `../assets/...` —— `src/icon.ts` 与
`src/assets` 同级。写错时 glob 会**静默匹配到 0 个文件**（构建不报错，
只是图标全部为空），所以构建期断言 4 会兜住。

**为什么 SSR 与客户端的 hash 一定一致。**
Vite 2.9 的 `fileToBuiltUrl()` 用 `sha256(文件内容).slice(0, 8)` 生成 hash，
与构建类型无关；SSR 构建在 `generateBundle` 里只是**删除** asset 产物
（"do not emit assets for SSR build"），但 URL 已按同一个 `assetFileNames`
规则算好并写入代码。所以预渲染 HTML 引用的
`/assets/003253.<hash>.png` 一定能在客户端构建的 `dist/assets/` 里找到。
即便如此，`prerender.js` 仍会校验每一个引用真实存在，作为规则变化时的兜底。

**各渠道的能力差异（实测）。**

| 渠道 | 是否解析 `_headers` | 结论 |
| --- | --- | --- |
| Cloudflare Workers Static Assets | 是 | `/assets/*`、HTML、未 hash 资源都按规则生效 |
| EdgeOne | 否 | `/assets/*` 与 HTML 本就正确；favicon / robots / sitemap 需控制台配置 |
| GitHub Pages | 否 | 全部固定 `max-age=600`，仓库侧无法修改 |

**GitHub Pages 的部署原子性。** 工作流用 `clean: true`，每次部署会删除上一版
的 hash 资源；而 GitHub Pages 的 HTML 固定缓存 600s。部署后最多 10 分钟内，
持旧 HTML 的用户可能请求到已删除的旧资源。已通过 `clean-exclude: assets/`
保留旧 `assets/` 缓解；代价是 `gh-pages` 分支会缓慢增长，需要时重建。

**考虑过并否掉的方案：**

- **保留 `public/icons`，只给 `/icons/*` 设 7 天缓存。** 不需要迁移，但 14 MB
  图标每次回访仍要协商缓存，且无法利用 `immutable`。这是更低风险的折中，
  本次按使用者的要求选择了彻底方案。
- **用 `?v=<buildId>` 版本号代替 content hash。** 每次部署都会让全部图标 URL
  变化，回访用户需要重新下载 14 MB — 比协商缓存更差。
- **在预渲染之后重命名图标并改写 HTML/JS/CSS。** 动态拼接的 URL 无法可靠改写；
  而且必须在预渲染之后做，链路更脆。

**遗留。** `og-image.png` 的社交平台缓存不受 `Cache-Control` 控制，
换图时需要给 URL 加 `?v=`；本次未做。EdgeOne 的 favicon / robots / sitemap
缓存仍需控制台配置。
