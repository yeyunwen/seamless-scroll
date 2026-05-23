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

describe("core scroll behavior", () => {
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

  it("supports start, pause, resume, stop and reset state transitions", () => {
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

  it("does not scroll when content is smaller and forceScrolling is false", () => {
    const { instance, realList } = createInstance({ forceScrolling: false });
    instances.push(instance);
    setElementSize(realList, 100, 100);

    instance.methods.updateSize();
    instance.methods.start();

    expect(instance.state.isScrollNeeded).toBe(false);
    expect(instance.state.isScrolling).toBe(false);
  });

  it("scrolls when forceScrolling is true even if content is smaller", () => {
    const { instance, realList } = createInstance({ forceScrolling: true });
    instances.push(instance);
    setElementSize(realList, 100, 100);

    instance.methods.updateSize();
    instance.methods.start();

    expect(instance.state.isScrollNeeded).toBe(true);
    expect(instance.state.isScrolling).toBe(true);
  });

  it("updates options and resets when direction or reverse changes", () => {
    const { content, instance } = createInstance({ direction: "vertical" });
    instances.push(instance);

    instance.methods.updateOptions({ direction: "horizontal", reverse: true, speed: 200 });

    expect(instance.state.scrollDistance).toBe(0);
    expect(content.style.transform).toBe("translateX(-400px)");
  });

  it("destroy removes wheel listeners and resets transform", () => {
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

describe("core virtual scroll behavior", () => {
  let instances: SeamlessScrollResult[] = [];

  afterEach(() => {
    instances.forEach((instance) => instance.destroy());
    instances = [];
    vi.restoreAllMocks();
  });

  it("does not enable virtual scrolling when virtual is false", () => {
    const { instance } = createInstance({ dataTotal: 200, virtual: false });
    instances.push(instance);

    expect(instance.state.isVirtualized).toBe(false);
  });

  it("auto enables virtual scrolling only after threshold and with size option", () => {
    const small = createInstance({ dataTotal: 99, itemSize: 20, virtual: "auto" });
    instances.push(small.instance);
    expect(small.instance.state.isVirtualized).toBe(false);

    const large = createInstance({ dataTotal: 100, itemSize: 20, virtual: "auto" });
    instances.push(large.instance);
    expect(large.instance.state.isVirtualized).toBe(true);
    expect(large.instance.state.contentSize).toBe(2000);
  });

  it("auto falls back to non-virtual scrolling without size option", () => {
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

  it("throws clear error when virtual is true without size option", () => {
    expect(() =>
      createInstance({
        dataTotal: 100,
        itemSize: undefined,
        minItemSize: undefined,
        virtual: true,
      }),
    ).toThrow("virtual=true requires itemSize or minItemSize");
  });

  it("calculates fixed-size virtual range", () => {
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

  it("updates dynamic item measurements immutably and predicts by type", () => {
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
