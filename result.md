# 本次改动记录（result.md）

> 记录人：AI Agent
> 完成日期：2026-09-21
> 提交：`8761393` —「新增地图功能」（15 个文件，+3748 / −462）
>
> 配套文档：`地图集成开发文档.md`（已同步更新为最新状态）
> 相关过程文档：`结果.md`（内容为本次实现前的实施计划，供对照）

---

## 1. 本次做了什么

给 `method.type === "map"` 的途径后面的地图图标加上点击行为：
**点击 → 弹出交互式地图（Waking Sands / 神典石）→ 定位到对应地图 → 在 `method.position` 处放置标记。**

原先那个图标是个惰性的 `<img>`，只有悬停高亮和 `title`，点击没有任何反应。

---

## 2. 新增文件

| 文件 | 行数 | 作用 |
| --- | ---: | --- |
| `src/components/MapModal.vue` | 200 | 地图弹窗组件（创建地图、解析 key、放标记、清理） |
| `src/lib/map.ts` | 69 | 运行时 `resolveMapKey()`：静态表优先，`getRegion()` 兜底 |
| `src/types/eorzea-map.d.ts` | 89 | 手写 TypeScript 类型声明（该 npm 包不自带 types） |
| `tools/update-map-keys.js` | 109 | 构建时脚本：地图名 → key，生成静态表 |
| `tools/map-keys.json` | 33 | 生成的静态表（31 条地名 → key），随仓库提交 |
| `public/icons/map.svg` | — | 地图图标（此前已由使用者添加，本次一并提交） |

---

## 3. 修改文件

| 文件 | 改动量 | 内容 |
| --- | --- | --- |
| `src/App.vue` | +19 / −5 | 引入并挂载 `MapModal`；新增 `mapTarget` 状态；`@openMap` 处理 |
| `src/components/Method.vue` | +40 / −3 | 地图图标加 `@click.stop`；新增 `openMap` 事件；`.map` 加 `cursor: pointer` |
| `src/components/SpellItem.vue` | +7 / −2 | 声明并转发 `openMap`，顺带补上 `spellName` |
| `src/components/SpellList.vue` | +4 / −1 | 声明并转发 `openMap` |
| `package.json` | +4 / −1 | prebuild 追加 `update-map-keys.js`；新增直接依赖 `leaflet@^1.9.4`；地图包依赖落库 |
| `tools/spells.json` | 1 行 | 修正地名错字：`库尔扎斯西部高地` → `库尔札斯西部高地` |
| `.github/workflows/publish-to-pages.yml` | +1 | CI 提交产物时带上 `tools/map-keys.json` |
| `package-lock.json` / `yarn.lock` | — | 依赖变更导致的锁文件更新 |

> `vite` 因锁文件重新解析，由 **2.8.1 → 2.9.18**。这是 `^2.7.13` 的正常解析结果，
> 副作用是产物由「拆分 vendor chunk」变成单个约 405 KB 的 chunk。

---

## 4. 改动后的项目结构（仅列出改动文件）

```text
blue-mage/
├── .github/
│   └── workflows/
│       └── publish-to-pages.yml          [改] +1 行，提交产物带上 map-keys.json
├── public/
│   └── icons/
│       └── map.svg                       [新] 地图图标
├── src/
│   ├── App.vue                           [改] +19/−5，挂载 MapModal、mapTarget 状态
│   ├── components/
│   │   ├── MapModal.vue                  [新] 200 行，地图弹窗
│   │   ├── Method.vue                    [改] +40/−3，图标点击 → openMap
│   │   ├── SpellItem.vue                 [改] +7/−2，转发 openMap
│   │   └── SpellList.vue                 [改] +4/−1，转发 openMap
│   ├── lib/
│   │   └── map.ts                        [新] 69 行，resolveMapKey()
│   └── types/
│       └── eorzea-map.d.ts               [新] 89 行，库的类型声明
├── tools/
│   ├── map-keys.json                     [新] 33 行，静态表（构建产物）
│   ├── spells.json                       [改] 1 行，地名错字修正
│   └── update-map-keys.js                [新] 109 行，构建时生成静态表
├── package.json                          [改] prebuild + leaflet 依赖
├── package-lock.json                     [改] 依赖变更
├── yarn.lock                             [改] 依赖变更
├── 地图集成开发文档.md                     [改] 同步为最新状态
└── result.md                             [新] 本文件
```

