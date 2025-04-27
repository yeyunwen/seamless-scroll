<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
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

// 不定高度选项
const useDynamicSize = ref(false);
const minItemSize = ref(40); // 添加最小项目尺寸

// 数据
const listData = ref<ListItem[]>(initListData);

// 虚拟滚动配置
const enableVirtualScroll = ref(false);
const dataSize = ref(100);
const largeDataItems = ref<ListItem[]>([]);

// 性能监控
const fpsValues = ref<number[]>([]);
const fpsMonitorActive = ref(false);
const lastFrameTime = ref(performance.now());
const frameCount = ref(0);
const currentFps = ref(0);
const fpsUpdateInterval = 500; // 每500ms更新一次FPS
let fpsIntervalId: number | null = null;

// 生成大量数据
const generateLargeData = () => {
  const count = dataSize.value;
  const newData: ListItem[] = [];

  for (let i = 0; i < count; i++) {
    // 在动态大小模式下，为每个项目设置随机高度倍数
    const heightMultiplier = useDynamicSize.value ? Math.floor(Math.random() * 3) + 1 : 1;

    newData.push({
      id: i,
      title: `大数据项 ${i}`,
      color: getRandomColor(),
      heightMultiplier, // 新增：高度乘数，用于控制项目高度
      content:
        useDynamicSize.value && heightMultiplier > 1
          ? `这是一个高度为基础高度 ${heightMultiplier} 倍的项目，展示动态大小效果。`
          : undefined,
    });
  }

  largeDataItems.value = newData;
};

// 生成随机颜色
const getRandomColor = () => {
  const colors = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#9e9e9e",
    "#607d8b",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 当前显示的数据
const displayData = computed(() => {
  return enableVirtualScroll.value ? largeDataItems.value : listData.value;
});

// 计算要传递给组件的itemSize
const computedItemSize = computed(() => {
  if (useDynamicSize.value) {
    return undefined; // 不定高度模式，传递undefined
  }
  return direction.value === "vertical" ? rowHeight.value : columnWidth.value;
});

// 计算要传递的最小项目尺寸
const computedMinItemSize = computed(() => {
  if (!useDynamicSize.value) {
    return undefined; // 固定高度模式不需要最小尺寸
  }
  return minItemSize.value;
});

// 启动FPS监控
const startFpsMonitoring = () => {
  if (fpsIntervalId) return;

  fpsMonitorActive.value = true;
  fpsValues.value = [];
  frameCount.value = 0;
  lastFrameTime.value = performance.now();

  // 记录帧率
  const recordFrame = () => {
    frameCount.value++;
    requestAnimationFrame(recordFrame);
  };
  requestAnimationFrame(recordFrame);

  // 定期计算FPS
  fpsIntervalId = window.setInterval(() => {
    const now = performance.now();
    const elapsed = now - lastFrameTime.value;

    if (elapsed > 0) {
      currentFps.value = Math.round((frameCount.value * 1000) / elapsed);
      fpsValues.value.push(currentFps.value);

      // 只保留最近30个值
      if (fpsValues.value.length > 30) {
        fpsValues.value.shift();
      }

      frameCount.value = 0;
      lastFrameTime.value = now;
    }
  }, fpsUpdateInterval);
};

// 停止FPS监控
const stopFpsMonitoring = () => {
  if (fpsIntervalId) {
    clearInterval(fpsIntervalId);
    fpsIntervalId = null;
    fpsMonitorActive.value = false;
  }
};

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

// 切换虚拟滚动
const toggleVirtualScroll = (enabled: boolean) => {
  if (enabled && largeDataItems.value.length === 0) {
    generateLargeData();
  }
  // 如果开启了虚拟滚动，自动启动FPS监控
  if (enabled) {
    startFpsMonitoring();
  } else {
    stopFpsMonitoring();
  }
};

// 监听enableVirtualScroll变化
watch(enableVirtualScroll, (newValue) => {
  toggleVirtualScroll(newValue);
});

// 监听useDynamicSize变化
watch(useDynamicSize, () => {
  generateLargeData();
  resetScroll();
});

// 重新生成数据
const regenerateData = () => {
  generateLargeData();
  resetScroll();
};

// 根据项目的heightMultiplier属性获取项目样式
const getDynamicItemStyle = (item: any, columnW: number, rowH: number) => {
  const baseStyle = getItemStyle(item, columnW, rowH);

  if (useDynamicSize.value && item.heightMultiplier) {
    const height = Math.max(rowH * item.heightMultiplier, minItemSize.value);
    const size =
      direction.value === "vertical"
        ? { height: `${height}px` }
        : { width: `${Math.max(columnW * item.heightMultiplier, minItemSize.value)}px` };

    return { ...baseStyle, ...size };
  }

  return baseStyle;
};

onMounted(() => {
  // 初始预生成一些数据以备用
  generateLargeData();
});

onBeforeUnmount(() => {
  stopFpsMonitoring();
});
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
        <label>
          <input type="checkbox" v-model="useDynamicSize" />
          不定高度模式
        </label>
        <span class="option-description">
          {{ useDynamicSize ? "已启用动态大小，项目尺寸将不固定" : "固定大小模式" }}
        </span>
      </div>

      <div class="config-group" v-if="useDynamicSize">
        <label>最小项目尺寸: {{ minItemSize }}px</label>
        <input type="range" v-model.number="minItemSize" min="40" max="120" step="5" />
        <span class="option-description"> 防止项目尺寸过小导致滚动位置回退 </span>
      </div>

      <div class="config-group" v-if="!useDynamicSize">
        <label
          >{{ direction === "vertical" ? "行高" : "列宽" }}:
          {{ direction === "vertical" ? rowHeight : columnWidth }}px</label
        >
        <input
          v-if="direction === 'vertical'"
          type="range"
          v-model.number="rowHeight"
          min="20"
          max="80"
          step="5"
        />
        <input v-else type="range" v-model.number="columnWidth" min="120" max="400" step="5" />
      </div>

      <div class="virtual-scroll-panel">
        <h3>虚拟滚动测试</h3>
        <div class="config-group">
          <label>
            <input type="checkbox" v-model="enableVirtualScroll" />
            启用虚拟滚动
          </label>
        </div>
        <div class="config-group" v-if="enableVirtualScroll">
          <label>数据量: {{ dataSize }}</label>
          <input
            type="range"
            v-model.number="dataSize"
            min="100"
            max="10000"
            step="100"
            @change="regenerateData"
          />
          <span class="data-count">{{ dataSize }} 项</span>
        </div>
      </div>

      <div class="actions">
        <button @click="startScroll">开始</button>
        <button @click="stopScroll">停止</button>
        <button @click="pauseScroll">暂停</button>
        <button @click="resumeScroll">恢复</button>
        <button @click="resetScroll">重置</button>
        <button @click="activateTestMode" class="test-btn">快速滚动测试</button>
      </div>

      <div class="actions" v-if="!enableVirtualScroll">
        <button @click="handleClearData">清空数据</button>
        <button @click="handleModifyData">修改数据</button>
        <button @click="handleReset">重置数据</button>
      </div>
    </div>

    <!-- 性能监控面板 -->
    <div class="performance-panel" v-if="enableVirtualScroll">
      <h3>性能监控</h3>
      <div class="fps-display">
        <div
          class="fps-value"
          :class="{
            'fps-high': currentFps > 50,
            'fps-medium': currentFps <= 50 && currentFps >= 30,
            'fps-low': currentFps < 30,
          }"
        >
          {{ currentFps }} FPS
        </div>
        <div class="fps-graph">
          <div
            v-for="(fps, index) in fpsValues"
            :key="index"
            class="fps-bar"
            :style="{
              height: `${Math.min(100, fps * 1.5)}%`,
              backgroundColor: fps > 50 ? '#4caf50' : fps >= 30 ? '#ff9800' : '#f44336',
            }"
            :title="`${fps} FPS`"
          ></div>
        </div>
      </div>
      <div class="performance-message">
        <template v-if="currentFps > 50">
          <span class="status-icon good">✓</span> 流畅（{{ currentFps }} FPS）
        </template>
        <template v-else-if="currentFps >= 30">
          <span class="status-icon warning">⚠</span> 尚可（{{ currentFps }} FPS）
        </template>
        <template v-else>
          <span class="status-icon bad">✗</span> 卡顿（{{ currentFps }} FPS）
        </template>
      </div>
    </div>

    <div class="demo-section">
      <h2>
        {{ enableVirtualScroll ? "虚拟滚动大数据演示" : "基础列表示例" }}
        {{ useDynamicSize ? "（不定高度模式）" : "（固定尺寸）" }}
      </h2>
      <p v-if="enableVirtualScroll" class="data-info">
        共 {{ displayData.length }} 项数据，使用虚拟滚动优化渲染性能
      </p>
      <div :class="['scroll-container', direction === 'horizontal' ? 'horizontal' : 'vertical']">
        <SeamlessScroll
          ref="scrollRef"
          :data="displayData"
          :direction="direction"
          :speed="speed"
          :pause-time="pauseTime"
          :hover-pause="pauseOnHover"
          :virtual-scroll="enableVirtualScroll"
          :virtual-scroll-buffer="3"
          :data-total="displayData.length"
          :item-size="computedItemSize"
          :min-item-size="computedMinItemSize"
          :item-key="(item) => item.id"
          @itemClick="handleItemClick"
        >
          <template #default="{ item, index }">
            <div class="list-item" :style="getDynamicItemStyle(item, columnWidth, rowHeight)">
              <div class="item-title">{{ item.title }} ({{ index + 1 }})</div>
              <div v-if="item.content" class="item-content">
                {{ item.content }}
              </div>
            </div>
          </template>
          <template #empty>
            <div class="empty-state">暂无数据，请添加数据或切换回正常模式</div>
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

