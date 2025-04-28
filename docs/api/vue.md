# Vue API

`@seamless-scroll/vue` 提供了Vue组件和Composables，用于在Vue应用中实现无缝滚动效果。

## 组件

### SeamlessScroll 组件

SeamlessScroll 组件现在支持泛型类型 `<T>`，使数据项获得完整的类型推断。当您传入数据数组时，TypeScript 会自动推断 `item` 的类型。

### 属性

| 属性名                | 类型               | 默认值       | 说明                                                            |
| --------------------- | ------------------ | ------------ | --------------------------------------------------------------- |
| `direction`           | `String`           | `'vertical'` | 滚动方向，可选值：`'vertical'`（垂直）或 `'horizontal'`（水平） |
| `speed`               | `Number`           | `50`         | 滚动速度（像素/秒）                                             |
| `duration`            | `Number`           | `500`        | 每次滚动动画的持续时间（毫秒）                                  |
| `pauseTime`           | `Number`           | `2000`       | 每次滚动后的暂停时间（毫秒）                                    |
| `hoverPause`          | `Boolean`          | `true`       | 是否在鼠标悬停时暂停滚动                                        |
| `autoScroll`          | `Boolean`          | `true`       | 是否自动开始滚动                                                |
| `forceScrolling`      | `Boolean`          | `false`      | 是否强制滚动（即使内容未超出容器）                              |
| `data`                | `T[]`              | **必填**     | 要显示的数据数组（支持泛型T）                                   |
| `containerHeight`     | `String\|Number`   | `'100%'`     | 容器高度，支持像素值或CSS单位                                   |
| `containerWidth`      | `String\|Number`   | `'100%'`     | 容器宽度，支持像素值或CSS单位                                   |
| `customClass`         | `String`           | -            | 自定义容器CSS类名                                               |
| `style`               | `Object`           | -            | 自定义容器style                                                 |
| `itemSize`            | `Number`           | -            | 固定项目尺寸（像素），用于虚拟滚动的固定高度模式                |
| `minItemSize`         | `Number`           | -            | 最小项目尺寸（像素），用于虚拟滚动的动态高度模式                |
| `virtualScrollBuffer` | `Number`           | `5`          | 虚拟滚动缓冲区大小，值越大滚动越平滑但渲染项目更多              |
| `itemKey`             | `String\|Function` | -            | 项目键名或函数 `(item: T, index: number) => string\|number`     |

### 事件

| 事件名      | 参数                       | 说明                                           |
| ----------- | -------------------------- | ---------------------------------------------- |
| `itemClick` | `(item: T, index: number)` | 当列表项被点击时触发，参数为点击的数据项和索引 |

### 插槽

| 插槽名    | 插槽属性                     | 说明                                            |
| --------- | ---------------------------- | ----------------------------------------------- |
| `default` | `{ item: T, index: number }` | 自定义列表项的渲染方式，item 具有完整的类型推断 |
| `empty`   | -                            | 当数据为空时显示的内容                          |

### 方法

通过组件 `ref` 可以访问以下方法：

| 方法名               | 参数                                              | 返回值   | 说明                       |
| -------------------- | ------------------------------------------------- | -------- | -------------------------- |
| `start`              | -                                                 | `void`   | 开始滚动                   |
| `stop`               | -                                                 | `void`   | 停止滚动                   |
| `pause`              | -                                                 | `void`   | 暂停滚动                   |
| `resume`             | -                                                 | `void`   | 恢复滚动                   |
| `reset`              | -                                                 | `void`   | 重置滚动状态               |
| `forceScroll`        | -                                                 | `void`   | 强制开始滚动               |
| `updateSize`         | -                                                 | `void`   | 更新容器和列表容器尺寸计算 |
| `setObserver`        | `(container: HTMLElement, realList: HTMLElement)` | `void`   | 更新容器和列表内容尺寸计算 |
| `clearObserver`      | -                                                 | `void`   | 清除观察者                 |
| `resetObserver`      | -                                                 | `void`   | 重置观察者以观察最新的 DOM |
| `updateItemSizeList` | `(index: number, size: number, type?: string)`    | `void`   | 更新指定索引项目的尺寸缓存 |
| `predictItemSize`    | `(index: number, type?: string)`                  | `number` | 预测指定索引项目的尺寸     |

## 虚拟滚动功能

`SeamlessScroll` 组件内置了高性能的虚拟滚动功能，适用于大数据量渲染场景。

### 虚拟滚动自动启用条件

- 当数据项数量较多时，组件会自动启用虚拟滚动
- 当内容尺寸明显大于容器尺寸时，也会自动启用

### 虚拟滚动模式

1. **固定高度模式**

   - 适用于所有项目高度相同的场景
   - 配置：设置 `itemSize` 属性为固定像素值

2. **动态高度模式**
   - 适用于项目高度不同的场景
   - 配置：设置 `minItemSize` 属性作为最小高度基准
   - 组件会自动测量和记忆每个项目的实际高度

### 相关类型

```typescript
export type VirtualScrollItem<T = any> = T & {
  _originalIndex: number; // 原始数据中的索引位置
};
```

## useSeamlessScroll Hook

`useSeamlessScroll` Hook 现在支持泛型类型 `<T>`，以便更好地与 TypeScript 集成：

```typescript
function useSeamlessScroll<T>(props: HooksProps): {
  containerRef: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  realListRef: Ref<HTMLElement | null>;
  state: ComputedRef<Readonly<ScrollState>>;
  methods: ScrollMethods;
  getVirtualItems: (data: T[]) => VirtualScrollItem<T>[];
};
```

### 相关状态字段

| 状态字段             | 类型       | 描述                     |
| -------------------- | ---------- | ------------------------ |
| `isVirtualized`      | `boolean`  | 是否启用了虚拟滚动       |
| `startIndex`         | `number`   | 当前可见区域的起始索引   |
| `endIndex`           | `number`   | 当前可见区域的结束索引   |
| `itemSizeList`       | `number[]` | 已测量的每个项目尺寸列表 |
| `averageSize`        | `number`   | 所有已测量项目的平均尺寸 |
| `totalMeasuredItems` | `number`   | 已测量的项目数量         |
| `typeSizes`          | `object`   | 按类型统计的尺寸信息     |

### 用法示例

```vue
<script setup lang="ts">
import { useSeamlessScroll } from "@seamless-scroll/vue";

interface Product {
  id: number;
  name: string;
  price: number;
}

const props = ref({
  dataTotal: products.value.length,
  speed: 50,
  direction: "vertical" as const,
});

// 使用泛型T明确类型
const { state, methods, getVirtualItems } = useSeamlessScroll<Product>(props.value);

// getVirtualItems 会返回 VirtualScrollItem<Product>[] 类型
const virtualProducts = computed(() => getVirtualItems(products.value));
</script>
```
