# 客户端放弃 hydration，改为清空容器后整体重渲染

`src/entry-client.ts` 用 `createApp` + `container.innerHTML = ""` 挂载，
**刻意不做 hydration**。预渲染的 HTML 仍然完整服务爬虫，只是在浏览器端会被整个替换掉。

**为什么。** 服务端读不到 `localStorage`，只能按「全新访客」的状态渲染 ——
列表是 123 条、从 No.2 起（1 号「水炮」被默认标为已掌握）。而存过档的用户会渲染出
完全不同的另一批。两边对不上时，hydration 会按 **DOM 位置**复用服务端渲染的节点，
而 Vue 的 `hydrateElement` **只对 `class` / `style` / `value` 和事件重新打补丁**
（`@vue/runtime-core` 的 `hydrateElement`），`<img src>` 这类属性原样保留服务端渲染的值。

后果：**每一行的图标都停在服务端那一行的图上，整列错位**；文本因为会被修正，所以
技能名和编号是对的 —— 只有图标是错的。过滤条件差得越多，错位越乱。
实测一个「等级 50 + 关掉三种类型」的老用户，**41 行全部错位**；全新访客 0 行错位。
所以症状是「有的用户图标不对」，而不是所有人都出问题。

**为什么不在服务端对齐。** 服务端拿不到用户的 `localStorage`，无从对齐。
唯一能对齐的做法是把客户端所有持久化状态的读取推迟到 `onMounted` 之后
（首屏也用默认值渲染），那要改 `App.vue`、`SpellList.vue`、`useSpellSync.ts` 里
二十多处 `loadSetting` 调用，而 `useSpellSync.ts` 的状态是模块级单例、
在 import 期就会读写存储，牵动面很大。相形之下，放弃 hydration 的代价要小得多。

**代价。** 客户端不再复用服务端 DOM，首屏绘制后会有一次整体重渲染；
hydrate 省下的那点渲染开销没有了。换来的是内容必然正确。

**考虑过并否掉的方案：**

- **保留 hydration，挂载后给 `SpellList` 换 key 强制重渲染。** 只修列表，
  但 `Filter.vue` 的 `<input value>`、`Method.vue` 的类型图标等同样不被 hydration
  打补丁的地方会留下隐患，属于修一半。
- **捏造 SSR 状态去凑客户端。** 服务端读不到用户的存储，做不到。

**回归测试的盲区（这次是被真实用户先发现的）。** `tools/verify-hydration.mjs` 原先
只断言 `#app` 只有一个元素子节点、没有未捕获异常 —— 这两条在图标整列错位时**全部通过**。
现已补上：老用户场景下逐行校验「该行图标 == 该技能的 `icon_book`」。
教训是：hydration 的断言必须校验**内容**，不能只校验**结构**。

**适用边界。** 如果将来把持久化状态的读取整体推迟到挂载之后，服务端与客户端首屏
就能对齐，那时可以重新引入 hydration。改之前请先跑 `yarn verify:hydration`。
