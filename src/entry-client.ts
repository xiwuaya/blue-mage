import { createApp } from "vue";
import App from "./App.vue";
import { initTooltip } from "@thewakingsands/kit-tooltip";
import "./assets/slim-scrollbar.css";

// 用 createApp + 清空容器，**刻意不做 hydration**。见 docs/adr/0005。
//
// 服务端读不到 localStorage，只能按「全新访客」的状态渲染（列表从 No.2 起，共 123 条）；
// 而存过档的老用户会渲染出完全不同的一批。hydration 时 Vue 只对
// class / style / value / 事件重新打补丁（runtime-core 的 hydrateElement），
// <img src> 这类属性会**原样保留服务端渲染的值** —— 于是每一行的图标都停在
// 服务端那一行的图上，整列错位；文本因为会被修正，所以名称是对的。
// 过滤条件差得越多，错位越明显。
//
// 预渲染出的 HTML 仍然完整保留给爬虫（#app 里那 123 条在 curl 下照旧可见），
// 这里只是让浏览器端整体重渲染一次，换取内容正确。
const container = document.querySelector("#app");
if (container) {
  container.innerHTML = "";
  createApp(App).mount(container);
}
initTooltip();
