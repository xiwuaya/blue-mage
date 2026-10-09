import { fileURLToPath, URL } from "url";

import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";

/**
 * 主分发渠道。三个地址分发的是同一份内容，canonical 统一指向这里：
 * - 主：  https://bluemagic.badend.cn/      （EdgeOne，根域）
 * - 备用：https://blue-mage.badend.cn/      （Cloudflare，根域）
 * - 备用：https://blog.badend.cn/blue-mage/ （GitHub Pages，子路径）
 */
const CANONICAL_URL = "https://bluemagic.badend.cn/";

/**
 * 注入 canonical，避免三个分发地址被搜索引擎当成三份重复内容。
 *
 * 备用子路径渠道要靠构建时换 `base` 才能正确加载资源
 * （`vite build --base=/blue-mage/`，见 package.json 的 build:subpath）——
 * Vite 会把 HTML 引用、CSS 里的 `url('/icons/*.svg')` 和 `new Worker(...)`
 * 一并改写成 `/blue-mage/...`，源码无需改动。
 */
function injectCanonical(): Plugin {
  return {
    name: "inject-canonical",
    transformIndexHtml(html) {
      return html.replace(
        "</head>",
        `  <link rel="canonical" href="${CANONICAL_URL}" />\n  </head>`
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [vue(), injectCanonical()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
