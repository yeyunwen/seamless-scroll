import {
  type SeamlessScrollResult,
  type ScrollOptions,
  type ScrollMethods,
  createSeamlessScroll,
} from "@seamless-scroll/core";
import { computed, onBeforeUnmount, onMounted, ref, watchEffect, type Ref } from "vue";
import { HooksProps } from "./types";

// 定义虚拟滚动项的通用接口，支持泛型
export type VirtualScrollItem<T = any> = T & {
  _originalIndex: number;
};

export const useSeamlessScroll = <T = any>(hooksProps: Ref<HooksProps>) => {
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
    contentSize: 0,
    containerSize: 0,
    itemSizeList: [] as number[],
    totalMeasuredItems: 0,
    averageSize: 0,
    typeSizes: {} as Record<string, { total: number; count: number; average: number }>,
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
      minItemSize: hooksProps.value.minItemSize,
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
  const getVirtualItems = <ItemType = T>(items: ItemType[]): VirtualScrollItem<ItemType>[] => {
    const { startIndex, endIndex } = scrollState.value;
    if (items.length === 0) return [];

    // 只返回可见范围内的项目，不要累积
    const result: VirtualScrollItem<ItemType>[] = [];
    const itemsToRender = Math.min(endIndex - startIndex + 1, items.length);

    for (let i = 0; i < itemsToRender; i++) {
      const realIndex = (startIndex + i) % items.length;
      result.push({
        ...items[realIndex],
        _originalIndex: realIndex,
      } as VirtualScrollItem<ItemType>);
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
          minItemSize: hooksProps.value.minItemSize,
          dataTotal: hooksProps.value.dataTotal,
        };
        console.log("updateOptions", newOptions);
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
    updateItemSizeList: (index: number, size: number, type?: string) =>
      scrollInstance?.methods.updateItemSizeList(index, size, type),
    predictItemSize: (index: number, type?: string) =>
      scrollInstance?.methods.predictItemSize?.(index, type) || 0,
    getVirtualCloneRange: () => scrollInstance?.methods.getVirtualCloneRange(),
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
    getVirtualItems,
  };
};
