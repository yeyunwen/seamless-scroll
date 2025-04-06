import {
  ScrollDirection,
  SeamlessScrollResult,
  ScrollOptions,
  createSeamlessScroll,
  ScrollMethods,
} from "@seamless-scroll/core";
import { computed, CSSProperties, onBeforeUnmount, onMounted, ref, watch } from "vue";

export interface SeamlessScrollProps {
  /** 数据源 */
  data: any[];
  /** 滚动方向 vertical（上下）或 horizontal（左右） */
  direction?: ScrollDirection;
  // 容器高度（像素或CSS值）
  containerHeight?: number | string;
  // 容器宽度（像素或CSS值）
  containerWidth?: number | string;
  // 滚动速度（像素/秒）
  speed?: number;
  // 每次滚动动画的持续时间（毫秒）
  duration?: number;
  // CSS 过渡时间函数
  timingFunction?: string;
  // 每次滚动后的暂停时间（毫秒）
  pauseTime?: number;
  // 是否在鼠标悬停时暂停
  hoverPause?: boolean;
  // 是否自动开始滚动
  autoScroll?: boolean;
  // 滚动步长（每次滚动的像素数），如果为0则自动计算
  step?: number;
  // 垂直滚动时的行高（像素）
  rowHeight?: number;
  // 水平滚动时的列宽（像素）
  columnWidth?: number;
  // 是否强制滚动（即使内容未超出容器）
  forceScrolling?: boolean;
}

export interface SeamlessScrollStyles {
  container: CSSProperties;
  content: CSSProperties;
  list: CSSProperties;
  item: CSSProperties;
  empty: CSSProperties;
}

export const useSeamlessScroll = (props: SeamlessScrollProps) => {
  // 引用DOM元素
  const containerRef = ref<HTMLElement | null>(null);
  const contentRef = ref<HTMLElement | null>(null);
  const realListRef = ref<HTMLElement | null>(null);
  const cloneListRef = ref<HTMLElement | null>(null);

  // 实例引用
  let scrollInstance: SeamlessScrollResult | null = null;

  // 滚动状态
  const scrollState = ref({
    isScrolling: false,
    isPaused: false,
    isHovering: false,
    scrollDistance: 0,
    isScrollNeeded: false,
  });

  // 将属性转换为核心库选项
  const scrollOptions = computed((): ScrollOptions => {
    return {
      direction: props.direction,
      speed: props.speed,
      duration: props.duration,
      pauseTime: props.pauseTime,
      hoverPause: props.hoverPause,
      autoScroll: props.autoScroll,
      step: props.step,
      rowHeight: props.rowHeight,
      columnWidth: props.columnWidth,
      forceScrolling: props.forceScrolling,
    };
  });

  // 集中所有样式逻辑
  const styles = computed<SeamlessScrollStyles>(() => {
    const isVertical = props.direction === "vertical";

    return {
      container: {
        height:
          typeof props.containerHeight === "number"
            ? `${props.containerHeight}px`
            : props.containerHeight,
        width:
          typeof props.containerWidth === "number"
            ? `${props.containerWidth}px`
            : props.containerWidth,
        overflow: "hidden",
        position: "relative",
      },
      content: {
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        willChange: "transform",
        position: "relative",
        // transform由core控制，不在这里设置
      },
      list: {
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        minWidth: "100%",
        minHeight: "100%",
      },
      item: {
        boxSizing: "border-box",
        height: isVertical ? `${props.rowHeight}px` : "100%",
        width: isVertical ? "100%" : `${props.columnWidth}px`,
      },
      empty: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#999",
      },
    };
  });

  // 初始化滚动
  const initScroll = () => {
    if (!containerRef.value || !contentRef.value || !realListRef.value) return;

    // 销毁可能存在的实例
    if (scrollInstance) {
      scrollInstance.destroy();
    }

    // 创建新实例
    scrollInstance = createSeamlessScroll(
      containerRef.value,
      contentRef.value,
      realListRef.value,
      cloneListRef.value,
      scrollOptions.value,
      {
        // onScroll: (distance) => {
        //   scrollState.value.scrollDistance = distance;
        //   // 可以在这里触发自定义事件
        // },
        onItemClick: () => {
          // 可以在这里触发自定义点击事件
        },
      },
      (state) => {
        console.log("state", state);
        scrollState.value = state;
      },
    );
  };

  onMounted(() => {
    initScroll();

    // 监听选项变化，需要重新初始化
    watch(
      scrollOptions,
      (newOptions) => {
        if (scrollInstance) {
          scrollInstance.methods.updateOptions(newOptions);
        }
      },
      { deep: true },
    );

    // 监听数据变化
    watch(
      () => props.data,
      () => {
        // vue 的nextTick是微任务，这里通过宏任务延迟更新
        // 确保 DOM 已更新
        setTimeout(() => {
          if (scrollInstance) {
            scrollInstance.methods.updateSize();

            if (scrollInstance.state.isScrollNeeded && !scrollInstance.state.isScrolling) {
              scrollInstance.methods.start();
            }
          }
        }, 50);
      },
      { deep: true },
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
  };

  return {
    // ref
    containerRef,
    contentRef,
    realListRef,
    cloneListRef,
    // styles
    styles,
    // state
    state: scrollState,
    // methods
    methods,
    isInitialized: !!scrollInstance,
  };
};
