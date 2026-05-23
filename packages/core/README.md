# @seamless-scroll/core

无缝滚动的框架无关核心包，负责滚动状态、尺寸计算、动画控制、悬停暂停、滚轮手动滚动、克隆数量和虚拟滚动范围计算。

[![npm version](https://img.shields.io/npm/v/@seamless-scroll/core.svg?style=flat)](https://www.npmjs.com/package/@seamless-scroll/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 安装

```bash
npm install @seamless-scroll/core
# 或
pnpm add @seamless-scroll/core
# 或
yarn add @seamless-scroll/core
```

## API

### createSeamlessScroll

```ts
function createSeamlessScroll(
  containerEl: HTMLElement | (() => HTMLElement | null),
  contentEl: HTMLElement | (() => HTMLElement | null),
  realListEl: HTMLElement | (() => HTMLElement | null),
  options: ScrollOptions,
  onStateChange?: () => [(state: ScrollState) => void, (keyof ScrollState)[]],
): SeamlessScrollResult;
```

- `containerEl`：外层容器，通常需要固定宽高和 `overflow: hidden`。
- `contentEl`：执行 `transform` 的滚动内容容器。
- `realListEl`：真实列表内容，用于测量内容尺寸。
- `options`：滚动配置。
- `onStateChange`：可选状态订阅器，返回回调和需要监听的状态字段。

### ScrollOptions

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `dataTotal` | `number` | 必填 | 数据总数 |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | 滚动方向 |
| `reverse` | `boolean` | `false` | 是否反向滚动 |
| `speed` | `number` | `50` | 滚动速度，单位 px/s |
| `duration` | `number` | `500` | 单轮动画持续时间，单位 ms |
| `pauseTime` | `number` | `2000` | 单轮动画后的暂停时间，单位 ms |
| `hoverPause` | `boolean` | `true` | 鼠标悬停时是否暂停 |
| `wheelScroll` | `boolean` | `true` | 悬停暂停时是否允许滚轮手动滚动 |
| `autoScroll` | `boolean` | `true` | 初始化后是否自动开始滚动 |
| `forceScrolling` | `boolean` | `true` | 内容未超出容器时是否仍强制滚动 |
| `virtual` | `boolean \| 'auto'` | `'auto'` | 虚拟滚动模式 |
| `virtualThreshold` | `number` | `100` | `auto` 模式下启用虚拟滚动的最小数据量 |
| `virtualScrollBuffer` | `number` | `5` | 虚拟滚动前后缓冲项数 |
| `itemSize` | `number` | - | 固定项目尺寸，稳定虚拟滚动推荐使用 |
| `minItemSize` | `number` | - | 最小项目尺寸，用于动态尺寸虚拟滚动（experimental） |

### 虚拟滚动行为

- `virtual=false`：永不启用虚拟滚动。
- `virtual=true`：强制启用；必须提供 `itemSize` 或 `minItemSize`，否则抛出明确错误。
- `virtual='auto'`：仅当 `dataTotal >= virtualThreshold`、内容超出容器且提供了 `itemSize` 或 `minItemSize` 时启用；缺少尺寸配置会回退为非虚拟滚动并输出 warning。
- 固定尺寸模式（`itemSize`）是稳定能力；动态尺寸模式（`minItemSize` + 测量缓存）仍为 experimental。

### ScrollMethods

| 方法 | 描述 |
| --- | --- |
| `start()` | 开始滚动 |
| `stop()` | 停止滚动 |
| `pause()` | 暂停滚动 |
| `resume()` | 恢复滚动 |
| `reset()` | 重置滚动位置 |
| `forceScroll()` | 开启强制滚动并尝试开始滚动 |
| `updateSize()` | 重新测量容器和内容尺寸 |
| `updateOptions(options)` | 更新配置 |
| `setObserver(container, realList)` | 设置尺寸观察器 |
| `clearObserver()` | 清除尺寸观察器 |
| `resetObserver()` | 使用当前 DOM 重置尺寸观察器 |
| `updateItemSizeList(index, size, type?)` | 更新动态尺寸缓存 |
| `predictItemSize(index, type?)` | 预测项目尺寸 |
| `getVirtualCloneRange()` | 获取虚拟克隆列表的闭区间范围 `{ startIndex, endIndex }` |

## 基本用法

```ts
import { createSeamlessScroll } from "@seamless-scroll/core";

const instance = createSeamlessScroll(container, content, realList, {
  dataTotal: items.length,
  direction: "vertical",
  speed: 60,
  itemSize: 40,
});

instance.methods.pause();
instance.methods.resume();
instance.methods.updateOptions({ speed: 100 });
instance.destroy();
```

## 许可证

MIT
