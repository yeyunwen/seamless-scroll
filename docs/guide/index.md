# 介绍

## 什么是 Seamless Scroll？

Seamless Scroll 是一个高性能、轻量级的无缝滚动组件库，支持 React 和 Vue 框架。它提供了一种简单易用的方式来实现各种滚动效果，如新闻公告、产品展示、图片轮播等。

## 特性

- 🚀 **高性能**：优化的滚动算法，即使在大量数据下也能保持流畅的性能
- 🔄 **无缝循环**：实现真正的无缝滚动效果，没有视觉中断或跳跃
- 🎛️ **可定制性**：丰富的配置选项，满足各种滚动需求和场景
- 📱 **响应式设计**：自动适应不同屏幕尺寸，提供一致的用户体验
- 🧩 **模块化设计**：核心逻辑与框架分离，提供统一的API和体验
- 🔍 **类型安全**：完整的TypeScript支持，提供智能提示和类型检查

## 包组成

Seamless Scroll 的源码由以下几个包组成：

- `@seamless-scroll/core`：核心滚动逻辑，框架无关
- `@seamless-scroll/react`：React组件和Hooks
- `@seamless-scroll/vue`：Vue组件和Composables
- `@seamless-scroll/shared`：共享的工具和类型

## 多框架设计方案

我们采用了基于 Monorepo 的分层架构设计，使组件能够在多种前端框架中无缝使用。

### 架构说明

1. **核心层 (@seamless-scroll/core)**

   - 实现与框架无关的滚动逻辑和状态管理
   - 提供 DOM 操作和动画控制的核心功能
   - 负责性能优化和滚动算法实现

2. **共享层 (@seamless-scroll/shared)**

   - 提供所有包共用的类型定义
   - 确保各层之间类型一致性

3. **框架层**

   - **Vue (@seamless-scroll/vue)**: 将核心逻辑封装为 Vue 组件
   - **React (@seamless-scroll/react)**: 将核心逻辑封装为 React 组件
   - 每个框架实现都遵循各自的最佳实践和设计模式
   - 专注于框架特定的生命周期和状态管理

### 框架适配实现

项目采用了"分离关注点"的设计原则，将框架包分为两个主要部分：

1. **Hooks 文件**：适配核心逻辑（core包）到框架（vue/react）状态管理，开发者也可以根据自己的需要使用hook来构建自己的组件
2. **组件文件**：专注于渲染、样式和事件处理

### 优势

- **代码复用**: 核心逻辑只需实现一次，多框架共享
- **一致性**: 确保各框架版本行为一致，同步更新
- **易维护**: 修改核心逻辑会自动反映到所有框架实现
- **可扩展**: 轻松支持更多框架，如 Angular、Svelte 等
- **类型安全**: TypeScript 贯穿整个架构，确保类型安全

### 技术实现细节

#### 包结构与职责

| 包名                        | 主要文件                | 职责                            |
| --------------------------- | ----------------------- | ------------------------------- |
| **@seamless-scroll/shared** | `types.ts`              | 定义通用接口、类型              |
| **@seamless-scroll/core**   | `seamlessScroll.ts`     | 实现滚动核心逻辑，DOM操作和动画 |
|                             | `types.ts`              | 定义核心功能的类型              |
| **@seamless-scroll/vue**    | `SeamlessScroll.vue`    | Vue 组件实现                    |
|                             | `useSeamlessScroll.ts`  | Vue Composition API Hook        |
| **@seamless-scroll/react**  | `SeamlessScroll.tsx`    | React 组件实现                  |
|                             | `useSeamlessScroll.tsx` | React Hook                      |

#### 关键技术

1. **无缝循环实现**

   - 使用克隆元素实现视觉上的无限循环
   - 智能计算所需的最小克隆数量
   - 当内容滚动到尽头时，无缝重置位置

2. **性能优化**

   - 使用 `requestAnimationFrame` 实现平滑动画
   - 使用 `ResizeObserver` 监听尺寸变化
   - 基于速度的动画计算，确保跨设备一致性
   - Transform 动画而非位置动画，启用硬件加速

3. **响应式设计**
   - 适应容器大小变化
   - 支持横向和纵向滚动
   - 自动检测是否需要滚动
