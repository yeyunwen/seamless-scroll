import { describe, it, expect, vi, afterAll, beforeEach } from "vitest";
import { createSeamlessScroll } from "../seamlessScroll";
import type { SeamlessScrollResult } from "../types";

describe("ReadOnly State Tests", () => {
  let container: HTMLElement;
  let content: HTMLElement;
  let realList: HTMLElement;
  let cloneList: HTMLElement;
  let scrollInstance: SeamlessScrollResult;

  // 模拟console.warn
  const originalWarn = console.warn;
  const mockWarn = vi.fn();

  beforeEach(() => {
    // 设置DOM元素
    container = document.createElement("div");
    content = document.createElement("div");
    realList = document.createElement("div");
    cloneList = document.createElement("div");

    // 设置元素尺寸
    Object.defineProperty(container, "clientHeight", { value: 200 });
    Object.defineProperty(container, "clientWidth", { value: 200 });
    Object.defineProperty(realList, "clientHeight", { value: 400 });
    Object.defineProperty(realList, "clientWidth", { value: 400 });

    // 替换console.warn为模拟函数
    console.warn = mockWarn;

    // 使用fake timers
    vi.useFakeTimers();

    // 创建滚动实例
    scrollInstance = createSeamlessScroll(
      container,
      content,
      realList,
      cloneList,
      { autoScroll: false }, // 关闭自动滚动以便测试
    );

    // 直接设置isScrollNeeded为true以便滚动可以开始
    Object.defineProperty(scrollInstance.state, "isScrollNeeded", {
      value: true,
      configurable: true,
    });
  });

  afterAll(() => {
    // 清理模拟和恢复console.warn
    mockWarn.mockClear();
    console.warn = originalWarn;

    // 恢复真实计时器
    vi.useRealTimers();

    // 销毁滚动实例
    scrollInstance.destroy();
  });

  it("should provide read-only access to state properties", () => {
    // 验证可以读取状态
    expect(scrollInstance.state.isScrolling).toBeDefined();
    expect(typeof scrollInstance.state.isScrolling).toBe("boolean");
  });

  it("should prevent direct state modification and show warning", () => {
    // 尝试修改状态 - 使用try/catch捕获预期的错误
    expect(() => {
      // @ts-expect-error 故意尝试直接修改只读状态进行测试
      scrollInstance.state.isScrolling = true;
    }).toThrow(TypeError);

    expect(scrollInstance.state.isScrolling).toBe(false);
    // 验证警告被触发
    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringContaining("You cannot modify the state directly"),
    );

    // 验证状态未被修改
    expect(scrollInstance.state.isScrolling).toBe(false);
  });

  it("should update state correctly through methods", () => {
    // 初始状态应该是未滚动
    expect(scrollInstance.state.isScrolling).toBe(false);

    // 使用updateOptions更新配置，这是一个同步操作
    scrollInstance.methods.updateOptions({ forceScrolling: true });

    // 验证配置被更新
    expect(scrollInstance.state.isScrollNeeded).toBe(true);

    // 测试重置功能
    scrollInstance.methods.reset();
    expect(scrollInstance.state.scrollDistance).toBe(0);
  });
});
