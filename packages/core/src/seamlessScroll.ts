import {
  ElementOrGetter,
  ScrollMethods,
  ScrollOptions,
  ScrollState,
  SeamlessScrollResult,
} from "./types";
import { isNumber, createReadOnlyState, useStateWithCallback, throttle } from "./utils";

// 默认配置
export const DEFAULT_OPTIONS: Required<
  Omit<ScrollOptions, "dataTotal" | "itemSize" | "minItemSize">
> = {
  direction: "vertical",
  reverse: false,
  speed: 50,
  duration: 500,
  pauseTime: 2000,
  hoverPause: true,
  wheelScroll: true,
  autoScroll: true,
  forceScrolling: true,
  virtual: "auto",
  virtualThreshold: 100,
  virtualScrollBuffer: 5, // 虚拟滚动缓冲区大小，防止滚动时出现空白
};

export const createSeamlessScroll = (
  containerEl: ElementOrGetter,
  contentEl: ElementOrGetter,
  realListEl: ElementOrGetter,
  options: ScrollOptions,
  onStateChange?: () => [(state: ScrollState) => void, (keyof ScrollState)[]],
): SeamlessScrollResult => {
  // 创建获取 DOM 元素的函数
  const getContainer = typeof containerEl === "function" ? containerEl : () => containerEl;
  const getContent = typeof contentEl === "function" ? contentEl : () => contentEl;
  const getRealList = typeof realListEl === "function" ? realListEl : () => realListEl;

  // 创建 DOM 元素的引用获取器，而不是直接存储引用
  // 这样每次使用时都会获取最新的引用，而不是使用闭包捕获的初始引用
  const domRefs = {
    getContainer: () => getContainer(),
    getContent: () => getContent(),
    getRealList: () => getRealList(),
  };

  // 合并默认配置和用户配置
  const config: Required<Omit<ScrollOptions, "dataTotal" | "itemSize" | "minItemSize">> & {
    dataTotal: number;
    itemSize?: number;
    minItemSize?: number;
  } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

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
    startIndex: 0,
    endIndex: 0,
    isVirtualized: false,
    itemSizeList: [],
    averageSize: 0, // 添加平均尺寸
    totalMeasuredItems: 0, // 添加已测量项目计数
    typeSizes: {}, // 按类型统计的尺寸
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

  const hasVirtualSize = () => isNumber(config.itemSize) || isNumber(config.minItemSize);

  const warnVirtualFallback = () => {
    if (typeof console !== "undefined") {
      console.warn(
        "[seamless-scroll] virtual=auto requires itemSize or minItemSize. Falling back to non-virtual scrolling.",
      );
    }
  };

  const shouldVirtualize = (contentSize: number, containerSize: number) => {
    if (config.virtual === false || config.dataTotal <= 0) return false;

    if (config.virtual === true) {
      if (!hasVirtualSize()) {
        throw new Error(
          "[seamless-scroll] virtual=true requires itemSize or minItemSize to calculate virtual ranges.",
        );
      }
      return true;
    }

    if (config.dataTotal < config.virtualThreshold || contentSize <= containerSize) {
      return false;
    }

    if (!hasVirtualSize()) {
      warnVirtualFallback();
      return false;
    }

    return true;
  };

  const isVertical = () => {
    return config.direction === "vertical";
  };

  const getTranslateDistance = () => {
    return config.reverse ? state.scrollDistance - state.contentSize : -state.scrollDistance;
  };

  const getBaseContainerSize = () => {
    const currentContainer = domRefs.getContainer();
    if (!currentContainer) return 0;

    return isVertical() ? currentContainer.clientHeight : currentContainer.clientWidth;
  };

  const getBaseContentSize = () => {
    const currentRealList = domRefs.getRealList();
    if (!currentRealList) return 0;

    return isVertical() ? currentRealList.clientHeight : currentRealList.clientWidth;
  };

  // 计算最小克隆列表数量
  const updateMinClones = () => {
    let minClones: number;
    const { minClones: lastMinClones } = state;
    if (!domRefs.getContainer() || !domRefs.getRealList()) {
      minClones = 0;
    } else if (state.contentSize === 0) {
      minClones = lastMinClones;
    } else {
      minClones = Math.ceil(state.containerSize / state.contentSize);
    }
    setState({
      minClones,
    });
  };

  const getVirtualCloneRange = () => {
    const currentRealList = domRefs.getRealList();
    if (!currentRealList || !state.isVirtualized) return { startIndex: 0, endIndex: -1 };

    return calculateVisibleRange(0, config.dataTotal);
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
    // 使用获取器函数获取最新引用
    const currentContainer = domRefs.getContainer();
    const currentRealList = domRefs.getRealList();
    if (!currentContainer || !currentRealList) return;

    const containerSize = getBaseContainerSize();
    const contentSize = getBaseContentSize();

    const isVirtualized = shouldVirtualize(contentSize, containerSize);

    setState({
      containerSize,
      isVirtualized,
    });

    setState({
      contentSize: getContentSize(),
    });

    if (isVirtualized) {
      updateVisibleItems();
    } else if (
      state.isVirtualized ||
      state.startIndex !== 0 ||
      state.endIndex !== config.dataTotal - 1
    ) {
      setState({ startIndex: 0, endIndex: Math.max(0, config.dataTotal - 1) });
    }
    updateMinClones();

    updateScrollNeeded();
  };

  const getContentSize = () => {
    const currentRealList = domRefs.getRealList();
    if (!currentRealList) return 0;

    if (state.isVirtualized) {
      if (!config.dataTotal) return 0;

      if (isNumber(config.itemSize)) {
        // 固定高度
        return config.dataTotal * config.itemSize;
      } else {
        // 变量高度 - 智能计算
        let totalSize = 0;

        // 否则结合已知尺寸和预测尺寸
        for (let i = 0; i < config.dataTotal; i++) {
          totalSize += predictItemSize(i);
        }

        return totalSize;
      }
    }

    return getBaseContentSize();
  };

  // 尺寸预测函数
  const predictItemSize = (index: number, type?: string): number => {
    if (isNumber(config.itemSize)) {
      return config.itemSize;
    }

    // 1. 已测量的精确尺寸 (保证不小于最小尺寸)
    if (state.itemSizeList[index] > 0) {
      return Math.max(state.itemSizeList[index], config.minItemSize!);
    }

    // 2. 同类型项目的平均尺寸 (保证不小于最小尺寸)
    if (type && state.typeSizes[type]?.average > 0) {
      return Math.max(state.typeSizes[type].average, config.minItemSize!);
    }

    // 3. 全局平均尺寸 (保证不小于最小尺寸)
    if (state.averageSize > 0) {
      return Math.max(state.averageSize, config.minItemSize!);
    }

    // 4. 最小尺寸
    return config.minItemSize!;
  };

  // 修改更新尺寸列表函数，支持类型和统计
  const updateItemSizeList = (index: number, size: number, type?: string) => {
    const currentRealList = domRefs.getRealList();
    if (!currentRealList) return;

    const minSize = config.minItemSize || 0;
    const constrainedSize = Math.max(size, minSize);

    const nextItemSizeList = [...state.itemSizeList];
    const oldSize = nextItemSizeList[index];
    const isNewMeasurement = !oldSize || oldSize <= 0;
    nextItemSizeList[index] = constrainedSize;

    const totalMeasuredItems = isNewMeasurement
      ? state.totalMeasuredItems + 1
      : state.totalMeasuredItems;
    const averageSize = isNewMeasurement
      ? (state.averageSize * state.totalMeasuredItems + constrainedSize) / totalMeasuredItems
      : totalMeasuredItems > 0
        ? state.averageSize + (constrainedSize - oldSize) / totalMeasuredItems
        : constrainedSize;

    const typeSizes = { ...state.typeSizes };
    if (type) {
      const previous = typeSizes[type] ?? { total: 0, count: 0, average: 0 };
      const total = isNewMeasurement
        ? previous.total + constrainedSize
        : previous.total - oldSize + constrainedSize;
      const count = isNewMeasurement ? previous.count + 1 : previous.count;
      typeSizes[type] = { total, count, average: count > 0 ? total / count : 0 };
    }

    setState({
      itemSizeList: nextItemSizeList,
      averageSize,
      totalMeasuredItems,
      typeSizes,
    });
    setState({ contentSize: getContentSize() });
  };

  // 更新配置
  const updateOptions = (newOptions: Partial<ScrollOptions>) => {
    // 合并新选项到当前配置
    Object.assign(config, newOptions);
    // 更新尺寸和滚动需求
    updateSize();

    // 如果改变了滚动方向或反向配置，需要重置滚动位置
    if (newOptions.direction !== undefined || newOptions.reverse !== undefined) {
      resetScroll();
    }
  };

  // 计算虚拟可视区域
  const calculateVisibleRange = (scrollPosition: number, totalItems: number) => {
    if (!state.isVirtualized || totalItems === 0) {
      return { startIndex: 0, endIndex: totalItems - 1 };
    }

    const { virtualScrollBuffer = DEFAULT_OPTIONS.virtualScrollBuffer } = config;
    const containerSize = state.containerSize;

    // 使用二分查找找到第一个可见项目
    let startIndex = 0;
    let endIndex = 0;
    let minVisibleCount = 1;

    // find startIndex
    if (isNumber(config.itemSize)) {
      minVisibleCount = Math.ceil(containerSize / config.itemSize);
      // 固定高度 - 简单除法
      startIndex = Math.floor(scrollPosition / config.itemSize);
      // 确保startIndex不会超出范围
      startIndex = Math.max(0, Math.min(totalItems - minVisibleCount, startIndex));
    } else {
      minVisibleCount = Math.ceil(containerSize / config.minItemSize!);
      // 变量高度 - 二分查找或线性扫描
      if (state.totalMeasuredItems > totalItems * 0.7) {
        // 足够的测量数据，用二分查找
        let low = 0;
        let high = totalItems - 1;

        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          let offset = 0;

          // 计算到mid位置的偏移
          for (let i = 0; i < mid; i++) {
            offset += predictItemSize(i);
          }

          if (offset < scrollPosition) {
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }

        startIndex = Math.max(0, high);
        // 确保不超出范围
        startIndex = Math.max(0, Math.min(totalItems - minVisibleCount, startIndex));
      } else {
        // 测量数据不足，线性扫描
        let offset = 0;
        let foundIndex = false;

        for (let i = 0; i < totalItems; i++) {
          const size = predictItemSize(i);
          if (offset >= scrollPosition) {
            startIndex = i;
            foundIndex = true;
            break;
          }
          offset += size;
        }

        // 如果没找到合适的索引，重置到开始位置
        if (!foundIndex) {
          startIndex = 0;
        }
        startIndex = Math.max(0, Math.min(totalItems - minVisibleCount, startIndex));
      }
    }

    // find visibleCount and endIndex
    if (isNumber(config.itemSize)) {
      // 固定高度
      const visibleCount = Math.ceil(containerSize / config.itemSize);
      endIndex = Math.min(totalItems - 1, startIndex + visibleCount + 2 * virtualScrollBuffer);
    } else {
      // 变量高度 - 累加直到超过容器尺寸
      let currentSize = 0;
      endIndex = startIndex;
      while (currentSize < containerSize && endIndex < totalItems) {
        currentSize += predictItemSize(endIndex);
        endIndex++;
      }

      // 添加缓冲区，确保不超出范围
      endIndex = Math.min(totalItems - 1, endIndex + virtualScrollBuffer);
    }
    startIndex = Math.max(0, Math.min(totalItems - 1, startIndex - virtualScrollBuffer));

    return { startIndex, endIndex };
  };

  // 应用滚动位置时更新虚拟滚动范围
  const updateVisibleItems = () => {
    // 获取总数据量
    const totalItems = config.dataTotal;

    // 根据当前滚动位置计算可见范围
    const { startIndex, endIndex } = calculateVisibleRange(state.scrollDistance, totalItems);

    // 更新状态
    setState({
      startIndex,
      endIndex,
      isVirtualized: true,
    });
  };

  const normalizeScrollDistance = (distance: number) => {
    if (state.contentSize <= 0) return 0;
    return ((distance % state.contentSize) + state.contentSize) % state.contentSize;
  };

  const setScrollDistance = (distance: number) => {
    const normalizedOffset = normalizeScrollDistance(distance);

    if (state.isVirtualized && config.dataTotal) {
      const { startIndex: newStartIndex } = calculateVisibleRange(
        normalizedOffset,
        config.dataTotal,
      );

      setState({
        scrollDistance: normalizedOffset,
        startIndex: newStartIndex,
      });
      return;
    }

    setState({ scrollDistance: normalizedOffset });
  };

  // 应用滚动位置
  const applyScrollPosition = () => {
    const currentContent = domRefs.getContent();
    if (!currentContent) return;
    // 通过 CSS transform 实现平滑滚动
    currentContent.style.transform = `translate${
      isVertical() ? "Y" : "X"
    }(${getTranslateDistance()}px)`;

    if (state.isVirtualized) {
      // 更新虚拟滚动的可见项目
      updateVisibleItems();
    }
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
        setScrollDistance(newScrollDistance);
      } else {
        setState({ scrollDistance: newScrollDistance });
      }
      applyScrollPosition();

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

  const handleWheel = (event: WheelEvent) => {
    if (!config.wheelScroll || !config.hoverPause || !state.isHovering || !state.isScrollNeeded) {
      return;
    }

    const delta = isVertical() ? event.deltaY : event.deltaX || event.deltaY;
    if (delta === 0) return;

    event.preventDefault();
    setScrollDistance(state.scrollDistance + delta);
    applyScrollPosition();
    lastScrollPosition = state.scrollDistance;
  };

  const clearObserver = () => {
    if (observer) {
      observer.disconnect();
    }
  };

  // 设置观察者
  const setObserver = (container: HTMLElement, realList: HTMLElement) => {
    // 如果已有观察者，先断开连接
    clearObserver();

    // 创建新的观察者
    observer = new ResizeObserver(
      throttle(() => {
        updateSize();
      }, 100),
    );

    // 观察容器和内容区
    observer.observe(container);
    observer.observe(realList);
  };

  const resetObserver = () => {
    const container = domRefs.getContainer();
    const realList = domRefs.getRealList();
    if (container && realList) {
      setObserver(container, realList);
    }
  };

  // 初始化
  const initialize = () => {
    // 添加鼠标事件监听
    const currentContainer = domRefs.getContainer();
    if (currentContainer) {
      currentContainer.addEventListener("mouseenter", handleMouseEnter);
      currentContainer.addEventListener("mouseleave", handleMouseLeave);
      currentContainer.addEventListener("wheel", handleWheel, { passive: false });
    }

    // 更新尺寸并启动滚动
    updateSize();

    // 设置观察者
    const currentRealList = domRefs.getRealList();
    if (currentContainer && currentRealList) {
      setObserver(currentContainer, currentRealList);
    }

    if (config.autoScroll && state.isScrollNeeded) {
      scrollTimer = setTimeout(() => {
        startScroll();
      }, 0);
    }
  };

  // 销毁实例
  const destroy = () => {
    // 清除所有定时器
    stopScroll();

    // 移除事件监听
    const currentContainer = domRefs.getContainer();
    if (currentContainer) {
      currentContainer.removeEventListener("mouseenter", handleMouseEnter);
      currentContainer.removeEventListener("mouseleave", handleMouseLeave);
      currentContainer.removeEventListener("wheel", handleWheel);
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
    const currentContent = domRefs.getContent();
    if (currentContent) {
      currentContent.style.transform = "";
    }
  };

  // 更新暴露的方法
  const methods: ScrollMethods = {
    start: startScroll,
    stop: stopScroll,
    pause: pauseScroll,
    resume: resumeScroll,
    reset: resetScroll,
    forceScroll,
    updateSize,
    updateOptions,
    setObserver,
    clearObserver,
    resetObserver,
    updateItemSizeList: (index: number, size: number, type?: string) =>
      updateItemSizeList(index, size, type),
    predictItemSize: (index: number, type?: string) => predictItemSize(index, type), // 暴露预测方法
    getVirtualCloneRange,
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
