import {
  ScrollEvents,
  ScrollMethods,
  ScrollOptions,
  ScrollState,
  SeamlessScrollResult,
} from "./types";

// 默认配置
export const DEFAULT_OPTIONS: Required<ScrollOptions> = {
  direction: "vertical",
  speed: 50,
  duration: 500,
  pauseTime: 2000,
  step: 0,
  hoverPause: true,
  autoScroll: true,
  forceScrolling: false,
};

// 创建带警告的只读状态
const createReadOnlyState = <T extends ScrollState>(state: T): Readonly<T> => {
  return new Proxy(state, {
    get: (target, prop) => target[prop as keyof T],
    set: (_, prop) => {
      console.warn(
        `You cannot modify the state directly .${String(
          prop,
        )}Use methods [updateOptions] to update the state`,
      );
      return false;
    },
  });
};

const throttle = (fn: (...args: any[]) => void, delay: number) => {
  let lastCall = 0;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
};

const useStateWithCallback = (
  initialState: ScrollState,
  onStateChange?: (state: ScrollState) => void,
) => {
  const state = { ...initialState };

  const throttledOnStateChange = onStateChange
    ? throttle((newState: ScrollState) => {
        // 返回一个新对象，避免vue watch无法监听
        onStateChange({ ...newState });
      }, 16) // 约60fps的刷新率
    : undefined;

  const dispatch = (newState: Partial<ScrollState>) => {
    Object.assign(state, newState);
    if (throttledOnStateChange) {
      throttledOnStateChange({ ...state });
    }
  };

  return [state, dispatch] as const;
};

