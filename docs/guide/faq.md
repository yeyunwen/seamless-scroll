# FAQ / 故障排查

## 为什么没有滚动？

优先检查三点：

1. `data` 是否为空。
2. 容器是否有明确宽高。
3. 内容是否超过容器；如果未超过但仍希望滚动，请设置 `forceScrolling`。

## 容器必须有宽高吗？

是。组件依赖容器尺寸计算滚动距离和克隆数量。推荐设置 `containerHeight` / `containerWidth`，或确保父级 CSS 能让默认 `100%` 生效。

## 内容未超出容器时如何强制滚动？

设置：

```vue
<SeamlessScroll :data="items" forceScrolling />
```

```tsx
<SeamlessScroll data={items} forceScrolling />
```

## 横向滚动为什么不连续？

横向滚动时每个 item 应有可测量宽度。固定宽度列表建议设置 `itemSize`，并确保 item 样式不会被压缩到 0。

## 虚拟滚动什么时候启用？

默认 `virtual="auto"`。只有当数据量达到 `virtualThreshold`（默认 100）、内容超过容器，并且提供 `itemSize` 或 `minItemSize` 时才启用。

- 固定尺寸：设置 `itemSize`，推荐生产使用。
- 动态尺寸：设置 `minItemSize`，当前为 experimental。
- 不想启用：设置 `virtual={false}` / `:virtual="false"`。
