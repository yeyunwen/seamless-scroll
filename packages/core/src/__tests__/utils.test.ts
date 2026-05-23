import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReadOnlyState, isNumber, throttle, useStateWithCallback } from "../utils";
import type { ScrollState } from "../types";

const createState = (): ScrollState => ({
  isScrolling: false,
  isPaused: false,
  isHovering: false,
  isScrollNeeded: false,
  scrollDistance: 0,
  contentSize: 0,
  containerSize: 0,
  minClones: 1,
  startIndex: 0,
  endIndex: 0,
  isVirtualized: false,
  itemSizeList: [],
  averageSize: 0,
  totalMeasuredItems: 0,
  typeSizes: {},
});

describe("工具函数行为", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("isNumber 只接受有效数字", () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(Number.NaN)).toBe(false);
    expect(isNumber("1")).toBe(false);
  });

  it("throttle 在间隔内只执行一次，并保留 this 与参数", () => {
    const fn = vi.fn(function (this: { label: string }, value: string) {
      return `${this.label}:${value}`;
    });
    const throttled = throttle(fn, 100);
    const context = { label: "ctx" };

    vi.setSystemTime(100);
    expect(throttled.call(context, "first")).toBe("ctx:first");
    expect(fn).toHaveBeenCalledTimes(1);

    vi.setSystemTime(150);
    expect(throttled.call(context, "ignored")).toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.setSystemTime(220);
    expect(throttled.call(context, "second")).toBe("ctx:second");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("只读状态允许读取但阻止直接写入", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const state = createState();
    const readOnlyState = createReadOnlyState(state);

    expect(readOnlyState.scrollDistance).toBe(0);
    expect(() => {
      (readOnlyState as ScrollState).scrollDistance = 10;
    }).toThrow(TypeError);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("scrollDistance"));
    expect(readOnlyState.scrollDistance).toBe(0);
  });

  it("无状态回调时 dispatch 只更新内部状态", () => {
    const [state, dispatch] = useStateWithCallback(createState());

    dispatch({ isScrolling: true, scrollDistance: 12 });

    expect(state.isScrolling).toBe(true);
    expect(state.scrollDistance).toBe(12);
  });

  it("未指定依赖时每次 dispatch 都触发回调", () => {
    const callback = vi.fn();
    const [state, dispatch] = useStateWithCallback(createState(), () => [callback, []]);

    dispatch({ isScrolling: true });
    dispatch({ scrollDistance: 20 });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(expect.objectContaining({ scrollDistance: 20 }));
    expect(state.scrollDistance).toBe(20);
  });

  it("指定依赖时只在依赖变化后触发回调", () => {
    const callback = vi.fn();
    const [, dispatch] = useStateWithCallback(createState(), () => [
      callback,
      ["scrollDistance", "isPaused", "unknown" as keyof ScrollState],
    ]);

    dispatch({ isScrolling: true });
    expect(callback).not.toHaveBeenCalled();

    dispatch({ scrollDistance: 10 });
    expect(callback).toHaveBeenCalledTimes(1);

    dispatch({ scrollDistance: 10 });
    expect(callback).toHaveBeenCalledTimes(1);

    dispatch({ isPaused: true });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(expect.objectContaining({ isPaused: true }));
  });
});
