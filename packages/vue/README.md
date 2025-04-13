# @seamless-scroll/vue

Vue 3 无缝滚动组件，基于 Composition API 构建。

[![npm version](https://img.shields.io/npm/v/@seamless-scroll/vue.svg?style=flat)](https://www.npmjs.com/package/@seamless-scroll/vue)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen)](https://vuejs.org/)

## 介绍

`@seamless-scroll/vue` 提供了一个易用的 Vue 3 组件和 Composition API Hook，用于实现无缝滚动效果。适用于公告、列表、轮播等场景。

## 安装

```bash
npm install @seamless-scroll/vue
# 或
pnpm add @seamless-scroll/vue
# 或
yarn add @seamless-scroll/vue
```

## 组件用法

更多内容可以查看Github上的[examples。](https://github.com/yeyunwen/seamless-scroll/tree/main/examples/vue)

### 基本用法

```vue
<script setup>
import { ref } from "vue";
import { SeamlessScroll } from "@seamless-scroll/vue";

const items = ref([
  { id: 1, text: "公告1" },
  { id: 2, text: "公告2" },
  { id: 3, text: "公告3" },
]);

const handleItemClick = (item) => {
  console.log("点击了项目:", item);
};
</script>
<template>
  <SeamlessScroll :data="items" direction="vertical" :speed="60" @item-click="handleItemClick">
    <template #default="{ item }">
      <div class="scroll-item">{{ item.text }}</div>
    </template>
  </SeamlessScroll>
</template>
```

### 水平滚动

```vue
<template>
  <SeamlessScroll :data="items" direction="horizontal" :speed="40">
    <template #default="{ item }">
      <div class="scroll-item">{{ item.text }}</div>
    </template>
  </SeamlessScroll>
</template>
```

### 配置多个选项

```vue
<template>
  <SeamlessScroll
    :data="items"
    direction="vertical"
    :speed="50"
    :hoverPause="true"
    :pauseTime="1000"
    :duration="500"
    :autoScroll="true"
    :forceScrolling="false"
  >
    <template #default="{ item }">
      <div class="scroll-item">{{ item.text }}</div>
    </template>
  </SeamlessScroll>
</template>
```

## API 文档

### 组件 Props

| 属性              | 类型                           | 默认值       | 描述                               |
| ----------------- | ------------------------------ | ------------ | ---------------------------------- |
| `data`            | `Array<any>`                   | `[]`         | 要展示的数据列表                   |
| `direction`       | `'vertical'` \| `'horizontal'` | `'vertical'` | 滚动方向                           |
| `speed`           | `number`                       | `60`         | 滚动速度（像素/秒）                |
| `duration`        | `number`                       | `1000`       | 每次滚动动画的持续时间（毫秒）     |
| `pauseTime`       | `number`                       | `0`          | 每次滚动后的暂停时间（毫秒）       |
| `hoverPause`      | `boolean`                      | `true`       | 是否在鼠标悬停时暂停               |
| `autoScroll`      | `boolean`                      | `true`       | 是否自动开始滚动                   |
| `step`            | `number`                       | `0`          | 滚动步长，0表示自动计算            |
| `forceScrolling`  | `boolean`                      | `false`      | 是否强制滚动（即使内容未超出容器） |
| `containerHeight` | `string \| number`             | `'100%'`     | 容器高度                           |
| `containerWidth`  | `string \| number`             | `'100%'`     | 容器宽度                           |
| `customClass`     | `string`                       | -            | 自定义CSS类名                      |
| `style`           | `CSSProperties`                | -            | 自定义样式                         |

### 组件事件

| 事件名       | 参数                         | 描述             |
| ------------ | ---------------------------- | ---------------- |
| `item-click` | `(item: any, index: number)` | 点击列表项时触发 |

### 组件插槽

| 插槽名    | 插槽参数                       | 描述             |
| --------- | ------------------------------ | ---------------- |
| `default` | `{ item: any, index: number }` | 列表项的渲染插槽 |
| `empty`   | 无                             | 无数据时的插槽   |

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
  customClass?: string;
  style?: CSSProperties;
}): {
  state: Readonly<ScrollState>;
  methods: ScrollMethods;
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

## 高级用法

### 监听滚动事件

```vue
<script setup>
const { state, methods } = useSeamlessScroll({
  data: items.value,
  direction: "vertical",
  speed: 60,
  onScroll: (distance, direction) => {
    console.log(`滚动距离: ${distance}, 方向: ${direction}`);
  },
});
</script>
```

### 控制组件实例

```vue
<template>
  <SeamlessScroll ref="scrollRef" :data="items">
    <template #default="{ item }">
      <div class="scroll-item">{{ item.text }}</div>
    </template>
  </SeamlessScroll>
  <button @click="controlScroll('start')">开始</button>
  <button @click="controlScroll('stop')">停止</button>
</template>

<script setup>
import { ref } from "vue";
import { SeamlessScroll } from "@seamless-scroll/vue";

const scrollRef = ref(null);

function controlScroll(action) {
  if (scrollRef.value) {
    scrollRef.value.methods[action]();
  }
}
</script>
```

## 许可证

ISC
