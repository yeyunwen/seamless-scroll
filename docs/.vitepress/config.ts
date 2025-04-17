import { defineConfig } from "vitepress";
import { vitepressDemoPlugin } from "vitepress-demo-plugin";
import sidebar from "./sidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Seamless Scroll",
  description: "适用于 React 和 Vue 的轻量级、可定制的无缝滚动解决方案",
  lang: "zh-CN",
  lastUpdated: true,
  cleanUrls: true,
  base: "/seamless-scroll/",

  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg",

    nav: [
      { text: "指南", link: "/guide/", activeMatch: "^/guide/" },
      { text: "示例", link: "/examples/basics", activeMatch: "^/examples/" },
      { text: "API", link: "/api/vue", activeMatch: "^/api/" },
    ],

    sidebar,

    socialLinks: [{ icon: "github", link: "https://github.com/yeyunwen/seamless-scroll" }],

    search: {
      provider: "local",
    },

    footer: {
      message: "基于 MIT 许可发布",
      copyright: `版权所有 © ${new Date().getFullYear()} yeyunwen`,
    },

    outline: {
      level: [2, 3],
      label: "目录",
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
  },

  markdown: {
    config(md) {
      md.use(vitepressDemoPlugin);
    },
  },

  vite: {
    server: {
      host: true,
    },
  },
});