---

## 5. 该 npm 库中官方没有说明的用法 ⭐

这部分是本次逆向 `dist/map.js`（170 KB 压缩 UMD）得到的结论，**官方没有文档**，
其中多条会直接导致功能失效或内存泄漏。

### 5.1 `getRegion()` —— 内置的「中文地图名字典」（最有价值的发现）

官方没提过这个函数能当地名字典用。它返回一个完整的区域/地图索引：

```ts
const regions = await getRegion();
// [
//   {
//     regionName: "拉诺西亚",
//     maps: [
//       { id: "s1f1/00", key: 15, hierarchy: …, name: "中拉诺西亚", subName: "", regionName: "拉诺西亚" },
//       ...
//     ]
//   },
//   ...
// ]
```

**这意味着「中文地图名 → map key」根本不需要调用 XIVAPI。**

要点：

- 数据来自 `https://map.ffcafe.cn/assets/data/region.json`（约 203 KB，`Access-Control-Allow-Origin: *`）；
- **内部 memoize，整页只请求一次**，而且 `create()` 本来就会调它 —— 所以拿它做兜底**零额外开销**；
- 共 **1073 条记录、539 个唯一名字，重名 534 条**，直接建索引会命中错误条目。

过滤与消歧（本项目 `src/lib/map.ts` 的实现）：

```ts
// 只保留「主地图」
const isMainMap = (m: EorzeaMapRegionMap) =>
  !m.subName &&                    // subName 非空的是子区域，如「黑衣森林南部林区 - 兀尔德泉」
  !m.id.startsWith("default") &&   // id 以 default/ 开头是占位条目（如 key 187）
  !m.id.startsWith("region");      // id 以 region/ 开头是区域级条目（如 key 91）

// 过滤后仍可能多个候选（摩杜纳有 key 25 / 91 / 105），取最小 key
// 实测与 XIVAPI 判定一致
const index = new Map<string, number>();
for (const region of regions) {
  for (const m of region.maps || []) {
    if (!isMainMap(m)) continue;
    const prev = index.get(m.name);
    if (prev === undefined || m.key < prev) index.set(m.name, m.key);
  }
}
```

### 5.2 `addMarker` 才存在，`addMaker` 是废弃的错误拼写

```js
B.prototype.addMaker = function (t) {
  console.warn("[Deprecated] map.addMaker is a misspell, you should use map.addMarker instead.");
  return this.addMarker(t);
};
```

用 `addMarker`。（初版开发文档把它列为"未解决问题"，现已确认。）

### 5.3 ⚠️ `loadMapKey()` 会清空已有标记 —— 标记必须后加

`loadMapInfo` 内部会先把 `markers` / `overlays` / `tileLayer` 全部移除：

```js
this.mapInfo = l;                                    // 同步赋值
if (this.markers.length) { this.markers.forEach(m => m.remove()); this.markers = []; }
if (this.overlays.length) { ... this.overlays = []; }
this.tileLayer && (this.tileLayer.remove(), this.tileLayer = null);
...
this.panTo(...);                                     // 视图重置到地图中心
this.fire("updateInfo", { mapInfo: l });
```

所以**先加标记再 `loadMapKey`，标记会被吃掉**：

```ts
// ✗ 错误顺序
map.addMarker(marker);
await map.loadMapKey(key);   // 标记被清空

// ✓ 正确顺序
await map.loadMapKey(key);
map.addMarker(eorzeaMap.simpleMarker(x, y, iconUrl, map.mapInfo));
```

### 5.4 `setView()` 是**异步生效**的

调用后立刻读 `map.getCenter()` 拿到的是旧值，约 800 ms 后才是目标值
（库自身的 `panTo` 还在进行，`setView` 排在它之后生效）。

