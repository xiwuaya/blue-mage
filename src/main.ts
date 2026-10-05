import { createApp } from "vue";
import App from "./App.vue";
import { initTooltip } from "@thewakingsands/kit-tooltip";
import "./assets/slim-scrollbar.css";

createApp(App).mount("#app");
initTooltip();
