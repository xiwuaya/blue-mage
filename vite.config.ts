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

/**
 * index.html 里的两个注释占位符由 tools/prerender.js 在构建时替换。
 * 开发服务器不跑预渲染，占位符会留在 DOM 里，让 createSSRApp().mount()
 * 以为"有服务端内容"而去 hydration 并报不一致。serve 阶段直接抹掉，
 * dev 的 DOM 与加预渲染之前逐字节一致。
 */
function stripPrerenderPlaceholders(): Plugin {
  return {
    name: "strip-prerender-placeholders",
    apply: "serve",
    transformIndexHtml(html) {
      return html
        .replace("<!--teleport-html-->", "")
        .replace("<!--app-html-->", "");
    },
  };
}

// CJS 模板模块（tools/ 下脚本共用），esbuild 打包 config 时会一并内联
const spellPageTemplate = require("./tools/spell-page-template.js");

/**
 * dev 服务器按需渲染技能详情页。
 *
 * 详情页是构建产物（dist/spell/<id>/index.html，由 tools/generate-spell-pages.js
 * 在 prerender 之后生成），yarn dev 下不存在 —— 不加这个中间件，点击技能
 * 条目的「详情页」链接会被 SPA fallback 兜回列表壳页，看起来像「没跳转」。
 *
 * 与构建期共用 tools/spell-page-template.js 这一份模板；数据（spells.json /
 * descriptions.json）每次请求现读，dev 过程中改数据刷新即可见。
 * 图标没有构建 hash 可查，直接指 /src/ 源文件（dev 由 Vite 静态服务）。
 */
function spellPagesInDev(): Plugin {
  return {
    name: "spell-pages-in-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const method = (req.method || "GET").toUpperCase();
        if (method !== "GET" && method !== "HEAD") return next();
        const url = (req.url || "").split("?")[0];
        const base = server.config.base || "/";
        const trimmed = url.startsWith(base) ? url.slice(base.length - 1) : url;
        const m = trimmed.match(/^\/spell\/(\d+)\/?$/);
        if (!m) return next();

        const ctx = spellPageTemplate.loadSpellContext(m[1]);
        if (!ctx) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(`404: tools/spells.json 里没有 action ${m[1]}`);
          return;
        }
        const html = spellPageTemplate.renderSpellPage({
          ...ctx,
          base,
          resolveIcon: (name: string) => `${base}src/assets/icons/spells/${name}`,
        });
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(html);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [vue(), injectCanonical(), stripPrerenderPlaceholders(), spellPagesInDev()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    /**
     * 图标普遍只有 2–4 KB，默认的 4 KB 内联阈值会把相当一部分图标变成
     * base64 塞进 JS bundle —— 既失去长期缓存（文件没有独立 URL），
     * 又把首屏 JS 撑大。设为 0 强制所有图标产出独立文件，
     * 文件名带 content hash，由 public/_headers 配置一年期 immutable。
     */
    assetsInlineLimit: 0,
  },

  /**
   * 只有 SSR 构建（yarn prerender）会读这段。
   *
   * 为什么必须显式 external：这两个包的 UMD/IIFE 包装在模块顶层就摸
   * window / document，一旦被 rollup 打进 dist-ssr/entry-server.js，
   * node 加载产物时会立刻抛 "window is not defined"。
   *
   * 关键是 Vite 2.9 在 `vite build --ssr <entry>`（input 为字符串）时会设
   * inlineDynamicImports: true，动态 import 会被内联并**立即求值** ——
   * 所以光靠 App.vue 里的 defineAsyncComponent 切不断，这里必须点名。
   *
   * vue / @vue/server-renderer 由 @vitejs/plugin-vue 的 config 钩子自动加；
   * leaflet 有独立的 module 入口，Vite 会自动 external；不用重复写。
   */
  ssr: {
    external: [
      "@thewakingsands/eorzea-interactive-map",
      "@thewakingsands/kit-tooltip",
    ],
  },
});