```ts
map.setView(map.mapToLatLng2D(x, y), 0);
console.log(map.getCenter());   // ✗ 还是旧值，别在这里判断
// 最终状态是正确的，无需额外处理；但需要立刻读视图时要留意
```

库自己的深链代码也是靠 `setTimeout(() => map.setView(...), 100)` 绕开的。

### 5.5 地图类**没有** `destroy`，但继承了 Leaflet 的 `remove()` —— 必须调用

```ts
instance.remove();   // 注销 window resize 监听、移除 pane/control，
                     // 并清除容器的 _leaflet_id
```

不清除 `_leaflet_id`，下次在**同一元素**上 `create()` 会抛：
`Map container is already initialized.`

### 5.6 ⚠️ `create()` 挂在容器上的 click 监听**永不解除** → 别复用容器元素

```js
function attachClickHandler(el, map) {
  el.addEventListener("click", function (e) { /* ... map.loadMapId(...) */ });
}
```

`remove()` 不会解掉它。若在同一 DOM 元素上反复 `create()` / `remove()`，
旧闭包会一直持有旧地图（内存泄漏）。

**解决办法：每次打开都用全新的容器元素。** 本项目靠 `v-if` 挂载 `MapModal`
（而不是 `:show` 隐藏），容器随组件卸载被销毁，下次打开是全新元素。

### 5.7 `create()` 的两个隐含前提

```js
async function create(el) {
  el.innerHTML = "";                  // ① 会清空容器
  const map = new L.Map(el, { crs: L.CRS.Simple, minZoom: -3, maxZoom: 4, ... });
  Object.setPrototypeOf(map, EorzeaMap.prototype);
  const regions = await getRegion();  // ② 网络请求，失败即 reject，无内置兜底
  map.init(regions, el);
  attachClickHandler(el, map);
  return map;
}
```

- **会清空容器 `innerHTML`**；
- **不提供任何宽高样式** → 容器必须自己给尺寸；
- **容器 0×0 会让视图计算退化**（`fitBounds` → `getSize()` 读到 0）；
- **`getRegion()` 失败会 reject**，断网时整个地图建不起来 → 必须做失败态 UI。

### 5.8 缩放范围与推荐值

```text
合法范围：-3 .. 4
-1 = 整图概览（create 之后的默认值）
 0 = 原生图块分辨率；库内深链定位用的就是 0
```

### 5.9 `simpleMarker` 的坐标语义 —— 接收**游戏内显示坐标**

```js
function simpleMarker(x, y, iconUrl, mapInfo) {
  icon = new Icon({ iconSize: new Point(32, 32), iconUrl });
  return new Marker(xy(fromMapXY2D(mapInfo, x, y)), { icon, zIndexOffset: 1000, pane: "popupPane" });
}
// an(t, sizeFactor) = (t - 1) / (4100 / sizeFactor) * 2048
```

由 `4100 / sizeFactor` 可反推显示坐标量级为 **1–42**，
与 `spells.json` 实测值域（7–37）吻合。

配套的居中函数用的是同一套换算，所以两者天然一致：

```ts
map.setView(map.mapToLatLng2D(x, y), 0);   // = xy(fromMapXY2D(x, y))
```

另有一个 `iconMarker(x, y, iconUrl, mapInfo, coordSpace, w, h)`，
`coordSpace` 传 `"3d"` 时会先做 `toMapXY2D` 换算；本项目不用它。

### 5.10 库会**自动加载自己的 POI 标记**

`loadMapKey` 之后地图上会出现该地图自带的兴趣点标记
（实测：中拉诺西亚 25 个、黑衣森林中央林区 45 个、库尔札斯西部高地 38 个）。

**你添加的标记是在这些之上叠加的。** 所以判断"自己的标记有没有渲染成功"时，
不能只看标记总数，要按图标 URL 区分：

```js
const mine = [...document.querySelectorAll(".leaflet-marker-icon")]
  .filter(n => (n.getAttribute("src") || "").includes("060561"));
```

### 5.11 已知 bug：别直接调 `xy(x, 0)`

```js
function xy(t, e) { const i = e ? t : t[0]; return [2048 - (e || t[1]), i]; }
```

