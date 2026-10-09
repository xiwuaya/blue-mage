# 构建时预渲染：`vite build --ssr` 出静态 HTML，客户端 hydration

三个分发渠道此前返回的都是同一个 507 字节的空壳（`<body><div id="app"></div></body>`），
124 个技能、408 条途径只存在于 410 KB 的 JS bundle 里，搜索引擎收录量为零。

现在构建时用 `@vue/server-renderer` 把 App 渲染成 HTML 注入 `dist/index.html`，
客户端用 `createSSRApp().mount()` 做 hydration：

| | 改前 | 改后 |
| --- | --- | --- |
| `dist/index.html` | 507 B | 222,480 B（gzip 17.3 KB） |
| 可索引中文字符 | 个位数 | 11,937（982 个不重复字形） |
| 首屏 JS | 420 KB 单包 | 243 KB（地图库拆成 167 KB 懒加载 chunk） |

产物是 **123** 个技能条目而非 124：`src/lib/useSpellSync.ts:17` 把 `spellStatus[0] = 1`
（1 号「水炮」默认已掌握），而默认 `mode` 是 `notLearned`。这是刻意的业务默认，
预渲染结果与真实浏览器首屏一致 —— 正是 hydration 需要的性质。

入口拆成两个：`src/entry-client.ts`（原 `main.ts`）和 `src/entry-server.ts`。
`index.html` 里留两个注释占位符 `<!--teleport-html-->` 和 `<!--app-html-->`，
由 `tools/prerender.js` 替换。

**为什么值得记下来。** 这套东西里有四条约束在代码里完全看不出来，
每一条被"顺手清理"掉都会让站点静默退回空壳，或者更糟 —— 让 hydration 删掉 DOM：

- **`index.html` 里的两个占位符不能删、不能被格式化拆行。**
  `<!--teleport-html-->` 必须**紧贴 `<body>`**。`tools/prerender.js` 会断言这一点。
  原因见下。
- **`vite.config.ts` 的 `ssr.external` 不能删。** 删了之后 `node tools/prerender.js`
  会抛 `window is not defined`，构建失败。这是**正确的失败方向**（宁可不上线，也不上线空壳），
  但看到这条报错的人容易误以为是"配置多余"而把它去掉。
- **地图库的 import 必须是函数内动态 import，不能提到模块顶层。**
  `src/lib/map.ts` 的 `buildRegionIndex()` 和 `src/components/MapModal.vue` 的 `openMap()`
  各有一处。看代码会觉得"提到顶层更干净" —— 那会让构建直接崩。
- **`src/lib/setting.ts` 的守卫判的是 `typeof window`，不是 `typeof localStorage`。**
  见下。

**为什么 `ssr.external` 是必须的，且光靠 `defineAsyncComponent` 不够。**
Vite 2.9 在 `vite build --ssr <entry>`（input 为字符串）时会设
`inlineDynamicImports: true`（`vite/dist/node/chunks/dep-0a035c79.js`）——
**动态 import 会被内联进单文件产物**。所以 `App.vue` 里对 `MapModal` 用
`defineAsyncComponent` 在客户端构建里确实拆出了独立 chunk，但在 SSR 产物里
MapModal 仍被内联，它和 `lib/map.ts` 里对地图库的**静态 import** 于是变成
**急切求值的顶层 `require`**，`node` 加载产物时立刻执行地图库的 UMD 包装 → 抛
`window is not defined`。实测：只加 `ssr.external` 而不把静态 import 改成动态 import，
产物第 12 行就是 `require("@thewakingsands/eorzea-interactive-map")`，加载即崩。

**为什么 Teleport 内容必须手动注入且紧贴 `<body>`。**
`renderToString(app, ctx)` 的 Teleport 内容落在 `ctx.teleports.body`，不进主 HTML，
必须自己拼回去。而 hydration 时 `hydrateTeleport` 从
`target._lpa || target.firstChild` 起步
（`@vue/runtime-core/dist/runtime-core.esm-bundler.js:6569`），即 `document.body.firstChild`；
失配走 `handleMismatch`，后者是 **`remove(node)` + 重新 patch**（同文件 `:4950`）——
**是删节点，不是打补丁**。两个 `to="body"` 的 Teleport 若找不到
`<!--teleport anchor-->` 串起的 `_lpa` 链，第二个会退回 `body.firstChild`，
**可能把 `<div id="app">` 本身删掉**。注入位置正确时，`body.firstChild` 恰好是
第一个 Teleport 的 slot 产物 `<!---->`，链条正确建立。

**为什么守卫判 `window` 而不是 `localStorage`。**
Node 22.4+ 的 `--experimental-webstorage` 会注入 `globalThis.localStorage`，
而 CI 的 Node 版本不受本仓控制（workflow 里没有 `actions/setup-node`）。
判 `typeof localStorage !== "undefined"` 会在那种环境下走进
`localStorage.getItem()` 分支，把确定性守卫变成碰运气。判 `window`
同时覆盖 `loadSetting` 的 `localStorage` 与 `document.cookie` 两条分支。

**考虑过并否掉的方案：**

- **`createServer()` + `ssrLoadModule()`（dev server 内联 SSR）。**
  实测会在 `@vitejs/plugin-vue` 上崩：它只在 `buildStart()` 里 `resolveCompiler()`，
  而 Vite 2.9 只在被覆写的 `httpServer.listen` 里调 `container.buildStart()`——
  不调 `listen()` 就是 `Cannot read properties of null (reading 'parse')`。
  而且 dev SSR 的外部化靠 `server._ssrExternals` 惰性计算，对这两个包会走
  "打印 CJS 警告但不加入 externals" 的分支，行为随 `knownImports` 波动。
  `vite build --ssr` 实测 452 ms（大部分依赖是 external），CI 成本可忽略。
- **不引入 hydration，客户端继续 `createApp().mount()`。** 最简单，
  Teleport 与 mismatch 整类问题一次性消失。放弃的是 DOM 复用。
  真要降级，这是首选的一行改动（`src/entry-client.ts`）。
- **`ssr.noExternal` 把地图库打进 SSR 产物。** 不行 —— 它的 `window` 访问在模块顶层，
  打进去照样在加载时执行。

**遗留。** 这套方案解决的是"能读到内容"。搜索引擎展示所需的 `meta description`，
以及最大的长尾机会 —— 124 个技能的独立落地页（`/spell/<编号>`）—— 都还没做。
