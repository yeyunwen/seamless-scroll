# @seamless-scroll/shared

## 0.2.0

### Minor Changes

- ## feat

  1. 支持虚拟滚动。当readList的大小超过container容器是会自动开启虚拟滚动。

- 95f77df: ## feat

  1. 添加resetObserver，重置并重新观察 DOM

### Patch Changes

- Updated dependencies
- Updated dependencies [95f77df]
  - @seamless-scroll/core@0.2.0

## 0.1.2

### Patch Changes

- 747e131: packages/core: 移除Events。
  packages/vue: 优化类型定义，传值。
- 1b67443: fix: 通过支持以函数获取 dom 的方式解决 core 包无法活动最新 dom 的问题，通过 setObserver 和 clearObeserver 解决 Observer观察无效 dom 的问题
- Updated dependencies [747e131]
- Updated dependencies [1b67443]
  - @seamless-scroll/core@0.1.2

## 0.1.1

### Patch Changes

- 240053b: 添加README.md
- Updated dependencies [240053b]
  - @seamless-scroll/core@0.1.1

## 0.1.0

### Minor Changes

- 80dd394: 首次发布 Seamless Scroll 组件库，包含:

  - 核心滚动功能，支持自动和手动控制
  - 共享类型系统，确保跨框架一致性
  - Vue 组件实现，支持 Vue 3
  - React 组件实现，支持最新的 React
  - 支持垂直和水平滚动方向
  - 自定义滚动速度、暂停行为和其他选项
  - 响应式尺寸调整，自动处理内容变化

### Patch Changes

- Updated dependencies [80dd394]
  - @seamless-scroll/core@0.1.0