`e === 0` 是 falsy，会走错分支返回 `[NaN, undefined]`。
`simpleMarker` / `mapToLatLng2D` 内部都传数组，**不受影响**；但不要自己直接调 `xy(x, y)`。

### 5.12 UMD 在打包器下**不会**创建 `window.YZWF.eorzeaMap`

```js
((t, e) => {
  "object" == typeof exports && "undefined" != typeof module ? e(exports)   // ← 打包器走这里
  : "function" == typeof define && define.amd ? define(["exports"], e)
  : e((t.YZWF = t.YZWF || {}, t.YZWF.eorzeaMap = {}));                      // ← 只有 <script> 走这里
})(this, function (t) { ... });
```

只有浏览器 `<script>` 全局分支才挂 `.eorzeaMap`。
Vite 走 CJS 分支，**`window.YZWF` 存在但 `.eorzeaMap` 是 `undefined`**：

```ts
// ✗ 在 Vite 下不可用
const map = await window.YZWF.eorzeaMap.create(el);

// ✓ 正确
import * as eorzeaMap from "@thewakingsands/eorzea-interactive-map";
const map = await eorzeaMap.create(el);
```

注意：**不要用默认导入** —— UMD 设了 `__esModule: true`，`default` 是 `undefined`。

### 5.13 `dist/map.css` **不足以**渲染地图

- `map.css` 只有 **56 条规则**，leaflet 相关仅 `.leaflet-container` 等 4 个类；
- Leaflet 核心布局类（`.leaflet-pane` / `.leaflet-tile` / `.leaflet-map-pane` /
  `.leaflet-zoom-animated` / `.leaflet-marker-icon`）**一个都没有**；
- `map.js` **不会**在运行时注入任何样式。

**必须额外引入 `leaflet/dist/leaflet.css`**，且顺序在前：

```ts
import "leaflet/dist/leaflet.css";
import "@thewakingsands/eorzea-interactive-map/dist/map.css";
```

### 5.14 其他

- **包版本不一致**：`package.json` 写 `1.1.3`，产物内导出的 `version` 是 `"1.1.2"`。
- `onUpdateInfo(fn)` / `offUpdateInfo(fn)`：回调**直接收到 `mapInfo`**（不是事件对象）。
- `loadMapId(id)`：按字符串 id（如 `"region100"`）加载地图，是 `loadMapKey` 的变体。
- `map.mapInfo` 就绪时机：`loadMapKey` 的 await 完成后一定已就绪（`loadMapInfo` 开头是同步赋值）。
- `loader` 只有 `getMapUrl` / `getBgUrl` / `getTileUrl` / `getIconUrl` / `parseIcon` / `setBaseUrl` / `setUrlFunction`，
  **没有任何按名字查询地图的接口**。

### 5.15 本项目踩到的两个 Vue / Vite 坑（非该库本身）

**① Vite 会把静态 `src` 当成模块导入，导致构建失败：**

```html
<img src="icons/map.svg" />   <!-- ✗ -->
```
```text
[vite]: Rollup failed to resolve import "icons/map.svg" from "src\components\Method.vue"
```
```html
<img :src="mapIcon" />        <!-- ✓ 用动态绑定绕开 -->
```

**② Vue 3.2.47 + Volar 0.31.4 + TS 4.5.5 下，字符串模板 ref 的类型不等于 `HTMLElement`：**

```text
error TS2345: Argument of type '{ accessKey: string; ... 274 more ... }'
is not assignable to parameter of type 'HTMLElement'.
```

改用函数 ref（签名必须含 `ComponentPublicInstance`，否则报 `VNodeRef` 不匹配）：

```ts
import type { ComponentPublicInstance } from "vue";

let mapEl: HTMLElement | null = null;
const setMapElement = (el: Element | ComponentPublicInstance | null) => {
  mapEl = el as HTMLElement | null;
};
```
```html
<div :ref="setMapElement" class="map-container"></div>
```

---

## 6. 可复用的最小示例代码

### 6.1 核心调用序列（顺序不能变）

