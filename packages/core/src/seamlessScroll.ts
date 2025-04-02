import {
  ScrollEvents,
  ScrollMethods,
  ScrollOptions,
  ScrollState,
  SeamlessScrollResult,
} from "./types";

// 默认配置
const DEFAULT_OPTIONS: Required<ScrollOptions> = {
  direction: "vertical",
  speed: 50,
  duration: 500,
  timingFunction: "linear",
  pauseTime: 2000,
  hoverPause: true,
  autoScroll: true,
  step: 0,
  forceScrolling: false,
  rowHeight: 40,
  columnWidth: 200,
};

/**
 * 创建无缝滚动实例
 * @param container 容器元素
 * @param content 内容元素
 * @param realList 实际列表元素
 * @param cloneList 克隆列表元素
 * @param options 配置选项
 * @param events 事件回调
 * @returns 滚动实例结果
 */
export const createSeamlessScroll = (
  container: HTMLElement,
  content: HTMLElement,
  realList: HTMLElement,
  cloneList: HTMLElement | null,
  options: ScrollOptions = {},
  events: ScrollEvents = {},
): SeamlessScrollResult => {
  // 合并默认配置和用户配置
  const config: Required<ScrollOptions> = { ...DEFAULT_OPTIONS, ...options };

  // 状态
  const state: ScrollState = {
    isScrolling: false,
    isPaused: false,
    isHovering: false,
    scrollDistance: 0,
    contentSize: 0,
    containerSize: 0,
    isScrollNeeded: false,
  };

  // 定时器ID
  let scrollTimer: ReturnType<typeof setTimeout> | null = null;
  let pauseTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;

  // 观察者
  let observer: MutationObserver | null = null;

  // 记录暂停前的位置
  let lastScrollPosition = 0;

  // 计算是否需要滚动
  const updateScrollNeeded = () => {
    if (config.forceScrolling) {
      state.isScrollNeeded = true;
      return;
    }

    // 只有当内容超出容器时才需要滚动
    state.isScrollNeeded = state.contentSize > state.containerSize;
  };

  // 更新尺寸
  const updateSize = () => {
    if (!container || !realList) return;

    const isVertical = config.direction === "vertical";

    state.containerSize = isVertical ? container.clientHeight : container.clientWidth;
    state.contentSize = isVertical ? realList.clientHeight : realList.clientWidth;

    updateScrollNeeded();

    // 如果有克隆列表，设置其显示/隐藏并同步内容
    if (cloneList) {
      cloneList.style.display = state.isScrollNeeded ? "flex" : "none";

      // 确保克隆列表与实际列表内容相同 (只在必要时更新)
      if (
        cloneList.children.length !== realList.children.length ||
        cloneList.innerHTML !== realList.innerHTML
      ) {
        cloneList.innerHTML = realList.innerHTML;
      }

      // 保持克隆列表的样式与实际列表一致
      cloneList.className = realList.className;

      // 确保flex方向与滚动方向一致
      const flexDirection = isVertical ? "column" : "row";
      if (realList.style.flexDirection !== flexDirection) {
        realList.style.flexDirection = flexDirection;
      }
      if (cloneList.style.flexDirection !== flexDirection) {
        cloneList.style.flexDirection = flexDirection;
      }
    }
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
    state.isScrolling = false;

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

    state.isScrolling = true;

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
      state.scrollDistance += step;

      // 触发滚动事件
      if (events.onScroll) {
        events.onScroll(state.scrollDistance, config.direction);
      }

      // 应用滚动位置到内容元素
      applyScrollPosition();

      // 根据配置的持续时间决定何时结束此次动画
      if (elapsed < config.duration) {
        // 继续动画
        rafId = requestAnimationFrame(animate);
      } else {
        // 动画完成，检查是否需要重置滚动位置
        if (state.scrollDistance >= state.contentSize) {
          // 无缝重置：不直接跳回0，而是减去一个内容高度/宽度，这样看起来是连续的
          state.scrollDistance = state.scrollDistance - state.contentSize;
          applyScrollPosition();
        }

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

    state.isPaused = true;
    lastScrollPosition = state.scrollDistance;

    stopScroll();
  };

  // 恢复滚动
  const resumeScroll = () => {
    if (!state.isPaused) return;

    state.isPaused = false;
    state.scrollDistance = lastScrollPosition;

    if (state.isScrollNeeded && !state.isHovering) {
      startScroll();
    }
  };

  // 重置滚动
  const resetScroll = () => {
    stopScroll();
    state.scrollDistance = 0;
    applyScrollPosition();
    updateSize();

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
    state.isHovering = true;

    if (config.hoverPause && state.isScrolling) {
      pauseScroll();
    }
  };

  // 鼠标移出处理
  const handleMouseLeave = () => {
    state.isHovering = false;

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
    observer = new MutationObserver(() => {
      updateSize();
      if (state.isScrollNeeded && !state.isScrolling && !state.isHovering && !state.isPaused) {
        startScroll();
      }
    });

    if (realList) {
      observer.observe(realList, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }

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
    state.isScrolling = false;
    state.isPaused = false;
    state.isHovering = false;
    state.scrollDistance = 0;

    // 重置样式
    if (content) {
      content.style.transform = "";
    }
  };

  // 暴露方法
  const methods: ScrollMethods = {
    start: () => {
      if (!state.isScrolling) {
        state.isPaused = false;
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
    state,
    methods,
    destroy,
  };
};
