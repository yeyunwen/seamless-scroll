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
  <SeamlessScroll
    :data="items"
    direction="vertical"
    :speed="60"
    :item-size="50"
    @item-click="handleItemClick"
  >
    <template #default="{ item }">
      <div class="scroll-item">{{ item.text }}</div>
    </template>
  </SeamlessScroll>
</template>
```

### 使用泛型（类型安全）

```vue
<script setup lang="ts">
import { ref } from "vue";
import { SeamlessScroll } from "@seamless-scroll/vue";

interface Announcement {
  id: number;
  text: string;
  date: string;
}

// 使用泛型指定数据类型
const items = ref<Announcement[]>([
  { id: 1, text: "公告1", date: "2023-01-01" },
  { id: 2, text: "公告2", date: "2023-01-02" },
  { id: 3, text: "公告3", date: "2023-01-03" },
]);

// 自动推断 item 为 Announcement 类型
const handleItemClick = (item: Announcement) => {
  console.log(`点击了公告: ${item.text}, 日期: ${item.date}`);
};
</script>
<template>
  <SeamlessScroll
    :data="items"
    direction="vertical"
    :speed="60"
    :item-size="50"
    @item-click="handleItemClick"
  >
    <!-- TypeScript 会自动推断 item 为 Announcement 类型 -->
    <template #default="{ item }">
      <div class="scroll-item">
        <div>{{ item.text }}</div>
        <div class="date">{{ item.date }}</div>
      </div>
    </template>
  </SeamlessScroll>
</template>
```

### 水平滚动

```vue
<template>
  <SeamlessScroll :data="items" direction="horizontal" :speed="40" :item-size="50">
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
    :item-size="50"
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

| 属性                  | 类型                                                       | 默认值       | 描述                                                   |
| --------------------- | ---------------------------------------------------------- | ------------ | ------------------------------------------------------ |
| `data`                | `T[]`                                                      | `[]`         | 要展示的数据列表（支持泛型类型T）                      |
| `direction`           | `'vertical'` \| `'horizontal'`                             | `'vertical'` | 滚动方向                                               |
| `speed`               | `number`                                                   | `50`         | 滚动速度（像素/秒）                                    |
| `duration`            | `number`                                                   | `500`        | 每次滚动动画的持续时间（毫秒）                         |
| `pauseTime`           | `number`                                                   | `2000`       | 每次滚动后的暂停时间（毫秒）                           |
| `hoverPause`          | `boolean`                                                  | `true`       | 是否在鼠标悬停时暂停                                   |
| `autoScroll`          | `boolean`                                                  | `true`       | 是否自动开始滚动                                       |
| `forceScrolling`      | `boolean`                                                  | `false`      | 是否强制滚动（即使内容未超出容器）                     |
| `containerHeight`     | `string \| number`                                         | `'100%'`     | 容器高度                                               |
| `containerWidth`      | `string \| number`                                         | `'100%'`     | 容器宽度                                               |
| `customClass`         | `string`                                                   | -            | 自定义CSS类名                                          |
| `style`               | `CSSProperties`                                            | -            | 自定义样式                                             |
| `itemSize`            | `number`                                                   | -            | 固定项目尺寸（像素），用于虚拟滚动计算                 |
| `minItemSize`         | `number`                                                   | -            | 最小项目尺寸（像素），用于变高度虚拟滚动               |
| `virtualScrollBuffer` | `number`                                                   | `5`          | 虚拟滚动缓冲区大小，值越大，滚动越平滑，但渲染项目更多 |
| `itemKey`             | `string \| ((item: T, index: number) => string \| number)` | -            | 项目键名或生成函数，用于列表项的唯一标识               |

### 组件事件

| 事件名       | 参数                       | 描述             |
| ------------ | -------------------------- | ---------------- |
| `item-click` | `(item: T, index: number)` | 点击列表项时触发 |

### 组件插槽

| 插槽名    | 插槽参数                     | 描述             |
| --------- | ---------------------------- | ---------------- |
| `default` | `{ item: T, index: number }` | 列表项的渲染插槽 |
| `empty`   | 无                           | 无数据时的插槽   |

### useSeamlessScroll Hook

#### 参数

```typescript
function useSeamlessScroll<T>(props: {
  dataTotal: number;
  direction?: "vertical" | "horizontal";
  speed?: number;
  duration?: number;
  pauseTime?: number;
  hoverPause?: boolean;
  autoScroll?: boolean;
  forceScrolling?: boolean;
  itemSize?: number;
  minItemSize?: number;
  virtualScrollBuffer?: number;
}): {
  containerRef: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  realListRef: Ref<HTMLElement | null>;
  state: Readonly<ScrollState>;
  methods: ScrollMethods;
  getVirtualItems: (data: T[]) => VirtualScrollItem<T>[];
};
```

#### 返回值

**state** - 滚动状态对象，包含以下属性：