```ts
import * as eorzeaMap from "@thewakingsands/eorzea-interactive-map";
import "leaflet/dist/leaflet.css";
import "@thewakingsands/eorzea-interactive-map/dist/map.css";

// el 必须有显式宽高，且已插入 DOM
const map = await eorzeaMap.create(el);          // 内部会 el.innerHTML="" 并拉 region.json

await map.loadMapKey(15);                        // 会清空已有 markers

const iconUrl = eorzeaMap.loader.getIconUrl("ui/icon/060000/060561.tex");
map.addMarker(eorzeaMap.simpleMarker(15, 15, iconUrl, map.mapInfo));

map.setView(map.mapToLatLng2D(15, 15), 0);       // 居中并放大

// 关闭时
map.remove();                                    // 继承自 Leaflet，必须调用
```

### 6.2 地名 → key（不依赖任何外部 API）

```ts
import { getRegion } from "@thewakingsands/eorzea-interactive-map";

const isMainMap = (m) =>
  !m.subName && !m.id.startsWith("default") && !m.id.startsWith("region");

async function resolveMapKeyByName(name: string): Promise<number | null> {
  const index = new Map<string, number>();
  for (const region of await getRegion()) {
    for (const m of region.maps || []) {
      if (!isMainMap(m)) continue;
      const prev = index.get(m.name);
      if (prev === undefined || m.key < prev) index.set(m.name, m.key);
    }
  }
  return index.get(name) ?? null;
}

await resolveMapKeyByName("中拉诺西亚");   // 15
await resolveMapKeyByName("摩杜纳");       // 25（3 个候选里取最小 key）
```

### 6.3 Vue 3 中的正确挂载 / 卸载骨架

```ts
let instance: EorzeaMapInstance | null = null;
let runToken = 0;                       // 让飞行中的异步流程失效

async function openMap() {
  const token = ++runToken;
  await nextTick();                     // 等容器渲染出来并有尺寸
  if (token !== runToken) return;

  const el = mapEl;
  if (!el) return;

  try {
    const map = await eorzeaMap.create(el);
    if (token !== runToken) { map.remove(); return; }   // 创建期间被关掉了
    instance = map;

    await map.loadMapKey(key);
    if (token !== runToken) return;

    map.addMarker(eorzeaMap.simpleMarker(x, y, iconUrl, map.mapInfo));
    map.setView(map.mapToLatLng2D(x, y), 0);
  } catch (e) {
    error.value = "地图加载失败，请检查网络后重试";      // create() 会因网络失败 reject
  }
}

function handleClose() {
  runToken++;
  instance?.remove();
  instance = null;
  emit("close");
}
```

模板上用 `v-if` 而非 `:show`，保证每次打开都是**全新容器元素**（见 5.6）：

```html
<MapModal v-if="mapTarget" :show="!!mapTarget" :spellName="..." :method="..." @close="mapTarget = null" />
```

---

## 7. 验证方式与结果

### 7.1 已执行的验证

| 项目 | 结果 |
| --- | --- |
| `npx vue-tsc --noEmit` | 通过（exit 0） |
| `npx vite build` | 通过；产物 CSS 含 leaflet 布局规则（`.leaflet-pane` ×6、`.leaflet-tile` ×15 等） |
| `tools/update-map-keys.js` | 31 条全部解析成功，无 warning |
| 静态表关键值核对 | 中拉诺西亚=15、库尔札斯西部高地=211、摩杜纳=25、黑衣森林南部林区=6 全部正确 |

### 7.2 真实浏览器验证（headless Edge，dev server + 组件挂载）

用真实的 `MapModal.vue` 组件跑了三种数据：

```text
终极针 (中拉诺西亚):         标记居中偏移 (0, 0)、图标已加载=true、周边标记 26 个   OK
吸血 (黑衣森林中央林区):      标记居中偏移 (0, 0)、图标已加载=true、周边标记 46 个   OK
冰棘屏障 (库尔札斯西部高地):   标记居中偏移 (0, 0)、图标已加载=true、周边标记 39 个   OK
```

