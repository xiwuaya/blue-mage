点击地图图标 → 打开交互式地图并标记坐标

Context

public/icons/map.svg 目前已经显示在 method.type === "map" 的途径后面，
有金色悬停高亮和 title="在地图中查看"，但它是一个惰性的 <img>，点击没有任何反应。

本次要把它接上 地图集成开发文档.md 规划的地图功能：点击后弹出交互式地图
（Waking Sands / 神典石），自动定位到该途径对应的地图，并在 method.position 处放置标记。

文档把若干关键问题列为"未解决"，并明确要求
"在当前 Vue + TypeScript + Vite 项目中验证实际 import 和初始化方式，而不是继续假设"。
下面第 1 节就是这些验证的实际结果 —— 其中 3 条纠正了文档的假设，1 条是文档完全遗漏的缺口。

---

1. 已验证的事实（全部来自实测，非推断）

1.1 文档正确、可以照做的部分

- position 直接当坐标用，不做转换 —— 文档的结论正确。
  simpleMarker(x,y,iconUrl,mapInfo) 内部是 new Marker(xy(fromMapXY2D(mapInfo,x,y)))。
  换算函数 an(t,sizeFactor)=(t-1)/(4100/sizeFactor)*2048 表明显示坐标是 1–42 量级；
  实测 spells.json 全部 81 个 map 途径的 position 取值约 7–37（如 [26.7,20.9,0]），
  完全吻合。不要调用 toMapXY3D。
