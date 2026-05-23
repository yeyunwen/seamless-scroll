import React, { act, createRef, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScrollOptions, ScrollState } from "@seamless-scroll/core";
import type { SeamlessScrollRef } from "@seamless-scroll/shared";
import SeamlessScroll from "../SeamlessScroll";
import { useSeamlessScroll } from "../useSeamlessScroll";

const hoisted = vi.hoisted(() => {
  const defaultOptions = {
    direction: "vertical",
    reverse: false,
    speed: 50,
    duration: 500,
    pauseTime: 2000,
    hoverPause: true,
    wheelScroll: true,
    autoScroll: true,
    forceScrolling: true,
    virtual: "auto",
    virtualThreshold: 100,
    virtualScrollBuffer: 5,
  };
  const methodSpies = {
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    forceScroll: vi.fn(),
    updateSize: vi.fn(),
    updateOptions: vi.fn(),
    setObserver: vi.fn(),
    clearObserver: vi.fn(),
    resetObserver: vi.fn(),
    updateItemSizeList: vi.fn(),
    predictItemSize: vi.fn((index: number) => 20 + index),
    getVirtualCloneRange: vi.fn(() => ({ startIndex: 1, endIndex: 2 })),
    destroy: vi.fn(),
  };
  const createState = (options: ScrollOptions): ScrollState => {
    const isVirtualized = options.virtual === true;

    return {
      isScrolling: false,
      isPaused: false,
      isHovering: false,
      isScrollNeeded: true,
      scrollDistance: 0,
      contentSize: (options.dataTotal || 0) * (options.itemSize || options.minItemSize || 20),
      containerSize: 60,
      minClones: 1,
      startIndex: isVirtualized ? 1 : 0,
      endIndex: isVirtualized ? Math.min(2, options.dataTotal - 1) : options.dataTotal - 1,
      isVirtualized,
      itemSizeList: [],
      averageSize: options.itemSize || options.minItemSize || 20,
      totalMeasuredItems: 0,
      typeSizes: {},
    };
  };
  const createSeamlessScrollMock = vi.fn((...args: unknown[]) => {
    const options = args[3] as ScrollOptions;
    const onStateChange = args[4] as
      | (() => [(state: ScrollState) => void, (keyof ScrollState)[]])
      | undefined;
    const state = createState(options);
    const callbackTuple = onStateChange?.();
    callbackTuple?.[0](state);

    return {
      state,
      methods: {
        start: methodSpies.start,
        stop: methodSpies.stop,
        pause: methodSpies.pause,
        resume: methodSpies.resume,
        reset: methodSpies.reset,
        forceScroll: methodSpies.forceScroll,
        updateSize: methodSpies.updateSize,
        updateOptions: methodSpies.updateOptions,
        setObserver: methodSpies.setObserver,
        clearObserver: methodSpies.clearObserver,
        resetObserver: methodSpies.resetObserver,
        updateItemSizeList: methodSpies.updateItemSizeList,
        predictItemSize: methodSpies.predictItemSize,
        getVirtualCloneRange: methodSpies.getVirtualCloneRange,
      },
      destroy: methodSpies.destroy,
    };
  });

  return { defaultOptions, methodSpies, createSeamlessScrollMock };
});

const { methodSpies, createSeamlessScrollMock } = hoisted;

vi.mock("@seamless-scroll/core", () => ({
  DEFAULT_OPTIONS: hoisted.defaultOptions,
  createSeamlessScroll: hoisted.createSeamlessScrollMock,
}));

type Item = { id: string; text: string; type?: string };

const data: Item[] = [
  { id: "a", text: "第一项", type: "odd" },
  { id: "b", text: "第二项", type: "even" },
  { id: "c", text: "第三项", type: "odd" },
  { id: "d", text: "第四项", type: "even" },
];

const render = async (element: React.ReactElement) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(element);
  });

  return { container, root };
};

const cleanup = async (mounted: Array<{ root: Root; container: HTMLElement }>) => {
  for (const item of mounted) {
    await act(async () => {
      item.root.unmount();
    });
    item.container.remove();
  }
};