- 三个不同地图的标记均**精确居中**（偏移 0,0）；
- 覆盖了**非整数坐标**（`[26.7, 20.9]`）与**错字修正后的地名**（key 211）；
- `error` / `warn` 共 **0 条**；
- 额外做了 **6 次开关循环**，控制台无 `Map container is already initialized.` 等报错。
- `resolveMapKey` 边界：未知地名 → `null`。

### 7.3 如何自己复验

```bash
node tools/update-map-keys.js     # 单独跑一次，应输出 31 条、无 warn
yarn typecheck                    # 应通过
yarn dev                          # 然后点任意 map 途径的地图图标
```

重点看：地图是否正常铺开（不是一堆叠在一起的图块）、标记是否在视图中心、反复开关是否报错。

---

## 8. 踩坑速查表

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 构建报 `Rollup failed to resolve import "icons/xxx.svg"` | Vite 把静态 `src` 当模块导入 | 改动态绑定 `:src="var"` |
| 地图塌成一堆图块 | 漏引 `leaflet.css` | 引 `leaflet/dist/leaflet.css`，且在 `map.css` 之前 |
| `window.YZWF.eorzeaMap is undefined` | UMD 在打包器下走 CJS 分支 | 用 `import`，不要用全局 |
| 标记不出现 / 被吃掉 | 在 `loadMapKey` 之前加了标记 | 标记必须在 await 之后添加 |
| `Map container is already initialized.` | 复用了容器元素 | 每次打开用新元素 / 调 `map.remove()` |
| 地图一片空白，报视图异常 | 容器没有尺寸 | 给容器显式 `width` / `height` |
| 断网时白屏 | `create()` 内部拉 `region.json` 会 reject | 做失败态 UI |
| 加了标记但"看不到" | 库自带 25–46 个 POI 标记，混在一起了 | 按图标 URL 区分自己的标记 |
| TS2345 传 `HTMLElement` 失败 | Vue 3.2 + Volar 字符串 ref 类型问题 | 改用函数 ref |
| 某张地图打不开 | 地名错字（库尔扎斯 vs 库尔札斯） | 修正数据；构建脚本会 warn |
| 打开地图后标记"飘"到位 | `setView` 的平移动画排在库自身 `panTo` 之后 | `setView(..., { animate: false })` |

---

## 9. 部署前提与遗留问题

### 9.1 `base: "/"` 是对的 **【本节结论已更正】**

> 本文件早先版本在此处写的是"线上站点与仓库不一致，下次部署会整站 404"，
> 以及"绝对路径 `/icons/...` 是既有 bug"。**这两条都是错的**，已更正。

`vite.config.ts` 的 `base: "/"` 是**有意为之**：项目正从子路径迁移到根域部署，
`base` 已于 commit `e73f7f8`（2026-03-27）从 `/blue-mage/` 改成 `/`。

线上之所以仍在引用 `/blue-mage/assets/...`，只是因为**线上还没重新部署**
（页面标题都还是旧的「青魔法师技能学习指南」）。仓库配置无需修改，
**后续改动都应以根域为前提**。详见 `docs/adr/0002-base-root-path.md`。

同理，`PartyModal.vue` / `SpellList.vue` 里的 `mask: url('/icons/Visible.svg')` 用绝对路径
在根域下**完全正常，不是问题**。

### 9.2 `hunt` / `levequests` 暂时**无法**接入（数据缺失，非设计选择）

实测：`hunt` 28 条途径里只有 **2** 条有可用坐标（另 20 条是空数组 `[]`，表示"坐标未知"，
`spell.ts` 里就是为此写的判断）；`levequests` 4 条**一条都没有**。
所以要扩展得先补数据，不是改 `Method.vue` 的 `v-if` 就行。

### 9.3 其他

- **子地图未支持**：`region.json` 里带 `subName` 的条目（如「黑衣森林南部林区 - 兀尔德泉」）
  目前被过滤掉了。若要定位到子区域，需扩展 `isMainMap` 判定。
- **同地图多标记未做**：目前一次只显示一个标记（对应点击的那条途径），这是有意保持的设计——
  "在地图中查看"指的是看**这一条**；"按地图浏览"是另一个功能。
