<script setup lang="ts">
import { DEFAULT_OPTIONS } from "@seamless-scroll/core";
import type { SeamlessScrollRef } from "@seamless-scroll/shared";
import { useSeamlessScroll } from "./useSeamlessScroll";
import { computed, watch, nextTick, CSSProperties } from "vue";
import { HooksProps, VueSeamlessScrollProps, VueSeamlessScrollStyles } from "./types";

// 基本 props 定义
const props = withDefaults(defineProps<VueSeamlessScrollProps>(), {
  ...DEFAULT_OPTIONS,
  containerWidth: "100%",
  containerHeight: "100%",
  virtualScrollBuffer: 5,
  itemSize: 50,
});

// 定义自定义事件
const emit = defineEmits<{
  // TODO: item 类型优化
  (e: "itemClick", item: any, index: number): void;
}>();

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
    dataTotal: props.dataTotal,
  };
});

// 使用滚动 hook
const { containerRef, contentRef, realListRef, state, methods, getVirtualItems } =
  useSeamlessScroll(hooksProps);

// 根据虚拟滚动获取需要渲染的项目列表
const virtualItems = computed(() => {
  return getVirtualItems(props.data);
});

// 计算克隆列表项目 - 只包含可见区域的项目
const cloneItems = computed(() => {
  if (!state.value.isVirtualized) {
    return props.data;
  }

  // 计算可见项目数量
  const isVertical = props.direction === "vertical";
  const containerSize = isVertical
    ? containerRef.value?.clientHeight || 0
    : containerRef.value?.clientWidth || 0;
  const itemSize = props.itemSize;

  // 计算容器中可显示的项目数量，增加一个缓冲
  const visibleCount = Math.ceil(containerSize / itemSize) + 2;

  // 从原始数据中截取前visibleCount个项目
  return props.data.slice(0, Math.min(visibleCount, props.data.length));
});

// 是否启用了虚拟滚动
const isVirtualized = computed(() => {
  return state.value.isVirtualized;
});

// 获取虚拟滚动的起始索引
const startIndex = computed(() => state.value.startIndex);

// 为项目生成唯一键
const getItemKey = (item: any, index: number, prefix = "") => {
  if (!props.itemKey) return `${prefix}-${index}`;

  if (typeof props.itemKey === "function") {
    return `${prefix}-${props.itemKey(item, index)}`;
  }

  return `${prefix}-${item[props.itemKey] ?? index}`;
};

// 集中所有样式逻辑
const styles = computed<VueSeamlessScrollStyles>(() => {
  const isVertical = props.direction === "vertical";

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
      flexDirection: isVertical ? "column" : "row",
      willChange: "transform",
      position: "relative",
      height: "100%",
      // transform由core控制，不在这里设置
    },
    list: {
      display: "flex",
      flexDirection: isVertical ? "column" : "row",
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

// 为虚拟滚动优化，确保realList容器维持完整高度
const getVirtualRealListStyle = computed<CSSProperties>(() => {
  if (!state.value.isVirtualized || !props.itemSize || !props.dataTotal) {
    return {};
  }
  const isVertical = props.direction === "vertical";
  const totalSize = props.dataTotal * props.itemSize;
  if (isVertical) {
    return {
      position: "relative",
      height: `${totalSize}px`,
      minHeight: `${totalSize}px`,
    };
  }
  return {
    position: "relative",
    width: `${totalSize}px`,
    minWidth: `${totalSize}px`,
    height: "100%",
  };
});

// 计算虚拟滚动项的位置偏移
const getVirtualItemStyle = (index: number): CSSProperties => {
  if (!state.value.isVirtualized || !props.itemSize) {
    return {};
  }

  const totalItems = props.dataTotal || props.data.length;

  // 确保索引始终在原始数据范围内
  const normalizedIndex = totalItems > 0 ? index % totalItems : 0;

  // 计算真实位置
  const position = props.itemSize * normalizedIndex;
  const isVertical = props.direction === "vertical";

  return {
    position: "absolute",
    transform: isVertical ? `translateY(${position}px)` : `translateX(${position}px)`,
    [isVertical ? "height" : "width"]: `${props.itemSize}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
};

// 处理项目点击
const handleItemClick = (item: any, index: number) => {
  emit("itemClick", item, index);
};

watch(
  () => props.data,
  (newVal) => {
    if (!newVal.length) {
      methods.clearObserver();
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
        :style="{ ...styles.list, ...getVirtualRealListStyle }"
      >
        <!-- 虚拟滚动时只渲染可见项目 -->
        <template v-if="isVirtualized">
          <div
            v-for="(item, i) in virtualItems"
            class="seamless-scroll-item"
            :key="getItemKey(item, i, 'real')"
            :style="{
              ...styles.item,
              ...getVirtualItemStyle(
                item._virtualScrollOriginalIndex ?? (startIndex + i) % data.length,
              ),
            }"
            @click="
              handleItemClick(
                item,
                item._virtualScrollOriginalIndex ?? (startIndex + i) % data.length,
              )
            "
          >
            <slot
              :item="item"
              :index="item._virtualScrollOriginalIndex ?? (startIndex + i) % data.length"
            >
              {{ JSON.stringify(item) }}
            </slot>
          </div>
        </template>
        <!-- 非虚拟滚动时渲染全部项目 -->
        <template v-else>
          <div
            v-for="(item, index) in data"
            class="seamless-scroll-item"
            :key="getItemKey(item, index, 'real')"
            :style="styles.item"
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
            v-for="(item, index) in cloneItems"
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
