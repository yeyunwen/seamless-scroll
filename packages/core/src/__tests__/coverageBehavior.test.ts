import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSeamlessScroll } from "../seamlessScroll";
import type { ScrollOptions, SeamlessScrollResult } from "../types";

const setElementSize = (element: HTMLElement, width: number, height: number) => {
  Object.defineProperty(element, "clientWidth", { value: width, configurable: true });
  Object.defineProperty(element, "clientHeight", { value: height, configurable: true });
  Object.defineProperty(element, "offsetWidth", { value: width, configurable: true });
  Object.defineProperty(element, "offsetHeight", { value: height, configurable: true });
};

const createElements = (width = 200, height = 200, contentWidth = 400, contentHeight = 400) => {
  const container: HTMLElement = document.createElement("div");
  const content: HTMLElement = document.createElement("div");
  const realList: HTMLElement = document.createElement("div");

  setElementSize(container, width, height);
  setElementSize(content, contentWidth, contentHeight);
  setElementSize(realList, contentWidth, contentHeight);

  return { container, content, realList };
};

const createInstance = (options: Partial<ScrollOptions> = {}, size = createElements()) => {
  const instance = createSeamlessScroll(size.container, size.content, size.realList, {
    autoScroll: false,
    dataTotal: 10,
    duration: 100,
    forceScrolling: true,
    hoverPause: true,
    itemSize: 40,
    pauseTime: 0,
    speed: 100,
    virtual: false,
    wheelScroll: true,
    ...options,
  });

  return { ...size, instance };
};

const mockAnimationFrame = () => {
  const callbacks: FrameRequestCallback[] = [];
  let id = 0;
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    callbacks.push(callback);
    id += 1;
    return id;
  });
  const cancelAnimationFrame = vi.fn();

  vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);
  vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);

  return { callbacks, requestAnimationFrame, cancelAnimationFrame };
};

