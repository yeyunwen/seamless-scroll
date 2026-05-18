import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@seamless-scroll/vue": resolve(__dirname, "../../packages/vue/src"),
      "@seamless-scroll/core": resolve(__dirname, "../../packages/core/src"),
      "@seamless-scroll/shared": resolve(__dirname, "../../packages/shared/src"),
    },
  },
});
