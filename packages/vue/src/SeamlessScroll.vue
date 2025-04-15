<script setup lang="ts">
import { DEFAULT_OPTIONS } from "@seamless-scroll/core";
import type { SeamlessScrollRef } from "@seamless-scroll/shared";
import { useSeamlessScroll } from "./useSeamlessScroll";
import { computed } from "vue";
import { HooksProps, VueSeamlessScrollProps, VueSeamlessScrollStyles } from "./types";

// 基本 props 定义
const props = withDefaults(defineProps<VueSeamlessScrollProps>(), {
  ...DEFAULT_OPTIONS,
  containerWidth: "100%",
  containerHeight: "100%",
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
  };
});

// 使用滚动 hook
const { containerRef, contentRef, realListRef, state, methods } = useSeamlessScroll(hooksProps);

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
      // transform由core控制，不在这里设置
    },
    list: {
      display: "flex",
      flexDirection: "column",
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

// 处理项目点击
const handleItemClick = (item: any, index: number) => {
  emit("itemClick", item, index);
};

// 暴露方法
defineExpose<SeamlessScrollRef>({
  start: methods.start,
  stop: methods.stop,
  pause: methods.pause,
  resume: methods.resume,
  reset: methods.reset,
  forceScroll: methods.forceScroll,
  updateSize: methods.updateSize,
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
      <div ref="realListRef" class="seamless-scroll-real-list" :style="styles.list">
        <div
          v-for="(item, index) in data"
          class="seamless-scroll-item"
          :key="`real-${index}`"
          :style="styles.item"
          @click="handleItemClick(item, index)"
        >
          <slot :item="item" :index="index">
            {{ JSON.stringify(item) }}
          </slot>
        </div>
      </div>
      <div
        v-for="cloneIndex in state.minClones"
        :key="`clone-${cloneIndex}`"
        class="seamless-scroll-clone-list"
        :style="styles.list"
      >
        <div
          v-for="(item, index) in data"
          class="seamless-scroll-item"
          :key="`clone-${cloneIndex}-${index}`"
          :style="styles.item"
          @click="handleItemClick(item, index)"
        >
          <slot :item="item" :index="index">
            {{ JSON.stringify(item) }}
          </slot>
        </div>
      </div>
    </div>
    <div v-else class="seamless-scroll-empty" :style="styles.empty">
      <slot name="empty">无数据</slot>
    </div>
  </div>
</template>
