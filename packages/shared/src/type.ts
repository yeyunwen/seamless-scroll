import type { ScrollOptions } from "@seamless-scroll/core";

/* 框架特定的类型 */
export interface SeamlessScrollProps<T = any, S = Record<string, any>>
  extends Omit<ScrollOptions, "dataTotal"> {
  /* 数据源 */
  data: T[];
  /* 容器高度（像素或CSS值） */
  containerHeight?: number | string;
  /* 容器宽度（像素或CSS值） */
  containerWidth?: number | string;
  /* 自定义样式类名 */
  customClass?: string;
  /* 自定义样式 */
  style?: S;
  /* item key field or function */
  itemKey?: string | ((item: T, index: number) => string | number);
}

export type VirtualScrollItem<T = any> = T & {
  _originalIndex: number;
};

export interface SeamlessScrollStyles<T = Record<string, any>> {
  container: T;
  content: T;
  list: T;
  item: T;
  empty: T;
}

export interface SeamlessScrollRef {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  forceScroll: () => void;
  updateSize: () => void;
  setObserver: (container: HTMLElement, realList: HTMLElement) => void;
  resetObserver: () => void;
  clearObserver: () => void;
  updateItemSizeList: (index: number, size: number, type?: string) => void;
  predictItemSize: (index: number, type?: string) => number;
}
