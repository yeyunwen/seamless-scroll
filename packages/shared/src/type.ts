import type { ScrollOptions } from "@seamless-scroll/core";

/* 框架特定的类型 */
export interface SeamlessScrollProps<S = Record<string, any>> extends ScrollOptions {
  /* 数据源 */
  data: any[];
  /* 容器高度（像素或CSS值） */
  containerHeight?: number | string;
  /* 容器宽度（像素或CSS值） */
  containerWidth?: number | string;
  /* 自定义样式类名 */
  customClass?: string;
  /* 自定义样式 */
  style?: S;
}

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
}
