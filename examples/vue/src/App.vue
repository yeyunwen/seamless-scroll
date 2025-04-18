<script setup lang="ts">
import { ref } from "vue";
import { SeamlessScroll } from "@seamless-scroll/vue";
import { type ListItem, listData as initListData, getItemStyle } from "../../shared/index";

// 配置选项
const direction = ref<"vertical" | "horizontal">("vertical");
const speed = ref(50);
const pauseTime = ref(2000);
const pauseOnHover = ref(true);
const rowHeight = ref(40);
const columnWidth = ref(200);
const scrollRef = ref();

// 数据
const listData = ref<ListItem[]>(initListData);

// 点击项目
const clickedItem = ref<any>(null);

const handleItemClick = (item: any, index: number) => {
  console.log("点击了项目:", item, "索引:", index);
  clickedItem.value = item;

  // 3秒后清除
  setTimeout(() => {
    if (clickedItem.value === item) {
      clickedItem.value = null;
    }
  }, 3000);
};

// 控制方法
const startScroll = () => scrollRef.value?.start();
const stopScroll = () => scrollRef.value?.stop();
const pauseScroll = () => scrollRef.value?.pause();
const resumeScroll = () => scrollRef.value?.resume();
const resetScroll = () => scrollRef.value?.reset();

// 激活快速滚动模式
const activateTestMode = () => {
  speed.value = 100; // 更快的滚动速度
  pauseTime.value = 500; // 更短的暂停时间
  resetScroll(); // 重置并使用新设置
};

const handleClearData = () => {
  listData.value = [];
};

const handleModifyData = () => {
  listData.value = [
    { id: 7, title: "项目 7", color: "#03a9f4" },
    { id: 8, title: "项目 8", color: "#00bcd4" },
    { id: 9, title: "项目 9", color: "#009688" },
    { id: 10, title: "项目 10", color: "#4caf50" },
  ];
};

const handleReset = () => {
  listData.value = initListData;
};
</script>

<template>
  <div class="examples-app">
    <h1>无缝滚动组件 - Vue 示例</h1>

    <div class="config-panel">
      <h2>配置</h2>
      <div class="config-group">
        <label>滚动方向:</label>
        <select v-model="direction">
          <option value="vertical">垂直方向</option>
          <option value="horizontal">水平方向</option>
        </select>
      </div>

      <div class="config-group">
        <label>滚动速度: {{ speed }}</label>
        <input type="range" v-model.number="speed" min="10" max="200" step="10" />
      </div>

      <div class="config-group">
        <label>暂停时间: {{ pauseTime }}ms</label>
        <input type="range" v-model.number="pauseTime" min="0" max="3000" step="100" />
      </div>

      <div class="config-group">
        <label>
          <input type="checkbox" v-model="pauseOnHover" />
          悬停时暂停
        </label>
      </div>

      <div class="config-group">
        <label>行高: {{ rowHeight }}px</label>
        <input type="range" v-model.number="rowHeight" min="20" max="80" step="5" />
      </div>
      <div class="config-group">
        <label>列宽: {{ columnWidth }}px</label>
        <input type="range" v-model.number="columnWidth" min="120" max="400" step="5" />
      </div>

      <div class="actions">
        <button @click="startScroll">开始</button>
        <button @click="stopScroll">停止</button>
        <button @click="pauseScroll">暂停</button>
        <button @click="resumeScroll">恢复</button>
        <button @click="resetScroll">重置</button>
        <button @click="activateTestMode" class="test-btn">快速滚动测试</button>
      </div>

      <div class="actions">
        <button @click="handleClearData">清空数据</button>
        <button @click="handleModifyData">修改数据</button>
        <button @click="handleReset">重置数据</button>
      </div>
    </div>

    <div class="demo-section">
      <h2>基础列表示例</h2>
      <div :class="['scroll-container', direction === 'horizontal' ? 'horizontal' : 'vertical']">
        <SeamlessScroll
          ref="scrollRef"
          :data="listData"
          :direction="direction"
          :speed="speed"
          :pause-time="pauseTime"
          :hover-pause="pauseOnHover"
          force-scrolling
          @itemClick="handleItemClick"
        >
          <template #default="{ item, index }">
            <div class="list-item" :style="getItemStyle(item, columnWidth, rowHeight)">
              {{ item.title }} ({{ index + 1 }})
            </div>
          </template>
        </SeamlessScroll>
      </div>

      <div v-if="clickedItem" class="clicked-info">点击了: {{ clickedItem.title }}</div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.app {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

h2 {
  margin-bottom: 15px;
  color: #42b883;
}

.config-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.config-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.config-group label {
  display: inline-block;
  width: 150px;
  margin-right: 10px;
}

.config-group input[type="range"] {
  flex: 1;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.actions button {
  padding: 8px 15px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.actions button:hover {
  background: #369a6e;
}

.demo-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.scroll-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
  height: 200px;
}

.list-item {
  padding: 0 15px;
  display: flex;
  align-items: center;
  border-left: 4px solid #42b883;
  background: white;
  transition: background 0.2s;
}

.list-item:hover {
  background: #f5f5f5;
}

.clicked-info {
  margin-top: 10px;
  padding: 10px;
  background: #e0f7fa;
  border-radius: 4px;
  animation: highlight 3s;
}

@keyframes highlight {
  0% {
    background: #b3e5fc;
  }
  100% {
    background: #e0f7fa;
  }
}

.test-btn {
  background-color: #ff5722 !important;
}
.test-btn:hover {
  background-color: #e64a19 !important;
}
</style>