export const createSeamlessScroll = (
  container: HTMLElement,
  content: HTMLElement,
  realList: HTMLElement,
  options: ScrollOptions = {},
  events: ScrollEvents = {},
  onStateChange?: (state: ScrollState) => void,
): SeamlessScrollResult => {
  // 合并默认配置和用户配置
  const config: Required<ScrollOptions> = { ...DEFAULT_OPTIONS, ...options };

  // 状态
  const initialState: ScrollState = {
    isScrolling: false,
    isPaused: false,
    isHovering: false,
    isScrollNeeded: false,
    scrollDistance: 0,
    contentSize: 0,
    containerSize: 0,
    minClones: 1,
  };

  const [state, setState] = useStateWithCallback(initialState, onStateChange);
  const readOnlyState = createReadOnlyState(state);

  // 定时器ID
  let scrollTimer: ReturnType<typeof setTimeout> | null = null;
  let pauseTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;

  // 观察者
  let observer: ResizeObserver | null = null;

  // 记录暂停前的位置
  let lastScrollPosition = 0;

  // 计算最小克隆列表数量
  const updateMinClones = () => {
    let minClones: number;
    if (!container || !realList) {
      minClones = 0;
    } else {
      minClones = Math.ceil(state.containerSize / state.contentSize);
    }
    setState({
      minClones,
    });
  };

  // 计算是否需要滚动
  const updateScrollNeeded = () => {
    if (config.forceScrolling) {
      setState({ isScrollNeeded: true });
      return;
    }

    // 只有当内容超出容器时才需要滚动
    const isScrollNeeded = state.contentSize > state.containerSize;
    setState({ isScrollNeeded });

    // 如果不需要滚动，重置位置
    if (!isScrollNeeded) {
      resetScroll();
    }
  };

  // 更新尺寸
  const updateSize = () => {
    if (!container || !realList) return;

    const isVertical = config.direction === "vertical";

    setState({
      containerSize: isVertical ? container.clientHeight : container.clientWidth,
      contentSize: isVertical ? realList.clientHeight : realList.clientWidth,
    });

    updateMinClones();
    updateScrollNeeded();
  };

  // 更新配置
  const updateOptions = (newOptions: Partial<ScrollOptions>) => {
    // 合并新选项到当前配置
    Object.assign(config, newOptions);

    // 更新尺寸和滚动需求
    updateSize();

    // 如果改变了滚动方向，可能需要重置滚动位置
    if (newOptions.direction !== undefined) {
      resetScroll();
    }
  };

  // 应用滚动位置
  const applyScrollPosition = () => {
    if (!content) return;

    // 通过 CSS transform 实现平滑滚动
    content.style.transform = `translate${
      config.direction === "vertical" ? "Y" : "X"
    }(${-state.scrollDistance}px)`;
  };

  // 停止滚动
  const stopScroll = () => {
    setState({ isScrolling: false });

    if (pauseTimer) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (scrollTimer) {
      clearTimeout(scrollTimer);
      scrollTimer = null;
    }
  };

  // 开始滚动
  const startScroll = () => {
    if (!state.isScrollNeeded || state.isScrolling) return;

    setState({ isScrolling: true });

    // 使用 requestAnimationFrame 进行滚动动画
    let startTime: number | null = null;
    let lastFrameTime: number | null = null;

    // 计算滚动步长 - 基于速度而不是固定步长
    const getStepSize = (elapsedMs: number) => {
      // 转换为每毫秒的速度
      const speedPerMs = config.speed / 1000;
      // 步长 = 速度 * 经过的时间
      return speedPerMs * elapsedMs;
    };

    // 动画函数
    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
        lastFrameTime = timestamp;
      }

      // 计算帧时间差，确保平滑
      const frameDelta = timestamp - (lastFrameTime || timestamp);
      lastFrameTime = timestamp;

      // 整体已过去的时间
      const elapsed = timestamp - startTime;

      // 基于当前帧时间差计算步长，确保无论帧率如何，速度都一致
      const step = getStepSize(frameDelta);

      // 计算当前滚动位置
      const newScrollDistance = state.scrollDistance + step;

      // 检查是否需要重置位置
      if (newScrollDistance >= state.contentSize) {
        // 无缝重置：不直接跳回0，而是减去一个内容高度/宽度，这样看起来是连续的
        setState({ scrollDistance: newScrollDistance - state.contentSize });
      } else {
        setState({ scrollDistance: newScrollDistance });
      }
      applyScrollPosition();
      // 触发滚动事件
      if (events.onScroll) {
        events.onScroll(state.scrollDistance, config.direction);
      }

      // 根据配置的持续时间决定何时结束此次动画
      if (elapsed < config.duration) {
        // 继续动画
        rafId = requestAnimationFrame(animate);
      } else {
        // 暂停一段时间后继续滚动
        const continueScrolling = () => {
          // 清除并重新开始新的动画循环
          startTime = null;
          lastFrameTime = null;
          if (state.isScrolling) {
            rafId = requestAnimationFrame(animate);
          } else {
            startScroll(); // 如果滚动已停止，则重新启动
          }
        };

        if (config.pauseTime > 0) {
          pauseTimer = setTimeout(continueScrolling, config.pauseTime);
        } else {
          // 如果暂停时间为0，直接继续
          continueScrolling();
        }
      }
    };

    // 取消可能存在的定时器
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // 开始动画
    rafId = requestAnimationFrame(animate);
  };

  // 暂停滚动
  const pauseScroll = () => {
    if (!state.isScrolling) return;

    setState({ isPaused: true });
    lastScrollPosition = state.scrollDistance;

    stopScroll();
  };

  // 恢复滚动
  const resumeScroll = () => {
    if (!state.isPaused) return;

    setState({ isPaused: false, scrollDistance: lastScrollPosition });

    if (state.isScrollNeeded && !state.isHovering) {
      startScroll();
    }
  };

  // 重置滚动
  const resetScroll = () => {
    stopScroll();
    setState({ scrollDistance: 0 });
    applyScrollPosition();

    if (config.autoScroll && state.isScrollNeeded && !state.isHovering) {
      scrollTimer = setTimeout(() => {
        startScroll();
      }, 100);
    }
  };

  // 强制滚动
  const forceScroll = () => {
    const wasForced = config.forceScrolling;
    config.forceScrolling = true;
    updateScrollNeeded();

    if (!wasForced && state.isScrollNeeded && !state.isScrolling && !state.isHovering) {
      startScroll();
    }
  };

  // 鼠标移入处理
  const handleMouseEnter = () => {
    setState({ isHovering: true });

    if (config.hoverPause && state.isScrolling) {
      pauseScroll();
    }
  };

  // 鼠标移出处理
  const handleMouseLeave = () => {
    setState({ isHovering: false });

    if (config.hoverPause && state.isPaused) {
      resumeScroll();
    }
  };

  // 初始化
  const initialize = () => {
    // 添加鼠标事件监听
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    // 更新尺寸并启动滚动
    updateSize();

    // 监听内容变化
    observer = new ResizeObserver(() => {
      updateSize();
    });

    // 同时监听容器和内容区
    observer.observe(container);
    observer.observe(realList);

    if (config.autoScroll && state.isScrollNeeded) {
      scrollTimer = setTimeout(() => {
        startScroll();
      }, 100);
    }
  };

  // 销毁实例
  const destroy = () => {
    // 清除所有定时器
    stopScroll();

    // 移除事件监听
    if (container) {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    }

    // 断开观察者
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // 重置状态
    setState({
      isScrolling: false,
      isPaused: false,
      isHovering: false,
      scrollDistance: 0,
    });

    // 重置样式
    if (content) {
      content.style.transform = "";
    }
  };

  // 暴露方法
  const methods: ScrollMethods = {
    start: () => {
      if (!state.isScrolling) {
        setState({ isPaused: false });
        startScroll();
      }
    },
    stop: stopScroll,
    pause: pauseScroll,
    resume: resumeScroll,
    reset: resetScroll,
    forceScroll,
    updateSize,
    updateOptions,
  };

  // 初始化
  initialize();

  // 返回状态、方法和销毁函数
  return {
    state: readOnlyState,
    methods,
    destroy,
  };
};