describe("核心覆盖率补充行为", () => {
  let instances: SeamlessScrollResult[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    instances.forEach((instance) => instance.destroy());
    instances = [];
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("支持函数形式 DOM 引用，并在引用丢失时返回安全的虚拟范围", () => {
    const elements = createElements();
    const { container } = elements;
    let { content, realList } = elements;
    const instance = createSeamlessScroll(
      () => container,
      () => content,
      () => realList,
      {
        autoScroll: false,
        dataTotal: 20,
        forceScrolling: true,
        itemSize: 20,
        virtual: true,
      },
    );
    instances.push(instance);

    expect(instance.state.isVirtualized).toBe(true);

    realList = null as unknown as HTMLElement;
    expect(instance.methods.getVirtualCloneRange()).toEqual({ startIndex: 0, endIndex: -1 });

    content = null as unknown as HTMLElement;
    instance.methods.reset();
    expect(instance.state.scrollDistance).toBe(0);
  });

  it("尺寸读取遇到短暂空引用时使用默认尺寸并保持实例可销毁", () => {
    const first = createElements();
    let containerCalls = 0;
    const firstInstance = createSeamlessScroll(
      () => {
        containerCalls += 1;
        return containerCalls <= 2 ? first.container : null;
      },
      () => first.content,
      () => first.realList,
      {
        autoScroll: false,
        dataTotal: 4,
        forceScrolling: true,
        itemSize: 100,
        virtual: false,
      },
    );
    instances.push(firstInstance);
    expect(firstInstance.state.containerSize).toBe(0);
    expect(firstInstance.state.minClones).toBe(0);

    const second = createElements();
    let realListCalls = 0;
    const secondInstance = createSeamlessScroll(
      () => second.container,
      () => second.content,
      () => {
        realListCalls += 1;
        return realListCalls === 2 ? null : second.realList;
      },
      {
        autoScroll: false,
        dataTotal: 4,
        forceScrolling: true,
        itemSize: 100,
        virtual: false,
      },
    );
    instances.push(secondInstance);
    expect(secondInstance.state.isScrollNeeded).toBe(true);
  });

  it("内容尺寸为 0 时保留已有克隆数量并允许安全重算", () => {
    const size = createElements(200, 200, 0, 0);
    const { instance } = createInstance({ forceScrolling: false, itemSize: undefined }, size);
    instances.push(instance);

    expect(instance.state.contentSize).toBe(0);
    expect(instance.state.minClones).toBe(1);
    expect(instance.state.isScrollNeeded).toBe(false);
  });

  it("固定尺寸预测、更新配置和非虚拟克隆范围保持可预期", () => {
    const { instance } = createInstance({ dataTotal: 0, virtual: false });
    instances.push(instance);

    expect(instance.methods.predictItemSize(3)).toBe(40);
    expect(instance.methods.getVirtualCloneRange()).toEqual({ startIndex: 0, endIndex: -1 });

    instance.methods.updateOptions({ dataTotal: 5, speed: 180 });
    expect(instance.state.endIndex).toBe(4);
  });

  it("动态尺寸缓存支持更新已有项目、无类型项目和最小尺寸兜底", () => {
    const { instance } = createInstance({
      dataTotal: 20,
      itemSize: undefined,
      minItemSize: 20,
      virtual: true,
    });
    instances.push(instance);

    instance.methods.updateItemSizeList(0, 10, "small");
    expect(instance.state.itemSizeList[0]).toBe(20);
    expect(instance.methods.predictItemSize(0)).toBe(20);

    instance.methods.updateItemSizeList(0, 50, "small");
    expect(instance.state.totalMeasuredItems).toBe(1);
    expect(instance.state.typeSizes.small.average).toBe(50);
    expect(instance.methods.predictItemSize(3, "small")).toBe(50);

    instance.methods.updateItemSizeList(1, 70);
    instance.methods.updateItemSizeList(1, 90);
    expect(instance.state.totalMeasuredItems).toBe(2);
    expect(instance.methods.predictItemSize(8)).toBe(70);
  });

  it("动态虚拟滚动在线性扫描和二分扫描下都能更新可见起点", () => {
    const linear = createInstance(
      {
        dataTotal: 10,
        itemSize: undefined,
        minItemSize: 20,
        virtual: true,
        virtualScrollBuffer: 0,
      },
      createElements(200, 60, 400, 400),
    );
    instances.push(linear.instance);

    linear.container.dispatchEvent(new MouseEvent("mouseenter"));
    linear.container.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: 60 }));
    expect(linear.instance.state.scrollDistance).toBe(60);
    expect(linear.instance.state.startIndex).toBe(3);

    linear.container.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: 139 }));
    expect(linear.instance.state.scrollDistance).toBe(199);
    expect(linear.instance.state.startIndex).toBe(0);

    const binary = createInstance(
      {
        dataTotal: 10,
        itemSize: undefined,
        minItemSize: 20,
        virtual: true,
        virtualScrollBuffer: 0,
      },
      createElements(200, 60, 400, 400),
    );
    instances.push(binary.instance);
    for (let index = 0; index < 8; index += 1) {
      binary.instance.methods.updateItemSizeList(index, 20 + index);
    }

    binary.container.dispatchEvent(new MouseEvent("mouseenter"));
    binary.container.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: 80 }));

    expect(binary.instance.state.scrollDistance).toBe(80);
    expect(binary.instance.state.startIndex).toBeGreaterThan(0);
  });

  it("自动滚动初始化后会进入动画循环并在暂停时间后继续", () => {
    const { callbacks, requestAnimationFrame } = mockAnimationFrame();
    const size = createElements(5, 5, 10, 10);
    const { content, instance } = createInstance(
      {
        autoScroll: true,
        duration: 10,
        forceScrolling: true,
        itemSize: undefined,
        pauseTime: 30,
        speed: 1000,
        virtual: false,
      },
      size,
    );
    instances.push(instance);

    vi.advanceTimersByTime(0);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    callbacks.shift()?.(100);
    callbacks.shift()?.(120);

    expect(instance.state.scrollDistance).toBe(0);
    expect(content.style.transform).toBe("translateY(0px)");

    vi.advanceTimersByTime(30);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(3);
  });

  it("暂停时间为 0 时动画结束后立即进入下一帧", () => {
    const { callbacks, requestAnimationFrame } = mockAnimationFrame();
    const { instance } = createInstance({ duration: 10, pauseTime: 0, speed: 100 });
    instances.push(instance);

    instance.methods.start();
    callbacks.shift()?.(100);
    callbacks.shift()?.(120);

    expect(instance.state.isScrolling).toBe(true);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(3);
  });

  it("停止滚动会清理暂停定时器和重置定时器", () => {
    const { callbacks } = mockAnimationFrame();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { instance } = createInstance({ autoScroll: true, duration: 10, pauseTime: 50 });
    instances.push(instance);

    vi.advanceTimersByTime(0);
    callbacks.shift()?.(100);
    callbacks.shift()?.(120);
    instance.methods.stop();
    expect(clearTimeoutSpy).toHaveBeenCalled();

    instance.methods.reset();
    instance.methods.stop();
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(3);
  });

  it("强制滚动会在内容不足时开启滚动", () => {
    const { requestAnimationFrame } = mockAnimationFrame();
    const size = createElements(200, 200, 100, 100);
    const { instance } = createInstance(
      { forceScrolling: false, itemSize: undefined, virtual: false },
      size,
    );
    instances.push(instance);

    expect(instance.state.isScrollNeeded).toBe(false);
    instance.methods.forceScroll();

    expect(instance.state.isScrollNeeded).toBe(true);
    expect(instance.state.isScrolling).toBe(true);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it("鼠标移出会恢复由悬停触发的暂停滚动", () => {
    const { requestAnimationFrame } = mockAnimationFrame();
    const { container, instance } = createInstance({ hoverPause: true });
    instances.push(instance);

    instance.methods.start();
    container.dispatchEvent(new MouseEvent("mouseenter"));
    expect(instance.state.isPaused).toBe(true);
    expect(instance.state.isScrolling).toBe(false);

    container.dispatchEvent(new MouseEvent("mouseleave"));
    expect(instance.state.isPaused).toBe(false);
    expect(instance.state.isScrolling).toBe(true);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it("未暂停时调用 pause 或 resume 不会改变当前状态", () => {
    const { instance } = createInstance();
    instances.push(instance);

    instance.methods.pause();
    expect(instance.state.isPaused).toBe(false);

    instance.methods.resume();
    expect(instance.state.isScrolling).toBe(false);
  });

  it("观察者可以清理、重置并通过节流回调触发尺寸更新", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const callbacks: ResizeObserverCallback[] = [];

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback);
      }

      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
    }

    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    vi.setSystemTime(200);

    const { container, instance, realList } = createInstance();
    instances.push(instance);

    expect(observe).toHaveBeenCalledWith(container);
    expect(observe).toHaveBeenCalledWith(realList);

    instance.methods.clearObserver();
    expect(disconnect).toHaveBeenCalledTimes(1);

    instance.methods.resetObserver();
    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(observe).toHaveBeenCalledTimes(4);

    setElementSize(container, 300, 300);
    callbacks[callbacks.length - 1]?.([], {} as ResizeObserver);
    expect(instance.state.containerSize).toBe(300);
  });
});
