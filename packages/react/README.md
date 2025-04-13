# @seamless-scroll/react

React 无缝滚动组件，提供高性能的内容滚动体验。

[![npm version](https://img.shields.io/npm/v/@seamless-scroll/react.svg?style=flat)](https://www.npmjs.com/package/@seamless-scroll/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## 介绍

`@seamless-scroll/react` 提供了一个易用的 React 组件和 Hook，用于实现无缝滚动效果。适用于公告、列表、轮播等场景。

## 安装

```bash
npm install @seamless-scroll/react
# 或
pnpm add @seamless-scroll/react
# 或
yarn add @seamless-scroll/react
```

## 组件用法

更多内容可以查看Github上的[examples。](https://github.com/yeyunwen/seamless-scroll/tree/main/examples/react)

### 基本用法

```jsx
import { useState } from "react";
import { SeamlessScroll } from "@seamless-scroll/react";

function App() {
  const [items, setItems] = useState([
    { id: 1, text: "公告1" },
    { id: 2, text: "公告2" },
    { id: 3, text: "公告3" },
  ]);

  const handleItemClick = (item) => {
    console.log("点击了项目:", item);
  };

  return (
    <SeamlessScroll data={items} direction="vertical" speed={60} onItemClick={handleItemClick} />
  );
}

export default App;
```

### 水平滚动

```jsx
<SeamlessScroll data={items} direction="horizontal" speed={40} />
```

## API 文档

### 组件 Props

| 属性              | 类型                                            | 默认值       | 描述                               |
| ----------------- | ----------------------------------------------- | ------------ | ---------------------------------- |
| `data`            | `Array<T>`                                      | `[]`         | 要展示的数据列表                   |
| `direction`       | `'vertical'` \| `'horizontal'`                  | `'vertical'` | 滚动方向                           |
| `speed`           | `number`                                        | `60`         | 滚动速度（像素/秒）                |
| `duration`        | `number`                                        | `1000`       | 每次滚动动画的持续时间（毫秒）     |
| `pauseTime`       | `number`                                        | `0`          | 每次滚动后的暂停时间（毫秒）       |
| `hoverPause`      | `boolean`                                       | `true`       | 是否在鼠标悬停时暂停               |
| `autoScroll`      | `boolean`                                       | `true`       | 是否自动开始滚动                   |
| `step`            | `number`                                        | `0`          | 滚动步长，0表示自动计算            |
| `forceScrolling`  | `boolean`                                       | `false`      | 是否强制滚动（即使内容未超出容器） |
| `containerHeight` | `string \| number`                              | `'100%'`     | 容器高度                           |
| `containerWidth`  | `string \| number`                              | `'100%'`     | 容器宽度                           |
| `className`       | `string`                                        |              | 容器元素的自定义类名               |
| `style`           | `CSSProperties`                                 | -            | 容器元素的自定义样式               |
| `customClass`     | `string`                                        | -            | 自定义CSS类名                      |
| `onScroll`        | `(distance: number, direction: string) => void` | -            | 滚动事件回调                       |
| `onItemClick`     | `(item: T, index: number) => void`              | -            | 点击项目时的回调函数               |

### useSeamlessScroll Hook

#### 参数

```typescript
function useSeamlessScroll(props: {
  data: any[];
  direction?: "vertical" | "horizontal";
  speed?: number;
  duration?: number;
  pauseTime?: number;
  hoverPause?: boolean;
  autoScroll?: boolean;
  step?: number;
  forceScrolling?: boolean;
  containerHeight?: string | number;
  containerWidth?: string | number;
  onScroll?: (distance: number, direction: string) => void;
  onItemClick?: (item: any, index: number) => void;
  customClass?: string;
  style?: React.CSSProperties;
}): {
  containerRef: React.RefObject<HTMLDivElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  realListRef: React.RefObject<HTMLDivElement>;
  state: Readonly<ScrollState>;
  methods: ScrollMethods;
  styles: () => ReactSeamlessScrollStyles;
};
```

#### 返回值

**state** - 滚动状态对象，包含以下属性：

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

**methods** - 控制方法对象，包含以下方法：

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

## 许可证

MIT
