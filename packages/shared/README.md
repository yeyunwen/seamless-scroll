# @seamless-scroll/shared

无缝滚动组件库的共享工具和类型定义。

[![npm version](https://img.shields.io/npm/v/@seamless-scroll/shared.svg?style=flat)](https://www.npmjs.com/package/@seamless-scroll/shared)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 介绍

`@seamless-scroll/shared` 提供了 Seamless Scroll 组件库中各个包共用的内容。这个包主要供内部使用。

## 包含内容

### 通用类型定义

- `SeamlessScrollProps<T>` - 基础组件属性，支持泛型
- `VirtualScrollItem<T>` - 虚拟滚动项目类型
- `SeamlessScrollStyles` - 组件样式类型

### 虚拟滚动类型

- `VirtualScrollItem<T>` - 虚拟滚动项目类型，带有 `_originalIndex` 属性

### 泛型支持

所有类型都支持泛型 `<T>` 参数，例如：

```typescript
interface ListItem {
  id: number;
  title: string;
  content: string;
}

// 使用泛型指定数据类型
const props: SeamlessScrollProps<ListItem> = {
  data: myListItems,
  direction: "vertical",
  // 其他属性...
};
```

## 注意事项

- 此包主要供 `@seamless-scroll` 系列包内部使用
- 包的API可能会在不同版本间变化，请确保使用匹配的版本
- 当从此包导入类型时，使用 `import type { ... }` 语法以避免不必要的运行时导入

## 许可证

ISC
