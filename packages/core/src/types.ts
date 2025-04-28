export type ScrollDirection = "vertical" | "horizontal";

// DOM 元素或获取 DOM 元素的函数
export type ElementOrGetter = HTMLElement | (() => HTMLElement | null);

export interface ScrollOptions {
  /* 数据总数 */
  dataTotal: number;
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
  /* 虚拟滚动项目缓冲区大小（前后各多渲染几个项目）default 5 */
  virtualScrollBuffer?: number;
  /* 估计的每个项目高度/宽度（像素）- 用于初始计算
   * 注意：itemSize和minItemSize至少需要设置一个，否则将无法正确计算滚动位置
   */
  itemSize?: number;
  /* 最小项目高度/宽度（像素）- 防止项目尺寸过小导致滚动位置回退
   * 注意：itemSize和minItemSize至少需要设置一个，否则将无法正确计算滚动位置
   */
  minItemSize?: number;
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
  /* 虚拟滚动 - 可见项目的起始索引 */
  startIndex: number;
  /* 虚拟滚动 - 可见项目的结束索引 */
  endIndex: number;
  /* 虚拟滚动 - 是否启用 */
  isVirtualized: boolean;
  /* 动态大小虚拟滚动 - 项目尺寸列表 */
  itemSizeList: number[];
  /* 动态大小虚拟滚动 - 平均项目尺寸 */
  averageSize: number;
  /* 动态大小虚拟滚动 - 已测量项目数量 */
  totalMeasuredItems: number;
  /* 动态大小虚拟滚动 - 按类型统计的尺寸 */
  typeSizes: Record<string, { total: number; count: number; average: number }>;
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
  /* 更新指定索引项目的尺寸缓存 (用于动态高度) */
  updateItemSizeList: (index: number, size: number, type?: string) => void;
  /* 预测指定索引项目的尺寸 */
  predictItemSize: (index: number, type?: string) => number;
  /* 获取虚拟克隆范围 */
  getVirtualCloneRange: () => { startIndex: number; endIndex: number };
}

export interface SeamlessScrollResult {
  state: Readonly<ScrollState>;
  methods: ScrollMethods;
  destroy: () => void;
}
