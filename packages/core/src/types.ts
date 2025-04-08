export type ScrollDirection = "vertical" | "horizontal";

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
  /* 滚动步长（每次滚动的像素数），如果为0则自动计算 */
  step?: number;
  /* 是否强制滚动（即使内容未超出容器） */
  forceScrolling?: boolean;
  /* 垂直滚动时的行高（像素） */
  rowHeight?: number;
  /* 水平滚动时的列宽（像素） */
  columnWidth?: number;
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
  calculateMinClones: () => number;
}

export interface ScrollEvents {
  /* 滚动事件 */
  onScroll?: (distance: number, direction: ScrollDirection) => void;
  /* 点击事件 */
  onItemClick?: (item: any, index: number) => void;
}

export interface SeamlessScrollResult {
  state: Readonly<ScrollState>;
  methods: ScrollMethods;
  destroy: () => void;
}
