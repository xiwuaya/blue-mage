import { createSSRApp } from "vue";
import App from "./App.vue";
import { initTooltip } from "@thewakingsands/kit-tooltip";
import "./assets/slim-scrollbar.css";

// 预渲染产物里 #app 已带服务端 HTML，createSSRApp + mount 会走 hydration；
// 开发服务器下占位符被 vite.config.ts 的 stripPrerenderPlaceholders 清掉，
// #app 为空时 Vue 自动退化成普通挂载，与改动前行为一致。
createSSRApp(App).mount("#app");
initTooltip();
