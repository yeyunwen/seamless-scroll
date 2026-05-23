import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSeamlessScroll } from "../seamlessScroll";
import type { ScrollOptions, SeamlessScrollResult } from "../types";

const setElementSize = (element: HTMLElement, width: number, height: number) => {
  Object.defineProperty(element, "clientWidth", { value: width, configurable: true });
  Object.defineProperty(element, "clientHeight", { value: height, configurable: true });
  Object.defineProperty(element, "offsetWidth", { value: width, configurable: true });
  Object.defineProperty(element, "offsetHeight", { value: height, configurable: true });
};

const appendChildren = (element: HTMLElement, count: number) => {
  for (let i = 0; i < count; i++) {
    element.appendChild(document.createElement("div"));
  }
};

const createInstance = (options: Partial<ScrollOptions> = {}) => {
  const container = document.createElement("div");
  const content = document.createElement("div");
  const realList = document.createElement("div");

  setElementSize(container, 200, 200);
  setElementSize(realList, 400, 400);
  appendChildren(realList, options.dataTotal ?? 4);

  const instance = createSeamlessScroll(container, content, realList, {
    autoScroll: false,
    dataTotal: 4,
    duration: 100,
    forceScrolling: true,
    itemSize: 100,
    pauseTime: 0,
    speed: 100,
    virtual: false,
    ...options,
  });

  return { container, content, instance, realList };
};

describe("核心滚动行为", () => {
  let instances: SeamlessScrollResult[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    instances.forEach((instance) => instance.destroy());
    instances = [];
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("支持 start、pause、resume、stop、reset 状态流转", () => {
    const { content, instance } = createInstance();
    instances.push(instance);

    instance.methods.start();
    expect(instance.state.isScrolling).toBe(true);

    instance.methods.pause();
    expect(instance.state.isScrolling).toBe(false);
    expect(instance.state.isPaused).toBe(true);

    instance.methods.resume();
    expect(instance.state.isPaused).toBe(false);
    expect(instance.state.isScrolling).toBe(true);

    instance.methods.stop();
    expect(instance.state.isScrolling).toBe(false);

    instance.methods.reset();
    expect(instance.state.scrollDistance).toBe(0);
    expect(content.style.transform).toBe("translateY(0px)");
  });

  it("内容小于容器且 forceScrolling 为 false 时不会滚动", () => {
    const { instance, realList } = createInstance({ forceScrolling: false });
    instances.push(instance);
    setElementSize(realList, 100, 100);

    instance.methods.updateSize();
    instance.methods.start();

    expect(instance.state.isScrollNeeded).toBe(false);
    expect(instance.state.isScrolling).toBe(false);
  });

  it("内容小于容器但 forceScrolling 为 true 时仍可滚动", () => {
    const { instance, realList } = createInstance({ forceScrolling: true });
    instances.push(instance);
    setElementSize(realList, 100, 100);

    instance.methods.updateSize();
    instance.methods.start();

    expect(instance.state.isScrollNeeded).toBe(true);
    expect(instance.state.isScrolling).toBe(true);
  });

  it("更新 direction 或 reverse 时会重置滚动位置", () => {
    const { content, instance } = createInstance({ direction: "vertical" });
    instances.push(instance);

    instance.methods.updateOptions({ direction: "horizontal", reverse: true, speed: 200 });

    expect(instance.state.scrollDistance).toBe(0);
    expect(content.style.transform).toBe("translateX(-400px)");
  });

  it("destroy 后移除滚轮监听并重置 transform", () => {
    const { container, content, instance } = createInstance({ wheelScroll: true });
    instances.push(instance);

    instance.methods.start();
    container.dispatchEvent(new MouseEvent("mouseenter"));
    container.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: 80 }));
    expect(instance.state.scrollDistance).toBe(80);

    instance.destroy();
    container.dispatchEvent(new WheelEvent("wheel", { cancelable: true, deltaY: 80 }));

    expect(instance.state.scrollDistance).toBe(0);
    expect(content.style.transform).toBe("");
  });
});

describe("核心虚拟滚动行为", () => {
  let instances: SeamlessScrollResult[] = [];

  afterEach(() => {
    instances.forEach((instance) => instance.destroy());
    instances = [];
    vi.restoreAllMocks();
  });

  it("virtual 为 false 时不启用虚拟滚动", () => {
    const { instance } = createInstance({ dataTotal: 200, virtual: false });
    instances.push(instance);

    expect(instance.state.isVirtualized).toBe(false);
  });

  it("auto 模式仅在达到阈值且提供尺寸配置时启用虚拟滚动", () => {
    const small = createInstance({ dataTotal: 99, itemSize: 20, virtual: "auto" });
    instances.push(small.instance);
    expect(small.instance.state.isVirtualized).toBe(false);

    const large = createInstance({ dataTotal: 100, itemSize: 20, virtual: "auto" });
    instances.push(large.instance);
    expect(large.instance.state.isVirtualized).toBe(true);
    expect(large.instance.state.contentSize).toBe(2000);
  });

  it("auto 模式缺少尺寸配置时回退为非虚拟滚动", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { instance } = createInstance({
      dataTotal: 100,
      itemSize: undefined,
      minItemSize: undefined,
      virtual: "auto",
    });
    instances.push(instance);

    expect(instance.state.isVirtualized).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("virtual=auto requires"));
  });

  it("virtual 为 true 但缺少尺寸配置时抛出明确错误", () => {
    expect(() =>
      createInstance({
        dataTotal: 100,
        itemSize: undefined,
        minItemSize: undefined,
        virtual: true,
      }),
    ).toThrow("virtual=true requires itemSize or minItemSize");
  });

  it("能够计算固定尺寸虚拟滚动范围", () => {
    const { instance } = createInstance({
      dataTotal: 100,
      itemSize: 20,
      virtual: true,
      virtualScrollBuffer: 2,
    } as Partial<ScrollOptions>);
    instances.push(instance);

    expect(instance.state.isVirtualized).toBe(true);
    expect(instance.state.startIndex).toBe(0);
    expect(instance.state.endIndex).toBe(14);
    expect(instance.methods.getVirtualCloneRange()).toEqual({ startIndex: 0, endIndex: 14 });
  });

  it("以不可变方式更新动态尺寸缓存并按类型预测尺寸", () => {
    const { instance } = createInstance({
      dataTotal: 100,
      itemSize: undefined,
      minItemSize: 20,
      virtual: true,
    });
    instances.push(instance);

    const before = instance.state.itemSizeList;
    instance.methods.updateItemSizeList(0, 40, "large");
    instance.methods.updateItemSizeList(1, 60, "large");

    expect(instance.state.itemSizeList).not.toBe(before);
    expect(instance.state.averageSize).toBe(50);
    expect(instance.methods.predictItemSize(2, "large")).toBe(50);
    expect(instance.methods.predictItemSize(3)).toBe(50);
  });
});
