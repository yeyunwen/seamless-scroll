import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  createSeamlessScroll,
  ScrollOptions,
  SeamlessScrollResult,
  ScrollState,
  ScrollMethods,
} from "@seamless-scroll/core";
import { HooksProps } from "./types";

export function useSeamlessScroll(props: HooksProps) {
  // 引用DOM元素
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const realListRef = useRef<HTMLDivElement | null>(null);

  // 实例引用
  const instanceRef = useRef<SeamlessScrollResult | null>(null);

  // 使用ref保存完整状态，避免不必要的渲染
  const stateRef = useRef<ScrollState>({
    isScrolling: false,
    isPaused: false,
    isHovering: false,
    scrollDistance: 0,
    isScrollNeeded: false,
    minClones: 0,
    contentSize: 0,
    containerSize: 0,
  });

  // 只保留影响UI渲染的状态用于触发重新渲染
  const [renderState, setRenderState] = useState({
    isScrollNeeded: false,
    minClones: 0,
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
      forceScrolling: props.forceScrolling ?? false,
    };
  }, [
    props.direction,
    props.speed,
    props.duration,
    props.pauseTime,
    props.hoverPause,
    props.autoScroll,
    props.forceScrolling,
  ]);

  // 初始化滚动 - 只依赖DOM引用，不依赖props
  const initScroll = useCallback(
    () => {
      console.log("initScroll");

      if (!containerRef.current || !contentRef.current || !realListRef.current) {
        return;
      }
      // 销毁可能存在的实例
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }

      // 创建新实例 - 使用当前的getScrollOptions()，而不是依赖它
      instanceRef.current = createSeamlessScroll(
        () => containerRef.current,
        () => contentRef.current,
        () => realListRef.current,
        getScrollOptions(),
        (state) => {
          // 更新内部状态引用，但不直接赋值整个对象
          const prevState = { ...stateRef.current };
          Object.assign(stateRef.current, state);

          // 仅当真正影响渲染的状态变化时才更新state
          if (
            state.isScrollNeeded !== prevState.isScrollNeeded ||
            state.minClones !== prevState.minClones
          ) {
            // 使用函数式更新避免闭包陷阱
            setRenderState({
              isScrollNeeded: state.isScrollNeeded,
              minClones: state.minClones,
            });
          }
        },
      );

      // 返回清理函数
      return () => {
        if (instanceRef.current) {
          instanceRef.current.destroy();
        }
      };
    },
    /* 不依赖getScrollOptions，只在DOM可用时初始化一次 */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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

  // 监听props变化，更新配置而不是重建实例
  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.methods.updateOptions(getScrollOptions());
    }
  }, [getScrollOptions]);

  // 暴露方法
  const methods = useMemo<ScrollMethods>(
    () => ({
      start: () => instanceRef.current?.methods.start(),
      stop: () => instanceRef.current?.methods.stop(),
      pause: () => instanceRef.current?.methods.pause(),
      resume: () => instanceRef.current?.methods.resume(),
      reset: () => instanceRef.current?.methods.reset(),
      forceScroll: () => instanceRef.current?.methods.forceScroll(),
      updateSize: () => instanceRef.current?.methods.updateSize(),
      updateOptions: (newOptions: Partial<ScrollOptions>) =>
        instanceRef.current?.methods.updateOptions(newOptions),
      setObserver: (container, realList) =>
        instanceRef.current?.methods.setObserver(container, realList),
      clearObeserver: () => instanceRef.current?.methods.clearObeserver(),
      resetObserver: () => instanceRef.current?.methods.resetObserver(),
    }),
    [],
  );

  // 合并渲染状态和内部状态提供完整状态接口
  const scrollState = useMemo<ScrollState>(
    () => ({
      ...stateRef.current,
      isScrollNeeded: renderState.isScrollNeeded,
      minClones: renderState.minClones,
    }),
    [renderState.isScrollNeeded, renderState.minClones],
  );

  return {
    containerRef,
    contentRef,
    realListRef,
    state: scrollState,
    methods,
  };
}
