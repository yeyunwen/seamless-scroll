import { afterEach, describe, expect, it, vi } from "vitest";
import { createSeamlessScroll } from "../seamlessScroll";
import type { ScrollOptions, SeamlessScrollResult } from "../types";

const setElementSize = (element: HTMLElement, width: number, height: number) => {
  Object.defineProperty(element, "clientWidth", { value: width, configurable: true });
  Object.defineProperty(element, "clientHeight", { value: height, configurable: true });
};

const createInstance = (options: Partial<ScrollOptions> = {}) => {
  const container = document.createElement("div");
  const content = document.createElement("div");
  const realList = document.createElement("div");

  setElementSize(container, 200, 200);
  setElementSize(realList, 400, 400);

  const instance = createSeamlessScroll(container, content, realList, {
    autoScroll: false,
    dataTotal: 4,
    direction: "horizontal",
    forceScrolling: true,
    itemSize: 100,
    ...options,
  });

  return { content, instance };
};

describe("reverse scroll transform", () => {
  let instances: SeamlessScrollResult[] = [];

  afterEach(() => {
    instances.forEach((instance) => instance.destroy());
    instances = [];
    vi.useRealTimers();
  });

  it("keeps the default horizontal transform unchanged", () => {
    const { content, instance } = createInstance();
    instances.push(instance);

    instance.methods.reset();

    expect(content.style.transform).toBe("translateX(0px)");
  });

  it("starts horizontal reverse scroll from the negative content size", () => {
    const { content, instance } = createInstance({ reverse: true });
    instances.push(instance);

    instance.methods.reset();

    expect(content.style.transform).toBe("translateX(-400px)");
  });

  it("resets transform when reverse is updated", () => {
    const { content, instance } = createInstance();
    instances.push(instance);

    instance.methods.updateOptions({ reverse: true });

    expect(instance.state.scrollDistance).toBe(0);
    expect(content.style.transform).toBe("translateX(-400px)");
  });

  it("applies the same reverse rule vertically", () => {
    const { content, instance } = createInstance({
      direction: "vertical",
      reverse: true,
    });
    instances.push(instance);

    instance.methods.reset();

    expect(content.style.transform).toBe("translateY(-400px)");
  });
});
