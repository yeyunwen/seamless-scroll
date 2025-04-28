<script setup lang="ts">
import { ref } from "vue";
import { SeamlessScroll } from "@seamless-scroll/vue";

const items = ref<{ id: number; text: string }[]>([
  { id: 1, text: "公告1" },
  { id: 2, text: "公告2" },
  { id: 3, text: "公告3" },
]);

const handleItemClick = (item: { id: number; text: string }) => {
  console.log("点击了项目:", item);
};
</script>

<template>
  <div class="app">
    <SeamlessScroll
      :data="items"
      :container-height="200"
      :duration="1000"
      forceScrolling
      @item-click="handleItemClick"
    >
      <template #default="{ item, index }">
        <div>{{ `${index + 1} ${item.text}` }}</div>
      </template>
    </SeamlessScroll>
  </div>
</template>