h3 {
  margin: 15px 0 10px;
  color: #2c3e50;
}

.config-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.virtual-scroll-panel {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
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

.option-description {
  margin-left: 10px;
  font-size: 0.9em;
  color: #666;
}

.data-count {
  margin-left: 10px;
  font-weight: bold;
  color: #2196f3;
  width: 100px;
  text-align: right;
}

.data-info {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
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

.performance-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.fps-display {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.fps-value {
  width: 100px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.fps-high {
  color: #4caf50;
}

.fps-medium {
  color: #ff9800;
}

.fps-low {
  color: #f44336;
}

.fps-graph {
  flex: 1;
  height: 60px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  padding: 0 5px;
  overflow: hidden;
}

.fps-bar {
  flex: 1;
  margin: 0 1px;
  min-height: 3px;
  background-color: #4caf50;
  transition: height 0.2s ease-out;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}

.performance-message {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
  font-weight: bold;
}

.status-icon.good {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-icon.warning {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-icon.bad {
  background-color: #ffebee;
  color: #f44336;
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
  height: 300px; /* 增加高度以更好地显示不定高项目 */
  overflow: hidden;
}

.list-item {
  padding: 0 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-left: 4px solid #42b883;
  background: white;
  transition: background 0.2s;
}

.item-title {
  font-weight: bold;
}

.item-content {
  font-size: 0.9em;
  color: #666;
  margin-top: 4px;
}

.list-item:hover {
  background: #f5f5f5;
}

.empty-state {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #9e9e9e;
  font-style: italic;
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
