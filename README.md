# Seamless Scroll

> 一个为 Vue 和 React 打造的高性能无缝滚动组件库，专为列表、公告、消息轮播等场景设计。

无缝滚动组件库，支持 Vue 和 React 框架，提供高性能、可定制的内容滚动解决方案。集成简单，定制灵活，性能出色，帮助您轻松实现各种滚动效果。

[![npm version](https://img.shields.io/npm/v/@seamless-scroll/core.svg?style=flat)](https://www.npmjs.com/package/@seamless-scroll/core)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen)](https://vuejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 包说明

Seamless Scroll 分为以下几个包：

- [@seamless-scroll/core](./packages/core/README.md) - 核心滚动逻辑实现
- [@seamless-scroll/vue](./packages/vue/README.md) - Vue 3组件和Hooks
- [@seamless-scroll/react](./packages/react/README.md) - React组件和Hooks
- [@seamless-scroll/shared](./packages/shared/README.md) - 共享内容

请查看各包的README了解详细API和使用说明。

## 特点

- 🚀 **高性能**：优化的动画实现，确保平滑的滚动体验
- 🔄 **无缝循环**：内容自动克隆，实现真正无缝的循环滚动
- 🎮 **丰富控制**：启动、停止、暂停、恢复等全面控制方法
- 🎯 **智能克隆**：自动计算所需的最小克隆数量，提高性能
- 🖱️ **交互支持**：鼠标悬停暂停、点击事件等用户交互功能
- ⚙️ **灵活配置**：自定义速度、方向、动画持续时间等参数
- 🛠️ **框架支持**：同时支持 Vue 3 和 React 框架
- 📱 **响应式**：自动适应容器尺寸变化
- 🔍 **类型支持**：完整的 TypeScript 类型定义

## 快速开始

### 安装

```bash
# Vue版本
npm install @seamless-scroll/vue

# React版本
npm install @seamless-scroll/react

# 核心包（框架无关）
npm install @seamless-scroll/core
```

详细的安装指南请参考各子包的README文档。

## 使用示例

简单示例展示：

### Vue

```vue
<script setup>
import { ref } from "vue";
import { SeamlessScroll } from "@seamless-scroll/vue";

const items = ref([
  { id: 1, text: "项目1" },
  { id: 2, text: "项目2" },
  { id: 3, text: "项目3" },
]);
</script>

<template>
  <SeamlessScroll :data="items">
    <template #default="{ item }">
      <div class="scroll-item">{{ item.text }}</div>
    </template>
  </SeamlessScroll>
</template>
```

### React

```jsx
import { useState } from "react";
import { SeamlessScroll } from "@seamless-scroll/react";

function App() {
  const [items, setItems] = useState([
    { id: 1, text: "项目1" },
    { id: 2, text: "项目2" },
    { id: 3, text: "项目3" },
  ]);

  return <SeamlessScroll data={items} />;
}
```

更多详细示例和API说明请查看：

- [Vue 组件文档](./packages/vue/README.md)
- [React 组件文档](./packages/react/README.md)
- [核心功能文档](./packages/core/README.md)

你也可以在本地运行示例：

```bash
# 克隆仓库
git clone https://github.com/yeyunwen/seamless-scroll.git
cd seamless-scroll

# 安装依赖
pnpm install

# 运行 Vue 示例
cd examples/vue
pnpm dev

# 运行 React 示例
cd examples/react
pnpm dev
```

## 项目结构

本项目采用 monorepo 结构，使用 pnpm workspace 管理多个包：

```
seamless-scroll/
├── packages/
│   ├── core/         # 核心滚动功能实现
│   ├── shared/       # 共享工具函数和类型
│   ├── vue/          # Vue 3 组件和 Hooks
│   └── react/        # React 组件和 Hooks
├── examples/         # 示例应用
│   ├── vue/          # Vue 示例
│   └── react/        # React 示例
└── docs/            # 文档网站
```

## 开发指南

### 环境准备

确保已安装以下工具：

- Node.js (v18+)
- pnpm (v10+)

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/yeyunwen/seamless-scroll.git
cd seamless-scroll

# 安装依赖
pnpm install
```

### 开发命令

```bash
# 开发 Vue 组件
pnpm dev:vue

# 构建核心包
pnpm build:core

# 构建 Vue 包
pnpm build:vue

# 检查类型
pnpm typecheck

# 运行 lint
pnpm lint

# 格式化代码
pnpm format
```

### 发布流程

本项目使用 [Changesets](https://github.com/changesets/changesets) 管理版本和发布：

1. 创建变更记录：`pnpm changeset`
2. 更新版本号：`pnpm changeset version`
3. 发布包：`pnpm changeset publish`

## 浏览器支持

- Chrome
- Firefox
- Safari
- Edge

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议！

1. Fork 仓库
2. 创建特性分支: `git checkout -b my-new-feature`
3. 提交更改: `git commit -m 'feat: 添加新特性'`
4. 推送分支: `git push origin my-new-feature`
5. 提交 Pull Request

## 许可证

MIT
