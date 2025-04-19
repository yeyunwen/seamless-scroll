import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useSeamlessScroll } from "./useSeamlessScroll";
import type { SeamlessScrollRef } from "@seamless-scroll/shared";
import { DEFAULT_OPTIONS } from "@seamless-scroll/core";
import {
  ChildrenRenderFunction,
  ReactSeamlessScrollProps,
  ReactSeamlessScrollStyles,
} from "./types";

// 组件默认属性
const defaultProps = {
  ...DEFAULT_OPTIONS,
  containerHeight: "100%",
  containerWidth: "100%",
};

const SeamlessScroll = forwardRef<SeamlessScrollRef, ReactSeamlessScrollProps>((props, ref) => {
  const isInit = useRef(false);

  // 合并默认值和传入属性
  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  const {
    data,
    children,
    customClass,
    style,
    emptyRender,
    containerWidth,
    containerHeight,
    direction,
  } = mergedProps;

  // 使用滚动 hook
  const { containerRef, contentRef, realListRef, state, methods } = useSeamlessScroll(mergedProps);

  // 内容样式
  const styles = useMemo((): ReactSeamlessScrollStyles => {
    const isVertical = direction === "vertical";

    return {
      container: {
        height: typeof containerHeight === "number" ? `${containerHeight}px` : containerHeight,
        width: typeof containerWidth === "number" ? `${containerWidth}px` : containerWidth,
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
  }, [direction, containerHeight, containerWidth]);

  // 渲染内容
  const renderItem = (item: any, index: number) => {
    if (typeof children === "function") {
      return (children as ChildrenRenderFunction)({ item, index });
    } else if (isValidElement(children)) {
      return cloneElement(children, {
        item,
        index,
      } as any);
    } else {
      return JSON.stringify(item);
    }
  };

  const renderItems = (isClone: boolean = false) => {
    return data.map((item, index) => (
      <div
        key={`${isClone ? "clone" : "real"}-${index}`}
        className="smooth-scroll-item"
        style={styles.item}
        onClick={() => props.onItemClick?.(item, index)}
      >
        {renderItem(item, index)}
      </div>
    ));
  };

  // 监听数据变化
  useEffect(() => {
    if (!isInit.current) {
      isInit.current = true;
      return;
    }

    if (!data.length) {
      methods.clearObeserver();
    } else {
      setTimeout(() => {
        // 数据变化时，重置滚动状态并更新尺寸
        methods.reset();
        // 等待 DOM 更新后重新计算尺寸
        methods.updateSize();
        // 观察最新的 DOM
        methods.resetObserver();
      }, 0);
    }
  }, [data, methods, containerRef, realListRef]);

  // 暴露方法给父组件
  useImperativeHandle(
    ref,
    () => ({
      start: methods.start,
      stop: methods.stop,
      pause: methods.pause,
      resume: methods.resume,
      reset: methods.reset,
      forceScroll: methods.forceScroll,
      updateSize: methods.updateSize,
      setObserver: methods.setObserver,
      clearObserver: methods.clearObeserver,
      resetObserver: methods.resetObserver,
    }),
    [methods],
  );

  return (
    <div
      ref={containerRef}
      className={`smooth-scroll-container ${customClass || ""}`}
      style={{ ...styles.container, ...style }}
    >
      {/* 使用key确保在数据变化时，这两个div不会被React复用 */}
      {data.length > 0 ? (
        <div
          key="content"
          ref={contentRef}
          className="smooth-scroll-content"
          style={styles.content}
        >
          <div ref={realListRef} className="smooth-scroll-real-list" style={styles.list}>
            {renderItems(false)}
          </div>
          {state.isScrollNeeded && (
            <>
              {Array.from({ length: state.minClones }).map((_, index) => (
                <div
                  key={`clone-${index}`}
                  className="smooth-scroll-clone-list"
                  style={styles.list}
                >
                  {renderItems(true)}
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <div key="empty" className="smooth-scroll-empty" style={styles.empty}>
          {emptyRender || "无数据"}
        </div>
      )}
    </div>
  );
});

// 添加显示名称
SeamlessScroll.displayName = "SeamlessScrollReact";

export default SeamlessScroll;