describe("React 组件单测", () => {
  const mounted: Array<{ root: Root; container: HTMLElement }> = [];

  beforeEach(() => {
    vi.useFakeTimers();
    createSeamlessScrollMock.mockClear();
    Object.values(methodSpies).forEach((spy) => spy.mockClear());
  });

  afterEach(async () => {
    await cleanup(mounted);
    mounted.length = 0;
    vi.useRealTimers();
  });

  it("空数据时渲染 emptyRender，且 ref 方法未初始化也不报错", async () => {
    const ref = createRef<SeamlessScrollRef>();
    const result = await render(
      <SeamlessScroll ref={ref} data={[]} emptyRender={<span>暂无内容</span>} />,
    );
    mounted.push(result);

    expect(result.container.textContent).toContain("暂无内容");
    expect(createSeamlessScrollMock).not.toHaveBeenCalled();

    expect(() => {
      ref.current?.start();
      ref.current?.stop();
      ref.current?.pause();
      ref.current?.resume();
      ref.current?.reset();
      ref.current?.forceScroll();
      ref.current?.updateSize();
      ref.current?.clearObserver();
      ref.current?.resetObserver();
      ref.current?.predictItemSize(0);
    }).not.toThrow();
  });

  it("非虚拟模式渲染真实列表和克隆列表，并触发点击回调", async () => {
    const onItemClick = vi.fn();
    const result = await render(
      <SeamlessScroll data={data} virtual={false} onItemClick={onItemClick} itemKey="id">
        {({ item, index }) => <span>{`${index}-${item.text}`}</span>}
      </SeamlessScroll>,
    );
    mounted.push(result);

    const items = result.container.querySelectorAll(".smooth-scroll-item");
    expect(items).toHaveLength(8);
    expect(result.container.textContent).toContain("0-第一项");

    await act(async () => {
      items[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onItemClick).toHaveBeenCalledWith(data[1], 1);

    await act(async () => {
      items[5].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onItemClick).toHaveBeenLastCalledWith(data[1], 1);
    expect(methodSpies.updateOptions).toHaveBeenCalledWith(
      expect.objectContaining({ virtual: false }),
    );
  });

  it("虚拟模式只渲染可视范围，并上报项目尺寸", async () => {
    const onItemClick = vi.fn();
    const result = await render(
      <SeamlessScroll
        data={data}
        virtual={true}
        itemSize={20}
        minItemSize={10}
        onItemClick={onItemClick}
      >
        {({ item, index }) => <span>{`${index}:${item.text}`}</span>}
      </SeamlessScroll>,
    );
    mounted.push(result);

    expect(result.container.textContent).toContain("1:第二项");
    expect(result.container.textContent).toContain("2:第三项");
    expect(result.container.textContent).not.toContain("0:第一项");
    expect(methodSpies.updateItemSizeList).toHaveBeenCalledWith(1, 0, "even");

    const firstVirtualItem = result.container.querySelector(".smooth-scroll-item")!;
    await act(async () => {
      firstVirtualItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }), 1);

    const firstCloneItem = result.container.querySelector(
      ".smooth-scroll-clone-list .smooth-scroll-item",
    )!;
    await act(async () => {
      firstCloneItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onItemClick).toHaveBeenLastCalledWith(expect.objectContaining({ id: "b" }), 0);
  });

  it("水平虚拟模式支持 ReactElement children、函数 itemKey 和数据变化重置", async () => {
    const Child = ({ item, index }: { item?: Item; index?: number }) => (
      <strong>{item ? `${index}-${item.id}` : "empty"}</strong>
    );
    const result = await render(
      <SeamlessScroll
        data={data}
        direction="horizontal"
        virtual={true}
        minItemSize={20}
        itemKey={(item) => item.id}
      >
        <Child />
      </SeamlessScroll>,
    );
    mounted.push(result);

    expect(result.container.textContent).toContain("1-b");
    expect(
      (result.container.querySelector(".smooth-scroll-real-list") as HTMLElement).style.minWidth,
    ).toBe("80px");

    await act(async () => {
      result.root.render(
        <SeamlessScroll data={[...data, { id: "e", text: "第五项" }]} direction="horizontal">
          <Child />
        </SeamlessScroll>,
      );
    });
    await act(async () => {
      vi.runAllTimers();
    });

    expect(methodSpies.reset).toHaveBeenCalled();
    expect(methodSpies.updateSize).toHaveBeenCalled();
    expect(methodSpies.resetObserver).toHaveBeenCalled();

    await act(async () => {
      result.root.render(<SeamlessScroll data={[]} direction="horizontal" />);
    });
    expect(result.container.textContent).toContain("无数据");
    expect(methodSpies.clearObserver).toHaveBeenCalled();
  });

  it("默认渲染 JSON 内容，并支持数字宽高和缺失字段 key 兜底", async () => {
    const plainData = [{ id: "x", text: "无需插槽" }];
    const result = await render(
      <SeamlessScroll
        data={plainData}
        virtual={false}
        containerHeight={120}
        containerWidth={240}
        itemKey="missing"
      />,
    );
    mounted.push(result);

    const rootElement = result.container.querySelector(".smooth-scroll-container") as HTMLElement;
    expect(rootElement.style.height).toBe("120px");
    expect(rootElement.style.width).toBe("240px");
    expect(result.container.textContent).toContain(JSON.stringify(plainData[0]));
  });

  it("hook 在 DOM 就绪后使用默认配置初始化，并暴露安全方法", async () => {
    let exposed: ReturnType<typeof useSeamlessScroll<Item>> | undefined;
    const HookHost = ({ dataTotal = 2 }: { dataTotal?: number }) => {
      const hook = useSeamlessScroll<Item>({ dataTotal });

      useEffect(() => {
        exposed = hook;
      }, [hook]);

      return (
        <div ref={hook.containerRef}>
          <div ref={hook.contentRef}>
            <div ref={hook.realListRef} />
          </div>
        </div>
      );
    };

    const result = await render(<HookHost />);
    mounted.push(result);

    expect(createSeamlessScrollMock).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({
        autoScroll: true,
        direction: "vertical",
        forceScrolling: false,
        hoverPause: true,
        pauseTime: 2000,
        reverse: false,
        speed: 50,
        virtual: "auto",
        virtualScrollBuffer: 5,
        virtualThreshold: 100,
        wheelScroll: true,
      }),
      expect.any(Function),
    );

    exposed?.methods.updateOptions({ speed: 12 });
    exposed?.methods.setObserver(document.createElement("div"), document.createElement("div"));
    expect(methodSpies.updateOptions).toHaveBeenCalledWith({ speed: 12 });
    expect(methodSpies.setObserver).toHaveBeenCalled();
    expect(exposed?.getVirtualItems([{ id: "x", text: "测试" }])).toEqual([
      expect.objectContaining({ _originalIndex: 0, id: "x" }),
    ]);
  });
});
