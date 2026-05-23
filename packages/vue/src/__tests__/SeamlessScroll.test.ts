import { defineComponent, h, nextTick, ref, type Ref } from "vue";
import { createApp, type App } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScrollOptions, ScrollState } from "@seamless-scroll/core";
import type { SeamlessScrollRef } from "@seamless-scroll/shared";
import SeamlessScroll from "../SeamlessScroll.vue";
import { useSeamlessScroll } from "../useSeamlessScroll";
import type { HooksProps } from "../types";

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
    (args[0] as () => unknown)();
    (args[1] as () => unknown)();
    (args[2] as () => unknown)();

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

const mount = async (component: ReturnType<typeof defineComponent>) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const app = createApp(component);
  const instance = app.mount(container);
  await nextTick();

  return { app, container, instance };
};

const cleanup = (mounted: Array<{ app: App; container: HTMLElement }>) => {
  for (const item of mounted) {
    item.app.unmount();
    item.container.remove();
  }
};

describe("Vue 组件单测", () => {
  const mounted: Array<{ app: App; container: HTMLElement }> = [];

  beforeEach(() => {
    vi.useFakeTimers();
    createSeamlessScrollMock.mockClear();
    Object.values(methodSpies).forEach((spy) => spy.mockClear());
  });

  afterEach(() => {
    cleanup(mounted);
    mounted.length = 0;
    vi.useRealTimers();
  });

  it("空数据时渲染 empty 插槽，且 expose 方法未初始化也不报错", async () => {
    const scrollRef = ref<SeamlessScrollRef>();
    const result = await mount(
      defineComponent({
        setup() {
          return () =>
            h(SeamlessScroll, { ref: scrollRef, data: [] }, { empty: () => h("span", "暂无内容") });
        },
      }),
    );
    mounted.push(result);

    expect(result.container.textContent).toContain("暂无内容");
    expect(createSeamlessScrollMock).not.toHaveBeenCalled();
    expect(() => {
      scrollRef.value?.start();
      scrollRef.value?.stop();
      scrollRef.value?.pause();
      scrollRef.value?.resume();
      scrollRef.value?.reset();
      scrollRef.value?.forceScroll();
      scrollRef.value?.updateSize();
      scrollRef.value?.clearObserver();
      scrollRef.value?.resetObserver();
      scrollRef.value?.predictItemSize(0);
    }).not.toThrow();
  });

  it("非虚拟模式渲染真实列表和克隆列表，并触发 itemClick", async () => {
    const onItemClick = vi.fn();
    const result = await mount(
      defineComponent({
        setup() {
          return () =>
            h(
              SeamlessScroll,
              {
                data,
                virtual: false,
                itemKey: "id",
                onItemClick,
              },
              {
                default: ({ item, index }: { item: Item; index: number }) =>
                  h("span", `${index}-${item.text}`),
              },
            );
        },
      }),
    );
    mounted.push(result);

    const items = result.container.querySelectorAll(".seamless-scroll-item");
    expect(items).toHaveLength(8);
    expect(result.container.textContent).toContain("0-第一项");

    items[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();

    expect(onItemClick).toHaveBeenCalledWith(data[1], 1);

    items[5].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();

    expect(onItemClick).toHaveBeenLastCalledWith(data[1], 1);
    expect(methodSpies.updateOptions).toHaveBeenCalledWith(
      expect.objectContaining({ virtual: false }),
    );
  });

  it("虚拟模式只渲染可视范围，并上报项目尺寸", async () => {
    const onItemClick = vi.fn();
    const result = await mount(
      defineComponent({
        setup() {
          return () =>
            h(
              SeamlessScroll,
              { data, virtual: true, itemSize: 20, minItemSize: 10, onItemClick },
              {
                default: ({ item, index }: { item: Item; index: number }) =>
                  h("span", `${index}:${item.text}`),
              },
            );
        },
      }),
    );
    mounted.push(result);

    expect(result.container.textContent).toContain("1:第二项");
    expect(result.container.textContent).toContain("2:第三项");
    expect(result.container.textContent).not.toContain("0:第一项");
    expect(methodSpies.updateItemSizeList).toHaveBeenCalledWith(1, 0, "even");

    const firstVirtualItem = result.container.querySelector(".seamless-scroll-item")!;
    firstVirtualItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();

    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }), 1);

    const firstCloneItem = result.container.querySelector(
      ".seamless-scroll-clone-list .seamless-scroll-item",
    )!;
    firstCloneItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();

    expect(onItemClick).toHaveBeenLastCalledWith(expect.objectContaining({ id: "b" }), 0);
  });

  it("水平虚拟模式支持函数 itemKey，并在数据清空时清理 observer", async () => {
    const currentData = ref(data);
    const result = await mount(
      defineComponent({
        setup() {
          return () =>
            h(
              SeamlessScroll,
              {
                data: currentData.value,
                direction: "horizontal",
                virtual: true,
                minItemSize: 20,
                itemKey: (item: unknown) => (item as Item).id,
              },
              {
                default: ({ item, index }: { item: Item; index: number }) =>
                  h("strong", `${index}-${item.id}`),
              },
            );
        },
      }),
    );
    mounted.push(result);

    expect(result.container.textContent).toContain("1-b");
    expect(
      (result.container.querySelector(".seamless-scroll-real-list") as HTMLElement).style.minWidth,
    ).toBe("80px");

    currentData.value = [];
    await nextTick();

    expect(result.container.textContent).toContain("无数据");
    expect(methodSpies.clearObserver).toHaveBeenCalled();
  });

  it("默认插槽回退渲染 JSON，并支持数字宽高和缺失字段 key 兜底", async () => {
    const plainData = [{ id: "x", text: "无需插槽" }];
    const result = await mount(
      defineComponent({
        setup() {
          return () =>
            h(SeamlessScroll, {
              data: plainData,
              virtual: false,
              containerHeight: 120,
              containerWidth: 240,
              itemKey: "missing",
            });
        },
      }),
    );
    mounted.push(result);

    const rootElement = result.container.querySelector(".seamless-scroll-container") as HTMLElement;
    expect(rootElement.style.height).toBe("120px");
    expect(rootElement.style.width).toBe("240px");
    expect(result.container.textContent).toContain(JSON.stringify(plainData[0]));
  });

  it("hook 在 DOM 就绪后使用默认配置初始化，并暴露安全方法", async () => {
    let exposed: ReturnType<typeof useSeamlessScroll<Item>> | undefined;
    const hooksProps = ref<HooksProps>({ dataTotal: 2 }) as Ref<HooksProps>;
    const result = await mount(
      defineComponent({
        setup() {
          const hook = useSeamlessScroll<Item>(hooksProps);
          exposed = hook;

          return () =>
            h("div", { ref: hook.containerRef }, [
              h("div", { ref: hook.contentRef }, [h("div", { ref: hook.realListRef })]),
            ]);
        },
      }),
    );
    mounted.push(result);

    expect(createSeamlessScrollMock).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({
        autoScroll: true,
        forceScrolling: false,
        hoverPause: true,
        pauseTime: undefined,
        virtual: "auto",
        virtualScrollBuffer: 5,
        virtualThreshold: 100,
        wheelScroll: true,
      }),
      expect.any(Function),
    );

    exposed?.methods.start();
    exposed?.methods.stop();
    exposed?.methods.pause();
    exposed?.methods.resume();
    exposed?.methods.reset();
    exposed?.methods.forceScroll();
    exposed?.methods.updateSize();
    exposed?.methods.updateOptions({ speed: 12 });
    exposed?.methods.setObserver(document.createElement("div"), document.createElement("div"));
    exposed?.methods.clearObserver();
    exposed?.methods.resetObserver();
    exposed?.methods.updateItemSizeList(0, 20);
    expect(exposed?.methods.predictItemSize(1)).toBe(21);
    expect(exposed?.methods.getVirtualCloneRange()).toEqual({ startIndex: 1, endIndex: 2 });
    expect(methodSpies.start).toHaveBeenCalled();
    expect(methodSpies.updateOptions).toHaveBeenCalledWith({ speed: 12 });
    expect(methodSpies.setObserver).toHaveBeenCalled();
    expect(exposed?.getVirtualItems([])).toEqual([]);
    expect(exposed?.getVirtualItems([{ id: "x", text: "测试" }])).toEqual([
      expect.objectContaining({ _originalIndex: 0, id: "x" }),
    ]);
  });
});
