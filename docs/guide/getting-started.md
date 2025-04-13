# 快速开始

本指南将帮助你快速上手 Seamless Scroll，实现一个基本的无缝滚动效果。

## 安装

::: code-group

```bash [npm]
npm install @seamless-scroll/react # React版本
# 或
npm install @seamless-scroll/vue # Vue版本
```

```bash [pnpm]
pnpm add @seamless-scroll/react # React版本
# 或
pnpm add @seamless-scroll/vue # Vue版本
```

```bash [yarn]
yarn add @seamless-scroll/react # React版本
# 或
yarn add @seamless-scroll/vue # Vue版本
```

:::

## 基本使用

### React

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
    <div className="app">
      <h1>无缝滚动示例</h1>
      <SeamlessScroll data={items} onItemClick={handleItemClick} />
    </div>
  );
}

export default App;
```

### Vue

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
  <div class="app">
    <h1>无缝滚动示例</h1>
    <SeamlessScroll :data="items" @item-click="handleItemClick">
      <template #item="{ item }">
        <div class="scroll-item">{{ item.text }}</div>
      </template>
    </SeamlessScroll>
  </div>
</template>
```