- **XIVAPI 的 CORS 可用。** 带 Origin头实测返回Access-Control-Allow-Origin: *， 浏览器 fetch` 不会被拦。文档当初只用 curl 验证过，这条是补上的。
- 数据完整。 81 个 map 途径全部有 map 字段和长度为 3 的纯数字 position，无需空值兜底。

1.2 纠正文档假设的部分

- addMarker 才是正确方法名（文档未解决问题 21.3 已解决）。
  源码里 addMaker 是拼写错误，会 console.warn("[Deprecated] ...") 后转调 addMarker。
- 不要用 window.YZWF.eorzeaMap（文档第 11、14 节）。
  UMD 只在"浏览器 <script> 全局"分支才挂 window.YZWF.eorzeaMap；
  Vite 走 CJS 互操作分支，只会执行 window.YZWF = window.YZWF || {}（不含 .eorzeaMap）。
  应改用 import * as eorzeaMap from "@thewakingsands/eorzea-interactive-map"。
  （已用项目自带的 esbuild 实测 __toESM 路径，命名导入可用；但 default 是 undefined，别用默认导入。）
- 必须额外引入 leaflet.css —— 文档完全没有提到，这是文档的缺口。
  @thewakingsands/eorzea-interactive-map/dist/map.css 只有 56 条规则，其中 leaflet 相关仅
  .leaflet-container 等 4 个类；Leaflet 的核心布局类
  （.leaflet-pane / .leaflet-tile / .leaflet-map-pane / .leaflet-zoom-animated）一个都没有，
  且 map.js 不会在运行时注入任何样式。只引 map.css 的话地图会塌成一堆叠在一起的图块。
  leaflet@1.9.4 已被提升到 node_modules/leaflet，但它不是本项目的直接依赖，需显式声明。

1.3 关于"地图名 → key"的实测结论

逐个实测了 spells.json 里全部 31 个唯一地图名，用两个互相独立的数据源交叉验证：

┌─────────────────────────────────────────────────────┬─────────────────────────────┐
│                       数据源                        │            结果             │
├─────────────────────────────────────────────────────┼─────────────────────────────┤
│ XIVAPI Map.row_id（PlaceNameSub.row_id === 0 规则） │ 30/31 唯一解析              │
├─────────────────────────────────────────────────────┼─────────────────────────────┤
│ 地图库自带的 getRegion() → region.json              │ 30/31 唯一解析              │
├─────────────────────────────────────────────────────┼─────────────────────────────┤
│ 两者对比                                            │ 30 个全部完全一致，0 处分歧 │
└─────────────────────────────────────────────────────┴─────────────────────────────┘

两个独立来源 100% 吻合，说明 key 空间是可靠的。两个重要细节：

- 唯一失败项是数据错字：库尔扎斯西部高地 两个源都查不到，
  因为游戏官方地名是 库尔札斯西部高地（札 而非 扎）→ key = 211。
  该错字在仓库中只出现 1 处：tools/spells.json:2801。
- region.json 有大量重名（1073 条里 534 条重名），必须过滤：
  只保留 subName === "" 且 id 不以 default/region 开头的条目。
  即便过滤后 摩杜纳 仍有 3 个候选（key 25 / 91 / 105），需额外消歧 ——
  这也是下面保留静态表（构建时可人工核对）的原因。

▎ 补充：create() 内部本身就会 await getRegion() 去 fetch region.json，
▎ 拿不到这份数据地图根本建不起来。所以用 getRegion() 兜底不增加任何额外网络请求。

---

2. 已确认的决策

1. 解析方式：静态表为主 + getRegion() 兜底。运行时 0 次 XIVAPI 调用。
2. 地名错字：直接修正 tools/spells.json 为官方名 库尔札斯西部高地。
3. 弹窗内容：地图 + 标记，外加一条技能信息栏（技能名 · 怪物 Lv · 地图名/坐标）。

---

3. 实现步骤

3.1 修正错字

tools/spells.json:2801："map": "库尔扎斯西部高地" → "库尔札斯西部高地"。

3.2 新增构建时脚本 tools/update-map-keys.js

沿用 tools/update-methods.js 已有风格（CommonJS、中文日志）：

- 读 tools/spells.json，收集 type === "map" 的全部唯一 map 名（当前 31 个）。
- 逐个查 XIVAPI（language=chs，PlaceName.Name="X"，取 PlaceNameSub.row_id === 0）。
- 写 tools/map-keys.json：{ "中拉诺西亚": 15, "库尔札斯西部高地": 211, ... }。
  放在 tools/ 而非 src/，与既有的 tools/spells.json 一致
  （src/lib/spell.ts:1 已经用 import rawSpells from "../../tools/spells.json" 跨目录引 JSON）。
- 解析失败的名字要 console.warn 并在结尾汇总 —— 让下一个错字在构建时就暴露，而不是运行时静默失败。
- 网络失败时保留已有文件（不要清空重写），否则离线构建会把表清空。
- 接进 package.json 的 prebuild：
  "prebuild": "node tools/update-date.js && node tools/update-methods.js && node tools/update-map-keys.js"。
  CI 已经跑 yarn build，会自动触发，表始终最新。
- .github/workflows/publish-to-pages.yml 的 git add 列表补上 tools/map-keys.json。

3.3 新增类型声明 src/types/eorzea-map.d.ts

包自身没有 types 字段。只声明实际用到的部分：create、simpleMarker、loader、getRegion。
tsconfig.json 的 include 已覆盖 src/**/*，无需改配置。
注意弹窗里要用到的实例方法在 .d.ts 里补上：loadMapKey / addMarker / mapInfo /
mapToLatLng2D / setView / remove。

3.4 新增 src/lib/map.ts（运行时解析 + 缓存）

- 优先查静态表 tools/map-keys.json。
- 未命中则用 getRegion() 的结果按 name 匹配，套用 1.3 的过滤规则
  （subName === "" 且 id 不以 default/region 开头），多候选时取最小 key。
- getRegion() 结果做模块级缓存（它本身已 memoize，这里只是避免重复构建索引）。
- 导出 resolveMapKey(name: string): Promise<number | null>。

3.5 新增 src/components/MapModal.vue

结构：完全复用 PartyModal.vue 的模式 ——
<Teleport to="body"> + <Transition name="fade"> + v-if="show" + @click.self 关闭，
直接用 App.vue 全局的 .modal-backdrop / .modal-content / .close-btn 类，
再用同 scoped 类覆盖 max-width（照抄 .party-modal 在 PartyModal.vue:546 的做法）。

Props：show: boolean、spellName: string、method: SpellMethodMap。Emits：close。

顶部信息栏：{spellName} · {mob} Lv.{level} / {map} (x:{position[0]}, y:{position[1]})。

生命周期（顺序很关键）：

watch(show, true)
  → await nextTick()            // 容器必须已插入且有尺寸
  → await eorzeaMap.create(el)  // 注意：内部会 el.innerHTML="" 且 fetch region.json
  → key = await resolveMapKey(method.map)
  → await map.loadMapKey(key)
  → map.addMarker(eorzeaMap.simpleMarker(x, y, iconUrl, map.mapInfo))
  → map.setView(map.mapToLatLng2D(x, y), 0)
关闭 → map.remove()  // 继承自 Leaflet，必须调用

要点与坑：

- 容器必须有显式尺寸（如 height: 60vh; width: 100%）。库不提供任何宽高样式；
  且 Leaflet 的 fitBounds 会读 clientWidth/clientHeight，容器 0×0 会让视图计算退化。
- 标记必须在 await loadMapKey() 之后再加：loadMapInfo 会清空 markers 数组，
  先加会被清掉。
- 图标：eorzeaMap.loader.getIconUrl("ui/icon/060000/060561.tex")，与库自身示例一致。
- 缩放用 0：库自带的 deep-link 定位就是 setView(mapToLatLng2D(x,y), 0)；
  合法范围 -3..4，-1 是整图概览。0 正好是原生图块分辨率。
- create() 会 reject（region.json 拿不到就会失败，没有内置兜底）→ 需要错误态 UI。
- 关闭时若请求仍在飞行中要做守卫（用一个 token / 已卸载标志），否则会对已移除的 map 操作。
- 容器元素每次打开都是新的：v-if="show" 会让容器在关闭时被销毁、再次打开时重建，
  这正好规避了库在容器上挂的 click 监听器永不解除的泄漏（见 1.2 之外的 agent 报告结论）。
- CSS 引入顺序：leaflet/dist/leaflet.css 先，@thewakingsands/eorzea-interactive-map/dist/map.css 后。
- 图标现在真的可点了，Method.vue 的 .map 样式补 cursor: pointer。

3.6 事件链路：Method.vue → App.vue

严格照抄既有 search 事件的四层链路（每一层都已确认过行号）：

┌──────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────┐
│             文件             │                                       改动                                        │
├──────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
│ src/components/Method.vue    │ defineEmits 加 (e: "openMap", payload): void；<img class="map"> 加 @click。注意   │
│                              │ @click.stop，避免冒泡到外层可点击元素                                             │
├──────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
│ src/components/SpellItem.vue │ 声明 + 在 :53 的 <spell-method> 上 @openMap="emit('openMap', $event)"             │
├──────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
│ src/components/SpellList.vue │ 声明 + 在 :222 的 <spell-item> 上转发                                             │
├──────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
│ src/App.vue                  │ 新增 mapTarget ref；@openMap 处理；在 <PartyModal>（:172–184）旁挂 <MapModal>     │
└──────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────┘

事件负载：{ spellName: props.spell.spell, method: m }。
技能名在 Spell 上、不在 SpellMethod 上，而信息栏需要它，所以要一起带上去
（SpellItem.vue 能同时拿到两者）。

3.7 依赖

package.json 显式加入 "leaflet": "^1.9.4"（当前只是传递依赖，直接 import 其 CSS 属于依赖提升的巧合）。

---

4. 验证方式

1. 构建时：node tools/update-map-keys.js 单独跑一次，确认输出 31 条、
   无 warn；人工核对 中拉诺西亚: 15、库尔札斯西部高地: 211、摩杜纳: 25。
2. yarn typecheck + yarn build 通过，且 dist/ 里 CSS 含 leaflet 布局规则。
3. yarn dev 手测（这是必须的 —— 本功能只能在真实浏览器里验证）：
   - 点 终极针 的 map 图标 → 弹出地图、显示中拉诺西亚、标记落在 (15,15)。
   - 点 吸血（黑衣森林中央林区 [26.7, 20.9]）→ 验证非整数坐标。
   - 点 库尔札斯西部高地 那条 → 验证错字修复后能正常打开（key 211）。
   - 反复开关 5 次以上 → 控制台不应出现 Map container is already initialized.，
     也不应累积错误（验证 3.5 的容器重建 + map.remove()）。
   - 浏览器断网后再点图标 → 应看到错误提示而不是白屏或未捕获异常。
4. 回归：确认原有的"点击文字搜索"（@search）行为未受影响 —— 两者在同一个 <span>/<img> 相邻位置。

---

5. 需要提前知道的既有问题（本次不修，但你应当知情）

- 线上站点与仓库当前不一致。 实测 https://thewakingsands.github.io/blue-mage/ 仍是旧版本
  （页面标题是「青魔法师技能学习指南」，而仓库 index.html 已是「青魔法来源查询」），
  它引用的是 /blue-mage/assets/...。
  但仓库当前 vite.config.ts 是 base: "/"（commit e73f7f8 于 2026-03-27 从 /blue-mage/ 改成 /），
  本地构建产物引用的是 /assets/... —— 在 /blue-mage/ 子路径下会 404。
  本次改动不影响这一点，但你下次部署前需要先确认 base 到底该取哪个值，否则整站（含新地图功能）都会打不开。
- 顺带确认：public/ 下的资源用相对路径（icons/map.svg）在子路径部署下是正确的，
  绝对路径 /icons/... 会 404（已实测）。Method.vue 现有写法正确。
- PartyModal.vue:631 / SpellList.vue:253 里的 mask: url('/icons/Visible.svg') 是绝对路径，
  在 /blue-mage/ 子路径下同样会 404 —— 属于既有问题，与本次无关。