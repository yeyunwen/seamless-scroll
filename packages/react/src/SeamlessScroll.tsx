import React, { forwardRef, useImperativeHandle, ReactNode, ReactElement } from "react";
import { useSeamlessScroll, ReactSeamlessScrollProps } from "./useSeamlessScroll";
import type { SeamlessScrollRef } from "@seamless-scroll/shared";
import { DEFAULT_OPTIONS } from "@seamless-scroll/core";

export interface RenderProps {
  item: any;
  index: number;
}

type ChildrenRenderFunction = (props: RenderProps) => ReactNode;

// 添加必要的属性确保与使用匹配
export interface SeamlessScrollComponentProps extends ReactSeamlessScrollProps {
  children?: ChildrenRenderFunction | ReactElement;
}

// 组件默认属性
const defaultProps = {
  ...DEFAULT_OPTIONS,
  containerHeight: "100%",
  containerWidth: "100%",
};

const SeamlessScroll = forwardRef<SeamlessScrollRef, SeamlessScrollComponentProps>((props, ref) => {
  // 合并默认值和传入属性
  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  const { data, children, customClass } = mergedProps;

  // 使用滚动 hook
  const { containerRef, contentRef, realListRef, state, methods, styles } = useSeamlessScroll({
    ...mergedProps,
  });

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    start: methods.start,
    stop: methods.stop,
    pause: methods.pause,
    resume: methods.resume,
    reset: methods.reset,
    forceScroll: methods.forceScroll,
    updateSize: methods.updateSize,
  }));

  // 渲染内容
  const renderItem = (item: any, index: number) => {
    if (typeof children === "function") {
      return (children as ChildrenRenderFunction)({ item, index });
    } else if (React.isValidElement(children)) {
      return React.cloneElement(children, {
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
        style={styles().item}
        onClick={() => props.onItemClick?.(item, index)}
      >
        {renderItem(item, index)}
      </div>
    ));
  };

  return (
    <div
      ref={containerRef}
      className={`smooth-scroll-container ${customClass || ""}`}
      style={styles().container}
    >
      {data.length > 0 ? (
        <div ref={contentRef} className="smooth-scroll-content" style={styles().content}>
          <div ref={realListRef} className="smooth-scroll-real-list" style={styles().list}>
            {renderItems(false)}
          </div>
          {state.isScrollNeeded && (
            <>
              {Array.from({ length: state.minClones }).map((_, index) => (
                <div
                  key={`clone-${index}`}
                  className="smooth-scroll-clone-list"
                  style={styles().list}
                >
                  {renderItems(true)}
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="smooth-scroll-empty">无数据</div>
      )}
    </div>
  );
});

// 添加显示名称
SeamlessScroll.displayName = "SeamlessScrollReact";

export default SeamlessScroll;
