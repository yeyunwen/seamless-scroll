import DefaultTheme from "vitepress/theme";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({}) {
    // 在此处注册全局组件或添加其他Vue插件
  },
};
