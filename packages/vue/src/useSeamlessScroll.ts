import {
  type SeamlessScrollResult,
  type ScrollOptions,
  type ScrollMethods,
  createSeamlessScroll,
} from "@seamless-scroll/core";
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
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
    scrollDistance: 0,
    isScrollNeeded: false,
    minClones: 0,
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

  onMounted(() => {
    initScroll();

    // 监听选项变化，需要重新初始化
    watch(
      [
        () => hooksProps.value.autoScroll,
        () => hooksProps.value.direction,
        () => hooksProps.value.duration,
        () => hooksProps.value.forceScrolling,
        () => hooksProps.value.hoverPause,
        () => hooksProps.value.pauseTime,
        () => hooksProps.value.speed,
      ],
      ([autoScroll, direction, duration, forceScrolling, hoverPause, pauseTime, speed]) => {
        if (scrollInstance) {
          // 创建正确的选项对象
          const newOptions: Partial<ScrollOptions> = {
            autoScroll,
            direction,
            duration,
            forceScrolling,
            hoverPause,
            pauseTime,
            speed,
          };
          scrollInstance.methods.updateOptions(newOptions);
        }
      },
    );
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
      scrollInstance.methods.setObserver(container, realList),
    clearObserver: () => scrollInstance?.methods.clearObserver(),
    resetObserver: () => scrollInstance?.methods.resetObserver(),
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
  };
};
