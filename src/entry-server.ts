import { createSSRApp } from "vue";
import App from "./App.vue";

// 预渲染入口：只负责造一个 App，不挂载、不碰浏览器 API。
//
// 这个文件里禁止出现：
//   - "@thewakingsands/kit-tooltip"：它的 dist 模块顶层有未守卫的
//     document.createElement，在 node 里 require 即抛。
//   - "./assets/*.css"：样式由客户端构建产出的 <link> 负责，这里再引一次
//     只会让 SSR 构建多产一份用不上的死 CSS。
//
// 地图库（@thewakingsands/eorzea-interactive-map）也要靠 MapModal 的
// defineAsyncComponent + vite.config.ts 的 ssr.external 一起挡住。
export function createApp() {
  return createSSRApp(App);
}
