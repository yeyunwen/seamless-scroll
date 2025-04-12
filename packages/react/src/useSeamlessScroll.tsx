import { useRef, useState, useEffect, useCallback } from "react";
import {
  createSeamlessScroll,
  ScrollOptions,
  SeamlessScrollResult,
  ScrollState,
  ScrollMethods,
} from "@seamless-scroll/core";
import type { SeamlessScrollProps, SeamlessScrollStyles } from "@seamless-scroll/shared";

// 扩展 SeamlessScrollProps 以支持 React 特定的样式类型
export type ReactSeamlessScrollProps = SeamlessScrollProps<React.CSSProperties>;

// 扩展 SeamlessScrollStyles 以支持 React 特定的样式类型
export type ReactSeamlessScrollStyles = SeamlessScrollStyles<React.CSSProperties>;

export function useSeamlessScroll(
  props: Omit<ReactSeamlessScrollProps, "data" | "children"> & { data: any[] },
) {
  // 引用DOM元素
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const realListRef = useRef<HTMLDivElement | null>(null);

  // 实例引用
  const instanceRef = useRef<SeamlessScrollResult | null>(null);

  // 滚动状态
  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrolling: false,
    isPaused: false,
    isHovering: false,
    scrollDistance: 0,
    isScrollNeeded: false,
    minClones: 0,
    contentSize: 0,
    containerSize: 0,
  });

  // 将属性转换为核心库选项
  const getScrollOptions = useCallback((): ScrollOptions => {
    return {
      direction: props.direction || "vertical",
      speed: props.speed ?? 50,
      duration: props.duration ?? 500,
      pauseTime: props.pauseTime ?? 2000,
      hoverPause: props.hoverPause ?? true,
      autoScroll: props.autoScroll ?? true,
      step: props.step ?? 0,
      forceScrolling: props.forceScrolling ?? false,
    };
  }, [
    props.direction,
    props.speed,
    props.duration,
    props.pauseTime,
    props.hoverPause,
    props.autoScroll,
    props.step,
    props.forceScrolling,
  ]);

  // 初始化滚动
  const initScroll = useCallback(() => {
    if (!containerRef.current || !contentRef.current || !realListRef.current) {
      return;
    }

    // 销毁可能存在的实例
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }

    // 创建新实例
    instanceRef.current = createSeamlessScroll(
      containerRef.current,
      contentRef.current,
      realListRef.current,
      getScrollOptions(),
      {
        onScroll: (distance, direction) => {
          setScrollState((prev) => ({
            ...prev,
            scrollDistance: distance,
          }));
          if (props.onScroll) {
            props.onScroll(distance, direction);
          }
        },
        onItemClick: (item, index) => {
          if (props.onItemClick) {
            props.onItemClick(item, index);
          }
        },
      },
    );

    // 同步状态
    const updateState = () => {
      if (instanceRef.current) {
        const { state } = instanceRef.current;
        setScrollState({
          isScrolling: state.isScrolling,
          isPaused: state.isPaused,
          isHovering: state.isHovering,
          scrollDistance: state.scrollDistance,
          isScrollNeeded: state.isScrollNeeded,
          minClones: state.minClones,
          contentSize: state.contentSize,
          containerSize: state.containerSize,
        });
      }
    };

    // 初始状态更新
    updateState();

    // 定期更新状态
    const intervalId = setInterval(updateState, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [getScrollOptions, props.onScroll, props.onItemClick]);

  // 内容样式
  const styles = useCallback((): ReactSeamlessScrollStyles => {
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
        flexDirection: "column",
      },
      item: {
        boxSizing: "border-box",
      },
      empty: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#999",
      },
    };
  }, [
    scrollState.isScrolling,
    scrollState.isScrollNeeded,
    scrollState.scrollDistance,
    props.direction,
    props.duration,
  ]);

  // 在 React 生命周期钩子中初始化和清理
  useEffect(() => {
    const cleanup = initScroll();

    return () => {
      if (cleanup) cleanup();
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, [initScroll]);

  // 暴露方法
  const methods: ScrollMethods = {
    start: useCallback(() => instanceRef.current!.methods.start(), []),
    stop: useCallback(() => instanceRef.current!.methods.stop(), []),
    pause: useCallback(() => instanceRef.current!.methods.pause(), []),
    resume: useCallback(() => instanceRef.current!.methods.resume(), []),
    reset: useCallback(() => instanceRef.current!.methods.reset(), []),
    forceScroll: useCallback(() => instanceRef.current!.methods.forceScroll(), []),
    updateSize: useCallback(() => instanceRef.current!.methods.updateSize(), []),
    updateOptions: useCallback(
      (newOptions: Partial<ScrollOptions>) =>
        instanceRef.current!.methods.updateOptions(newOptions),
      [],
    ),
  };

  return {
    containerRef,
    contentRef,
    realListRef,
    state: scrollState,
    styles,
    methods,
  };
}