| 属性             | 类型      | 描述             |
| ---------------- | --------- | ---------------- |
| `isScrolling`    | `boolean` | 是否正在滚动     |
| `isPaused`       | `boolean` | 是否暂停         |
| `isHovering`     | `boolean` | 鼠标是否悬停     |
| `isScrollNeeded` | `boolean` | 是否需要滚动     |
| `scrollDistance` | `number`  | 滚动距离         |
| `containerSize`  | `number`  | 容器尺寸         |
| `contentSize`    | `number`  | 内容尺寸         |
| `minClones`      | `number`  | 最小克隆数量     |
| `isVirtualized`  | `boolean` | 是否启用虚拟滚动 |
| `startIndex`     | `number`  | 虚拟滚动起始索引 |
| `endIndex`       | `number`  | 虚拟滚动结束索引 |
| `averageSize`    | `number`  | 平均项目尺寸     |

**methods** - 控制方法对象，包含以下方法：

| 方法                     | 描述               |
| ------------------------ | ------------------ |
| `start()`                | 开始滚动           |
| `stop()`                 | 停止滚动           |
| `pause()`                | 暂停滚动           |
| `resume()`               | 恢复滚动           |
| `reset()`                | 重置滚动位置       |
| `forceScroll()`          | 强制开始滚动       |
| `updateSize()`           | 更新尺寸计算       |
| `updateOptions(options)` | 更新配置参数       |
| `updateItemSizeList()`   | 更新指定项目的尺寸 |
| `predictItemSize()`      | 预测指定项目的尺寸 |
| `getVirtualCloneRange()` | 获取虚拟克隆范围   |

## 高级用法

### 使用 TypeScript 泛型提升类型安全性

```vue
<script setup lang="ts">
import { ref } from "vue";
import { SeamlessScroll } from "@seamless-scroll/vue";

// 定义您的数据类型
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

// SeamlessScroll 组件会自动根据传入的 data 推断类型
const products = ref<Product[]>([
  { id: 1, name: "商品1", price: 199, imageUrl: "/img/1.jpg" },
  { id: 2, name: "商品2", price: 299, imageUrl: "/img/2.jpg" },
  { id: 3, name: "商品3", price: 399, imageUrl: "/img/3.jpg" },
]);

// item 会被推断为 Product 类型
const handleItemClick = (item: Product, index: number) => {
  console.log(`点击了商品: ${item.name}, 价格: ${item.price}`);
};
</script>

<template>
  <SeamlessScroll :data="products" direction="horizontal" :speed="40" @item-click="handleItemClick">
    <!-- item 会有完整的类型提示 -->
    <template #default="{ item, index }">
      <div class="product-card">
        <img :src="item.imageUrl" :alt="item.name" />
        <h3>{{ item.name }}</h3>
        <p>¥{{ item.price }}</p>
      </div>
    </template>
  </SeamlessScroll>
</template>
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
    scrollRef.value[action]();
  }
}
</script>
```

### 虚拟滚动

SeamlessScroll 组件支持虚拟滚动，特别适用于大数据量渲染场景。当列表项较多时（通常超过 50 项），组件会自动启用虚拟滚动，仅渲染可见区域内的项目，显著提升渲染性能。

#### 如何使用虚拟滚动

虚拟滚动有两种模式：

1. **固定高度模式**：设置 `itemSize` 属性，每个项的高度相同
2. **动态高度模式**：不设置 `itemSize`，但需要设置 `minItemSize`，组件会动态测量并记忆每个项的实际高度

```vue
<template>
  <!-- 固定高度虚拟滚动 -->
  <SeamlessScroll :data="largeDataset" :itemSize="80" :virtualScrollBuffer="8">
    <template #default="{ item }">
      <div class="item">{{ item.content }}</div>
    </template>
  </SeamlessScroll>

  <!-- 动态高度虚拟滚动 -->
  <SeamlessScroll :data="mixedHeightData" :minItemSize="50" :virtualScrollBuffer="10">
    <template #default="{ item }">
      <div class="item" :style="{ height: item.height + 'px' }">
        {{ item.content }}
      </div>
    </template>
  </SeamlessScroll>
</template>
```

#### 性能优化

对于动态高度模式，组件会：

1. 实时测量每个显示项的实际高度
2. 记录每种类型项目的平均高度（如果项目有 `type` 属性）
3. 智能预测尚未渲染项目的高度
4. 使用二分查找算法快速定位滚动位置

```vue
<script setup lang="ts">
interface Card {
  id: number;
  type: "small" | "medium" | "large"; // 组件会自动统计不同type的平均高度
  content: string;
}

const cards = ref<Card[]>([
  { id: 1, type: "small", content: "小卡片" },
  { id: 2, type: "medium", content: "中等卡片内容较多" },
  { id: 3, type: "large", content: "大卡片有很多内容..." },
  // ... 更多数据
]);
</script>

<template>
  <SeamlessScroll :data="cards" :minItemSize="50" itemKey="id">
    <template #default="{ item }">
      <div class="card" :class="item.type">
        {{ item.content }}
      </div>
    </template>
  </SeamlessScroll>
</template>
```

## 许可证

ISC
