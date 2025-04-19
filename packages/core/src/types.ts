export type ScrollDirection = "vertical" | "horizontal";

// DOM 元素或获取 DOM 元素的函数
export type ElementOrGetter = HTMLElement | (() => HTMLElement | null);

export interface ScrollOptions {
  /* 滚动方向：vertical（上下）或 horizontal（左右） */
  direction?: ScrollDirection;
  /* 滚动速度（像素/秒） */
  speed?: number;
  /* 每次滚动动画的持续时间（毫秒） */
  duration?: number;
  /* 每次滚动后的暂停时间（毫秒） */
  pauseTime?: number;
  /* 是否在鼠标悬停时暂停 */
  hoverPause?: boolean;
  /* 是否自动开始滚动 */
  autoScroll?: boolean;
  /* 是否强制滚动（即使内容未超出容器） */
  forceScrolling?: boolean;
}

export interface ScrollState {
  /* 是否正在滚动 */
  isScrolling: boolean;
  /* 是否暂停 */
  isPaused: boolean;
  /* 鼠标是否悬停 */
  isHovering: boolean;
  /* 滚动距离 */
  scrollDistance: number;
  /* 内容尺寸 */
  contentSize: number;
  /* 容器尺寸 */
  containerSize: number;
  /* 是否需要滚动 */
  isScrollNeeded: boolean;
  /* 最小克隆数量 */
  minClones: number;
}

export interface ScrollMethods {
  /* 开始滚动 */
  start: () => void;
  /* 停止滚动 */
  stop: () => void;
  /* 暂停滚动 */
  pause: () => void;
  /* 恢复滚动 */
  resume: () => void;
  /* 重置滚动 */
  reset: () => void;
  /* 强制滚动 */
  forceScroll: () => void;
  /* 更新尺寸 */
  updateSize: () => void;
  /* 更新配置 */
  updateOptions: (options: Partial<ScrollOptions>) => void;
  /* 设置观察者 */
  setObserver: (container: HTMLElement, content: HTMLElement) => void;
  /* 清除观察者 */
  clearObserver: () => void;
  /* 重置观察者，以观察最新的dom */
  resetObserver: () => void;
}

export interface SeamlessScrollResult {
  state: Readonly<ScrollState>;
  methods: ScrollMethods;
  destroy: () => void;
}
