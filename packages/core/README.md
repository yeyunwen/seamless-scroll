# @seamless-scroll/core

无缝滚动的核心功能实现，提供与框架无关的滚动逻辑。

[![npm version](https://img.shields.io/npm/v/@seamless-scroll/core.svg?style=flat)](https://www.npmjs.com/package/@seamless-scroll/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 介绍

`@seamless-scroll/core` 提供了实现无缝滚动所需的全部核心逻辑，包括:

- 滚动状态管理
- 滚动动画控制
- 尺寸计算
- 智能克隆数量计算
- 事件处理

此包可以直接使用，也可以作为构建更高级UI组件的基础。

## 安装

```bash
npm install @seamless-scroll/core
# 或
pnpm add @seamless-scroll/core
# 或
yarn add @seamless-scroll/core
```

## API 文档

### createSeamlessScroll 函数

这是核心包的主要入口函数，用于创建无缝滚动实例。

#### 参数

```typescript
function createSeamlessScroll(
  container: HTMLElement,
  content: HTMLElement,
  realList: HTMLElement,
  options?: ScrollOptions,
  events?: ScrollEvents,
  onStateChange?: (state: ScrollState) => void,
): SeamlessScrollResult;
```

- `container`: 容器元素，通常是有固定尺寸且溢出隐藏的外部容器
- `content`: 内容元素，包含需要滚动的实际内容
- `realList`: 滚动内容元素，包含需要滚动的实际内容
- `options`: 滚动配置选项，可选
- `events`: 事件回调函数，可选
- `onStateChange`: 状态改变时的回调，可选

#### 返回值

函数返回一个包含以下属性的对象：

- `state`: 只读的滚动状态对象
- `methods`: 控制滚动的方法集合
- `destroy`: 销毁滚动实例的函数

### 配置选项 (ScrollOptions)

| 参数             | 类型                           | 默认值       | 描述                               |
| ---------------- | ------------------------------ | ------------ | ---------------------------------- |
| `direction`      | `'vertical'` \| `'horizontal'` | `'vertical'` | 滚动方向                           |
| `speed`          | `number`                       | `60`         | 滚动速度（像素/秒）                |
| `duration`       | `number`                       | `1000`       | 每次滚动动画的持续时间（毫秒）     |
| `pauseTime`      | `number`                       | `0`          | 每次滚动后的暂停时间（毫秒）       |
| `hoverPause`     | `boolean`                      | `true`       | 是否在鼠标悬停时暂停               |
| `autoScroll`     | `boolean`                      | `true`       | 是否自动开始滚动                   |
| `step`           | `number`                       | `0`          | 滚动步长，0表示自动计算            |
| `forceScrolling` | `boolean`                      | `false`      | 是否强制滚动（即使内容未超出容器） |

### 状态对象 (ScrollState)

| 属性             | 类型      | 描述         |
| ---------------- | --------- | ------------ |
| `isScrolling`    | `boolean` | 是否正在滚动 |
| `isPaused`       | `boolean` | 是否暂停     |
| `isHovering`     | `boolean` | 鼠标是否悬停 |
| `scrollDistance` | `number`  | 滚动距离     |
| `contentSize`    | `number`  | 内容尺寸     |
| `containerSize`  | `number`  | 容器尺寸     |
| `isScrollNeeded` | `boolean` | 是否需要滚动 |
| `minClones`      | `number`  | 最小克隆数量 |

### 方法对象 (ScrollMethods)

| 方法                     | 描述         |
| ------------------------ | ------------ |
| `start()`                | 开始滚动     |
| `stop()`                 | 停止滚动     |
| `pause()`                | 暂停滚动     |
| `resume()`               | 恢复滚动     |
| `reset()`                | 重置滚动位置 |
| `forceScroll()`          | 强制开始滚动 |
| `updateSize()`           | 更新尺寸计算 |
| `updateOptions(options)` | 更新配置参数 |

### 事件回调 (ScrollEvents)

| 事件          | 参数                                            | 描述             |
| ------------- | ----------------------------------------------- | ---------------- |
| `onScroll`    | `(distance: number, direction: string) => void` | 滚动事件回调     |
| `onItemClick` | `(item: any, index: number) => void`            | 点击项目时的回调 |

## 基本用法

也可以查看Github上的[exmaples](https://github.com/yeyunwen/seamless-scroll/blob/main/examples/core/index.html)。

```js
import { createSeamlessScroll } from "@seamless-scroll/core";

// 获取DOM元素
const container = document.querySelector(".scroll-container");
const content = document.querySelector(".scroll-content");
const realList = document.querySelector(".real-list");

// 创建无缝滚动实例
const { state, methods, destroy } = createSeamlessScroll(
  container,
  content,
  realList,
  {
    direction: "vertical",
    speed: 60,
    hoverPause: true,
  },
  {
    onScroll: (distance, direction) => {
      console.log(`滚动距离: ${distance}`);
    },
    onItemClick: (item, index) => {
      console.log(`点击了第 ${index} 项`, item);
    },
  },
);

// 控制滚动
methods.start(); // 开始滚动
methods.pause(); // 暂停滚动
methods.resume(); // 恢复滚动
methods.stop(); // 停止滚动

// 访问状态
console.log("内容尺寸:", state.contentSize);
console.log("容器尺寸:", state.containerSize);
console.log("是否需要滚动:", state.isScrollNeeded);

// 更新配置
methods.updateOptions({ speed: 100 });

// 销毁实例
destroy();
```

## 许可证

MIT
