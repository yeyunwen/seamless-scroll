<script setup lang="ts" generic="T">
import { computed, watch, nextTick, CSSProperties, ref, onMounted, onUnmounted } from "vue";
import { DEFAULT_OPTIONS } from "@seamless-scroll/core";
import type { SeamlessScrollRef, VirtualScrollItem } from "@seamless-scroll/shared";
import { useSeamlessScroll } from "./useSeamlessScroll";
import { HooksProps, VueSeamlessScrollProps, VueSeamlessScrollStyles } from "./types";

// 基本 props 定义
const props = withDefaults(defineProps<VueSeamlessScrollProps<T>>(), {
  ...DEFAULT_OPTIONS,
  containerWidth: "100%",
  containerHeight: "100%",
  virtualScrollBuffer: 5,
  itemSize: undefined, // 可以不设置固定高度
  minItemSize: undefined, // 设置默认的最小项目尺寸，确保至少有一个尺寸参数存在
});

// 定义自定义事件
const emit = defineEmits<{
  (e: "itemClick", item: T, index: number): void;
}>();

// 存储项目元素引用和观察者
const itemElements = ref<Map<number, HTMLElement>>(new Map());

const hooksProps = computed<HooksProps>(() => {
  return {
    direction: props.direction,
    speed: props.speed,
    duration: props.duration,
    pauseTime: props.pauseTime,
    hoverPause: props.hoverPause,
    autoScroll: props.autoScroll,
    forceScrolling: props.autoScroll,
    virtualScrollBuffer: props.virtualScrollBuffer,
    itemSize: props.itemSize,
    minItemSize: props.minItemSize,
    dataTotal: props.data.length,
  };
});

// 使用滚动 hook，传递泛型参数T
const { containerRef, contentRef, realListRef, state, methods, getVirtualItems } =
  useSeamlessScroll<T>(hooksProps);

const isVertical = computed(() => {
  return props.direction === "vertical";
});

// 是否启用了虚拟滚动
const isVirtualized = computed(() => {
  return state.value.isVirtualized;
});

// 根据虚拟滚动获取需要渲染的项目列表
const virtualItems = computed<VirtualScrollItem<T>[]>(() => {
  return getVirtualItems(props.data);
});

// 集中所有样式逻辑
const styles = computed<VueSeamlessScrollStyles>(() => {
  return {
    container: {
      height:
        typeof props.containerHeight === "number"
          ? `${props.containerHeight}px`
          : props.containerHeight,
      width:
        typeof props.containerWidth === "number"
          ? `${props.containerWidth}px`
          : props.containerWidth,
      overflow: "hidden",
      position: "relative",
    },
    content: {
      display: "flex",
      flexDirection: isVertical.value ? "column" : "row",
      willChange: "transform",
      position: "relative",
      height: "100%",
      // transform由core控制，不在这里设置
    },
    list: {
      display: "flex",
      flexDirection: isVertical.value ? "column" : "row",
    },
    item: {
      boxSizing: "border-box",
    },
    empty: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "#999",
    },
  };
});

// 计算克隆列表项目 - 只包含可见区域的项目
const virtualCloneItems = computed<T[]>(() => {
  const { startIndex, endIndex } = methods.getVirtualCloneRange();
  return props.data.slice(startIndex, endIndex);
});

// 为虚拟滚动优化，确保realList容器维持完整高度
const virtualRealListStyle = computed<CSSProperties>(() => {
  if (!state.value.isVirtualized) {
    return {};
  }

  if (isVertical.value) {
    return {
      position: "relative",
      minHeight: `${state.value.contentSize}px`,
    };
  }

  return {
    position: "relative",
    minWidth: `${state.value.contentSize}px`,
    height: "100%",
  };
});

// 计算虚拟滚动项的位置偏移
const getVirtualItemStyle = (index: number): CSSProperties => {
  if (!state.value.isVirtualized) {
    return {};
  }

  const totalItems = props.data.length;

  // 确保索引始终在原始数据范围内
  const normalizedIndex = totalItems > 0 ? index % totalItems : 0;

  // 计算真实位置 - 使用预测函数获取更准确的位置
  let position = 0;

  // 计算该项之前所有项目的累积尺寸
  for (let i = 0; i < normalizedIndex; i++) {
    position += methods.predictItemSize(i);
  }

  return {
    position: "absolute",
    transform: isVertical.value ? `translateY(${position}px)` : `translateX(${position}px)`,
    ...(props.itemSize ? { [isVertical.value ? "height" : "width"]: `${props.itemSize}px` } : {}),
    display: "flex",
  };
};

// 处理项目点击
const handleItemClick = (item: T, index: number) => {
  emit("itemClick", item, index);
};

