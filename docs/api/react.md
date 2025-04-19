# React API

`@seamless-scroll/react` 提供了React组件和Hook，用于在React应用中实现无缝滚动效果。

## 组件

### 属性

| 属性名            | 类型                                           | 默认值       | 说明                                                            |
| ----------------- | ---------------------------------------------- | ------------ | --------------------------------------------------------------- |
| `direction`       | `String`                                       | `'vertical'` | 滚动方向，可选值：`'vertical'`（垂直）或 `'horizontal'`（水平） |
| `speed`           | `Number`                                       | `50`         | 滚动速度（像素/秒）                                             |
| `duration`        | `Number`                                       | `500`        | 每次滚动动画的持续时间（毫秒）                                  |
| `pauseTime`       | `Number`                                       | `2000`       | 每次滚动后的暂停时间（毫秒）                                    |
| `hoverPause`      | `Boolean`                                      | `true`       | 是否在鼠标悬停时暂停滚动                                        |
| `autoScroll`      | `Boolean`                                      | `true`       | 是否自动开始滚动                                                |
| `forceScrolling`  | `Boolean`                                      | `false`      | 是否强制滚动（即使内容未超出容器）                              |
| `data`            | `Array`                                        | **必填**     | 要显示的数据数组                                                |
| `containerHeight` | `String\|Number`                               | `'100%'`     | 容器高度，支持像素值或CSS单位                                   |
| `containerWidth`  | `String\|Number`                               | `'100%'`     | 容器宽度，支持像素值或CSS单位                                   |
| `customClass`     | `String`                                       | -            | 自定义容器CSS类名                                               |
| `style`           | `Object`                                       | -            | 自定义容器style                                                 |
| `onItemClick`     | `(item, index) => void`                        | -            | 当列表项被点击时触发，参数为点击的数据项和索引                  |
| `children`        | `{ item, index } => ReactNode \| ReactElement` | -            | 自定义列表项的渲染方式                                          |
| `emptyRender`     | `ReactNode`                                    | "无数据"     | 当数据为空时显示的内容                                          |

### 方法

通过组件 `ref` 可以访问以下方法：

| 方法名          | 参数                                              | 返回值 | 说明                       |
| --------------- | ------------------------------------------------- | ------ | -------------------------- |
| `start`         | -                                                 | `void` | 开始滚动                   |
| `stop`          | -                                                 | `void` | 停止滚动                   |
| `pause`         | -                                                 | `void` | 暂停滚动                   |
| `resume`        | -                                                 | `void` | 恢复滚动                   |
| `reset`         | -                                                 | `void` | 重置滚动状态               |
| `forceScroll`   | -                                                 | `void` | 强制开始滚动               |
| `updateSize`    | -                                                 | `void` | 更新容器和列表容器尺寸计算 |
| `setObserver`   | `(container: HTMLElement, realList: HTMLElement)` | `void` | 更新容器和列表内容尺寸计算 |
| `clearObserver` | -                                                 | `void` | 清除观察者                 |
| `resetObserver` | -                                                 | `void` | 重置观察者以观察最新的 DOM |
