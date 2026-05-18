import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@seamless-scroll/react": resolve(__dirname, "../../packages/react/src"),
      "@seamless-scroll/core": resolve(__dirname, "../../packages/core/src"),
      "@seamless-scroll/shared": resolve(__dirname, "../../packages/shared/src"),
    },
  },
});
