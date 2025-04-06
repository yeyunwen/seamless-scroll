import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    // 设置测试文件匹配模式
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
