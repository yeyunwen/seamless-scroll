import {
  cloneElement,
  CSSProperties,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useSeamlessScroll, VirtualScrollItem } from "./useSeamlessScroll";
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
  itemSize: undefined,
  minItemSize: undefined,
  dataTotal: 0,
};

const SeamlessScroll = forwardRef<SeamlessScrollRef, ReactSeamlessScrollProps>((props, ref) => {
  const isInit = useRef(false);

  // 合并默认值和传入属性
  const mergedProps = {
    ...defaultProps,
    ...props,
    dataTotal: props.data.length,
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
  const { containerRef, contentRef, realListRef, state, methods, getVirtualItems } =
    useSeamlessScroll(mergedProps);

  const itemElements = useRef<Map<number, HTMLElement>>(new Map());

  const isVertical = useCallback(() => {
    return direction === "vertical";
  }, [direction]);

  // 内容样式
  const styles = useMemo((): ReactSeamlessScrollStyles => {
    return {
      container: {
        height: typeof containerHeight === "number" ? `${containerHeight}px` : containerHeight,
        width: typeof containerWidth === "number" ? `${containerWidth}px` : containerWidth,
        overflow: "hidden",
        position: "relative",
      },
      content: {
        display: "flex",
        flexDirection: isVertical() ? "column" : "row",
        willChange: "transform",
        position: "relative",
        height: "100%",
        // transform由core控制，不在这里设置
      },
      list: {
        display: "flex",
        flexDirection: isVertical() ? "column" : "row",
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
  }, [containerHeight, containerWidth, isVertical]);

  const virtualItems = useMemo(() => {
    return getVirtualItems(data);
  }, [getVirtualItems, data]);

  // 计算克隆列表项目 - 只包含可见区域的项目
  const virtualCloneItems = useMemo(() => {
    if (!state.isVirtualized) {
      return [];
    }
    const { startIndex, endIndex } = methods.getVirtualCloneRange();
    return data.slice(startIndex, endIndex);
  }, [data, methods, state.isVirtualized]);

  // 为虚拟滚动优化，确保realList容器维持完整高度
  const virtualRealListStyle = useMemo<CSSProperties>(() => {
    console.log("virtualRealListStyle", state.contentSize);
    if (!state.isVirtualized) {
      return {};
    }

    if (isVertical()) {
      return {
        position: "relative",
        minHeight: `${state.contentSize}px`,
      };
    }

    return {
      position: "relative",
      minWidth: `${state.contentSize}px`,
      height: "100%",
    };
  }, [state.isVirtualized, state.contentSize, isVertical]);

  const getVirtualItemStyle = useCallback(
    (index: number): CSSProperties => {
      if (!state.isVirtualized) {
        return {};
      }

      const totalItems = props.data.length;

      // 确保索引始终在原始数据范围内
      const normalizedIndex = totalItems > 0 ? index % totalItems : 0;

      // 计算真实位置 - 使用预测函数获取更准确的位置
      let position = 0;

      // 计算该项之前所有项目的累积尺寸
      for (let i = 0; i < normalizedIndex; i++) {
        position += methods.predictItemSize(i);
      }

      return {
        position: "absolute",
        transform: isVertical() ? `translateY(${position}px)` : `translateX(${position}px)`,
        ...(props.itemSize ? { [isVertical() ? "height" : "width"]: `${props.itemSize}px` } : {}),
        display: "flex",
      };
    },
    [props.itemSize, props.data.length, state.isVirtualized, isVertical, methods],
  );

  // 为项目生成唯一键
  const getItemKey = useCallback(
    (item: any, index: number, prefix = "") => {
      if (!props.itemKey) return `${prefix}-${index}`;

      if (typeof props.itemKey === "function") {
        return `${prefix}-${props.itemKey(item, index)}`;
      }

      return `${prefix}-${(item as any)[props.itemKey] ?? index}`;
    },
    [props],
  );

  // 拿到项目元素
  const itemRef = useCallback(
    (el: any, item: VirtualScrollItem<any>) => {
      if (!el) return;

      const index = item._originalIndex;
      const type = typeof (item as any).type === "string" ? (item as any).type : undefined;
      // 获取元素的尺寸
      const size = isVertical() ? el.offsetHeight : el.offsetWidth;
      // 更新到 Core
      methods.updateItemSizeList(index, size, type);
      // 添加到 DOM 引用映射
      itemElements.current.set(index, el);

      // 为 DOM 元素添加数据属性
      el.dataset.index = index.toString();
      if (type) {
        el.dataset.itemType = type;
      }
    },
    [isVertical, methods],
  );

  // 渲染内容
  const renderItem = useCallback(
    (item: any, index: number) => {
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
    },
    [children],
  );

  const renderItems = useCallback(
    (isClone: boolean = false) => {
      if (!isClone) {
        if (state.isVirtualized) {
          return virtualItems.map((item, index) => (
            <div
              key={getItemKey(item, index, `real-${index}`)}
              className="smooth-scroll-item"
              style={{ ...styles.item, ...getVirtualItemStyle(item._originalIndex) }}
              ref={(el) => itemRef(el, item)}
              onClick={() => props.onItemClick?.(item, item._originalIndex)}
            >
              {renderItem(item, item._originalIndex)}
            </div>
          ));
        } else {
          return data.map((item, index) => (
            <div
              key={getItemKey(item, index, `real-${index}`)}
              className="smooth-scroll-item"
              style={{ ...styles.item }}
              onClick={() => props.onItemClick?.(item, index)}
            >
              {renderItem(item, index)}
            </div>
          ));
        }
      } else {
        if (state.isVirtualized) {
          return virtualCloneItems.map((item, index) => (
            <div
              key={getItemKey(item, index, `clone-${index}`)}
              className="smooth-scroll-item"
              style={styles.item}
              onClick={() => props.onItemClick?.(item, index)}
            >
              {renderItem(item, index)}
            </div>
          ));
        } else {
          return data.map((item, index) => (
            <div
              key={getItemKey(item, index, `clone-${index}`)}
              className="smooth-scroll-item"
              style={styles.item}
              onClick={() => props.onItemClick?.(item, index)}
            >
              {renderItem(item, index)}
            </div>
          ));
        }
      }
    },
    [
      props,
      data,
      virtualItems,
      virtualCloneItems,
      styles,
      state.isVirtualized,
      getVirtualItemStyle,
      getItemKey,
      itemRef,
      renderItem,
    ],
  );

  // 监听数据变化
  useEffect(() => {
    if (!isInit.current) {
      isInit.current = true;
      return;
    }

    if (!data.length) {
      methods.clearObserver();
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
  }, [data, containerRef, realListRef, methods]);

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
      clearObserver: methods.clearObserver,
      resetObserver: methods.resetObserver,
      updateItemSizeList: methods.updateItemSizeList,
      predictItemSize: methods.predictItemSize,
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
          <div
            ref={realListRef}
            className="smooth-scroll-real-list"
            style={{ ...styles.list, ...virtualRealListStyle }}
          >
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

export default SeamlessScroll;