// 拿到项目元素
const itemRef = (el: any, item: VirtualScrollItem<T>) => {
  if (!el) return;

  const index = item._originalIndex;
  const type = typeof (item as any).type === "string" ? (item as any).type : undefined;
  // 获取元素的尺寸
  const size = isVertical.value ? el.offsetHeight : el.offsetWidth;
  // 更新到 Core
  methods.updateItemSizeList(index, size, type);
  // 添加到 DOM 引用映射
  itemElements.value.set(index, el);

  // 为 DOM 元素添加数据属性
  el.dataset.index = index.toString();
  if (type) {
    el.dataset.itemType = type;
  }
};

// 为项目生成唯一键
const getItemKey = (item: T, index: number, prefix = "", isVirtualized = false) => {
  const _index = isVirtualized ? (item as any)._originalIndex : index;

  if (!props.itemKey) {
    return `${prefix}-${_index}`;
  }
  if (typeof props.itemKey === "function") {
    return `${prefix}-${props.itemKey(item, _index)}`;
  }

  return `${prefix}-${(item as any)[props.itemKey] ?? _index}`;
};

watch(
  () => props.data,
  (newVal) => {
    if (!newVal.length) {
      methods.clearObserver();
      itemElements.value.clear();
    } else {
      nextTick(() => {
        methods.reset();
        methods.updateSize();
        // 重新设置 observer
        methods.resetObserver();
      });
    }
  },
);

// 当挂载或更新时测量所有项目
onMounted(() => {
  nextTick(() => {});
});

// 清理观察者
onUnmounted(() => {
  itemElements.value.clear();
});

// 暴露方法
defineExpose<SeamlessScrollRef>({
  start: methods.start,
  stop: methods.stop,
  pause: methods.pause,
  resume: methods.resume,
  reset: methods.reset,
  forceScroll: methods.forceScroll,
  updateSize: methods.updateSize,
  setObserver: methods.setObserver,
  clearObserver: methods.clearObserver,
  resetObserver: methods.resetObserver,
  updateItemSizeList: methods.updateItemSizeList,
  predictItemSize: methods.predictItemSize,
});
</script>

<template>
  <div
    ref="containerRef"
    :class="`seamless-scroll-container ${customClass || ''}`"
    :style="{ ...styles.container, ...style }"
  >
    <div
      v-if="data.length > 0"
      ref="contentRef"
      class="seamless-scroll-content"
      :style="styles.content"
    >
      <!-- 原始列表 -->
      <div
        ref="realListRef"
        class="seamless-scroll-real-list"
        :style="{
          ...styles.list,
          ...virtualRealListStyle,
        }"
      >
        <!-- 虚拟滚动时只渲染可见项目 -->
        <template v-if="isVirtualized">
          <div
            v-for="(item, i) in virtualItems"
            class="seamless-scroll-item"
            :key="getItemKey(item, i, 'real', true)"
            :style="{
              ...styles.item,
              ...getVirtualItemStyle(item._originalIndex),
            }"
            @click="handleItemClick(item, item._originalIndex)"
            :ref="(el) => itemRef(el, item)"
            :data-index="item._originalIndex"
            :data-item-type="(item as any).type"
          >
            <slot :item="item" :index="item._originalIndex">
              {{ JSON.stringify(item) }}
            </slot>
          </div>
        </template>
        <!-- 非虚拟滚动时渲染全部项目 -->
        <template v-else>
          <div
            v-for="(item, index) in data"
            :key="getItemKey(item, index, 'real')"
            class="seamless-scroll-item"
            :style="styles.item"
            :data-index="index"
            :data-item-type="(item as any).type"
            @click="handleItemClick(item, index)"
          >
            <slot :item="item" :index="index">
              {{ JSON.stringify(item) }}
            </slot>
          </div>
        </template>
      </div>

      <!-- 克隆列表 -->
      <div
        v-for="cloneIndex in state.minClones"
        :key="`clone-${cloneIndex}`"
        class="seamless-scroll-clone-list"
        :style="styles.list"
      >
        <!-- 虚拟滚动的克隆列表 -->
        <template v-if="isVirtualized">
          <div
            v-for="(item, index) in virtualCloneItems"
            class="seamless-scroll-item"
            :key="getItemKey(item, index, `clone-${cloneIndex}`)"
            :style="styles.item"
            @click="handleItemClick(item, index)"
          >
            <slot :item="item" :index="index">
              {{ JSON.stringify(item) }}
            </slot>
          </div>
        </template>
        <!-- 非虚拟滚动的克隆列表 -->
        <template v-else>
          <div
            v-for="(item, index) in data"
            class="seamless-scroll-item"
            :key="getItemKey(item, index, `clone-${cloneIndex}`)"
            :style="styles.item"
            @click="handleItemClick(item, index)"
          >
            <slot :item="item" :index="index">
              {{ JSON.stringify(item) }}
            </slot>
          </div>
        </template>
      </div>
    </div>
    <div v-else class="seamless-scroll-empty" :style="styles.empty">
      <slot name="empty">无数据</slot>
    </div>
  </div>
</template>
