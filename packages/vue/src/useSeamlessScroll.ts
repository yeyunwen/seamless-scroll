import {
  type SeamlessScrollResult,
  type ScrollOptions,
  type ScrollMethods,
  createSeamlessScroll,
} from "@seamless-scroll/core";
import { computed, onBeforeUnmount, onMounted, ref, watchEffect, type Ref } from "vue";
import { HooksProps } from "./types";

export const useSeamlessScroll = (hooksProps: Ref<HooksProps>) => {
  // 引用DOM元素
  const containerRef = ref<HTMLElement | null>(null);
  const contentRef = ref<HTMLElement | null>(null);
  const realListRef = ref<HTMLElement | null>(null);

  // 实例引用
  let scrollInstance: SeamlessScrollResult | null = null;

  // 滚动状态
  const scrollState = ref({
    isScrolling: false,
    isPaused: false,
    isHovering: false,
    isScrollNeeded: false,
    isVirtualized: false,
    minClones: 0,
    startIndex: 0,
    endIndex: 0,
    scrollDistance: 0,
  });

  // 将属性转换为核心库选项
  const scrollOptions = computed((): ScrollOptions => {
    return {
      direction: hooksProps.value.direction,
      speed: hooksProps.value.speed,
      duration: hooksProps.value.duration,
      pauseTime: hooksProps.value.pauseTime,
      hoverPause: hooksProps.value.hoverPause,
      autoScroll: hooksProps.value.autoScroll,
      forceScrolling: hooksProps.value.forceScrolling,
      virtualScrollBuffer: hooksProps.value.virtualScrollBuffer,
      itemSize: hooksProps.value.itemSize,
      dataTotal: hooksProps.value.dataTotal,
    };
  });

  // 初始化滚动
  const initScroll = () => {
    console.log("initScorll");

    if (!containerRef.value || !contentRef.value || !realListRef.value) return;

    // 销毁可能存在的实例
    if (scrollInstance) {
      scrollInstance.destroy();
    }

    // 创建新实例
    scrollInstance = createSeamlessScroll(
      () => containerRef.value,
      () => contentRef.value,
      () => realListRef.value,
      scrollOptions.value,
      (state) => {
        scrollState.value = state;
      },
    );
  };

  // 获取虚拟化项目的范围（用于渲染）
  const getVirtualItems = (items: any[]) => {
    if (!scrollState.value.isVirtualized) {
      return items;
    }

    const { startIndex, endIndex } = scrollState.value;

    // 如果items为空，直接返回
    if (items.length === 0) {
      return items;
    }

    // 构建一个新的数组，确保所有索引都在有效范围内
    const result: any[] = [];

    // 计算需要渲染的项目数量
    const itemsToRender = Math.min(endIndex - startIndex + 1, items.length * 2);

    // 循环添加项目，确保索引在有效范围内
    for (let i = 0; i < itemsToRender; i++) {
      // 计算真实索引，确保在0到items.length-1之间
      const realIndex = (startIndex + i) % items.length;
      const item = items[realIndex];

      // 在结果中添加对原始数据的引用，而不是复制
      // 这避免了在滚动时呈现不存在的项目（如101、102等）
      result.push({
        ...item,
        // 添加一个隐藏的标记，表示这是原始索引
        // 这不会影响UI，但可以帮助我们跟踪实际位置
        _virtualScrollOriginalIndex: realIndex,
      });
    }

    return result;
  };

  onMounted(() => {
    initScroll();

    // 使用watchEffect替代watch，自动追踪依赖
    watchEffect(() => {
      if (scrollInstance) {
        // 创建选项对象，直接从hooksProps.value中获取值
        const newOptions: Partial<ScrollOptions> = {
          autoScroll: hooksProps.value.autoScroll,
          direction: hooksProps.value.direction,
          duration: hooksProps.value.duration,
          forceScrolling: hooksProps.value.forceScrolling,
          hoverPause: hooksProps.value.hoverPause,
          pauseTime: hooksProps.value.pauseTime,
          speed: hooksProps.value.speed,
          virtualScrollBuffer: hooksProps.value.virtualScrollBuffer,
          itemSize: hooksProps.value.itemSize,
          dataTotal: hooksProps.value.dataTotal,
        };

        scrollInstance.methods.updateOptions(newOptions);
      }
    });
  });

  onBeforeUnmount(() => {
    if (scrollInstance) {
      scrollInstance.destroy();
      scrollInstance = null;
    }
  });

  // 暴露方法
  const methods: ScrollMethods = {
    start: () => scrollInstance?.methods.start(),
    stop: () => scrollInstance?.methods.stop(),
    pause: () => scrollInstance?.methods.pause(),
    resume: () => scrollInstance?.methods.resume(),
    reset: () => scrollInstance?.methods.reset(),
    forceScroll: () => scrollInstance?.methods.forceScroll(),
    updateSize: () => scrollInstance?.methods.updateSize(),
    updateOptions: (newOptions: Partial<ScrollOptions>) =>
      scrollInstance?.methods.updateOptions(newOptions),
    setObserver: (container: HTMLElement, realList: HTMLElement) =>
      scrollInstance?.methods.setObserver(container, realList),
    clearObserver: () => scrollInstance?.methods.clearObserver(),
    resetObserver: () => scrollInstance?.methods.resetObserver(),
    getVisibleRange: () =>
      scrollInstance?.methods.getVisibleRange() || { startIndex: 0, endIndex: 0 },
  };

  return {
    // ref
    containerRef,
    contentRef,
    realListRef,
    // state
    state: scrollState,
    // methods
    methods,
    // 虚拟滚动辅助函数
    getVirtualItems,
  };
};
