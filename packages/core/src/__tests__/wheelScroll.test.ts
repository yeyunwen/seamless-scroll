import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSeamlessScroll } from "../seamlessScroll";
import type { ScrollDirection, SeamlessScrollResult } from "../types";

describe("滚轮手动滚动", () => {
  let container: HTMLElement;
  let content: HTMLElement;
  let realList: HTMLElement;
  let scrollInstance: SeamlessScrollResult | null;

  const createElement = (height: number, width: number) => {
    const element = document.createElement("div");

    Object.defineProperty(element, "clientHeight", {
      value: height,
      configurable: true,
    });
    Object.defineProperty(element, "clientWidth", {
      value: width,
      configurable: true,
    });

    return element;
  };

  const createInstance = (direction: ScrollDirection = "vertical", wheelScroll = true) => {
    container = createElement(200, 200);
    content = createElement(400, 400);
    realList = createElement(400, 400);

    scrollInstance = createSeamlessScroll(container, content, realList, {
      autoScroll: false,
      dataTotal: 4,
      direction,
      forceScrolling: true,
      hoverPause: true,
      itemSize: 100,
      wheelScroll,
    });

    scrollInstance.methods.start();
    container.dispatchEvent(new MouseEvent("mouseenter"));

    return scrollInstance;
  };

  const dispatchWheel = (deltaY: number, deltaX = 0) => {
    const event = new WheelEvent("wheel", {
      cancelable: true,
      deltaX,
      deltaY,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    container.dispatchEvent(event);

    return preventDefaultSpy;
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    scrollInstance?.destroy();
    scrollInstance = null;
    vi.useRealTimers();
  });

  it("开启 wheelScroll 时，悬停暂停后可以用滚轮手动滚动", () => {
    const instance = createInstance();

    const preventDefaultSpy = dispatchWheel(80);

    expect(instance.state.scrollDistance).toBe(80);
    expect(content.style.transform).toBe("translateY(-80px)");
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("关闭 wheelScroll 时，滚轮不会改变滚动位置", () => {
    const instance = createInstance("vertical", false);

    const preventDefaultSpy = dispatchWheel(80);

    expect(instance.state.scrollDistance).toBe(0);
    expect(content.style.transform).toBe("");
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("水平模式下支持滚轮手动滚动", () => {
    const instance = createInstance("horizontal");

    dispatchWheel(0, 120);

    expect(instance.state.scrollDistance).toBe(120);
    expect(content.style.transform).toBe("translateX(-120px)");
  });

  it("销毁后不再响应滚轮事件", () => {
    const instance = createInstance();

    instance.destroy();
    dispatchWheel(80);

    expect(instance.state.scrollDistance).toBe(0);
    expect(content.style.transform).toBe("");
  });
});
