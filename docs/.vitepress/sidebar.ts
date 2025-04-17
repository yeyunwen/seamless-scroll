import { DefaultTheme } from "vitepress";
export default [
  {
    text: "指南",
    items: [
      { text: "介绍", link: "/guide/" },
      { text: "快速开始", link: "/guide/getting-started/" },
    ],
  },
  {
    text: "示例",
    items: [
      { text: "基本使用", link: "/examples/basics" },
      { text: "综合示例", link: "/examples/synthetical" },
    ],
  },
  {
    text: "API参考",
    items: [{ text: "Vue API", link: "/api/vue" }],
  },
] as DefaultTheme.Sidebar;
