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
  /**
   * 项目点击事件处理
   * 注意：此事件由框架层处理，不依赖于核心包
   */
  onItemClick?: (item: any, index: number) => void;
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
  setObserver: (container: HTMLElement, content: HTMLElement) => void;
}
