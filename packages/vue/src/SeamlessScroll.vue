<script setup lang="ts">
import { DEFAULT_OPTIONS } from "@seamless-scroll/core";
import { useSeamlessScroll, type VueSeamlessScrollProps } from "./useSeamlessScroll";

const props = withDefaults(defineProps<VueSeamlessScrollProps>(), {
  ...DEFAULT_OPTIONS,
  containerHeight: "100%",
  containerWidth: "100%",
});

// 定义自定义事件
const emit = defineEmits<{
  (e: "scroll", distance: number, direction: string): void;
  // TODO: item 类型优化
  (e: "itemClick", item: any, index: number): void;
}>();

// 使用滚动 hook
const { containerRef, contentRef, realListRef, state, styles, methods } = useSeamlessScroll(props);

// 处理项目点击
const handleItemClick = (item: any, index: number) => {
  emit("itemClick", item, index);
};

// 暴露方法
defineExpose({
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
  <div ref="containerRef" class="seamless-scroll-container" :style="styles.container">
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
