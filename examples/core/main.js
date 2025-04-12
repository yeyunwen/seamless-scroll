// 从core库导入
import { createSeamlessScroll } from "@seamless-scroll/core";

// 数据
const items = [
  { id: 1, title: "项目 1", color: "#f44336" },
  { id: 2, title: "项目 2", color: "#e91e63" },
  { id: 3, title: "项目 3", color: "#9c27b0" },
  { id: 4, title: "项目 4", color: "#673ab7" },
  { id: 5, title: "项目 5", color: "#3f51b5" },
  { id: 6, title: "项目 6", color: "#2196f3" },
  { id: 7, title: "项目 7", color: "#03a9f4" },
  { id: 8, title: "项目 8", color: "#00bcd4" },
  { id: 9, title: "项目 9", color: "#009688" },
  { id: 10, title: "项目 10", color: "#4caf50" },
];

// FPS计算和监控
class FPSMonitor {
  constructor() {
    this.fps = 0;
    this.frames = 0;
    this.lastTime = performance.now();
    this.fpsValues = new Array(100).fill(0);
    this.fpsIndex = 0;

    // 设置canvas
    this.canvas = document.getElementById("fpsMonitor");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();

    // 动画元素
    this.ball = document.getElementById("animationBall");
    this.ballX = 0;
    this.ballY = 0;
    this.ballSpeedX = 3;
    this.ballSpeedY = 2;
    this.ballWidth = 50;
    this.ballHeight = 50;
    this.animationBox = document.querySelector(".animation-box");

    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.drawFPSGraph();
  }

  update() {
    this.frames++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frames * 1000) / elapsed);
      this.lastTime = now;
      this.frames = 0;

      // 更新FPS值显示
      const fpsElement = document.getElementById("fpsValue");
      if (fpsElement) {
        fpsElement.textContent = `${this.fps} FPS`;

        // 根据FPS设置颜色
        if (this.fps >= 50) {
          fpsElement.style.color = "#4caf50"; // 绿色 - 良好
        } else if (this.fps >= 30) {
          fpsElement.style.color = "#ff9800"; // 橙色 - 一般
        } else {
          fpsElement.style.color = "#f44336"; // 红色 - 差
        }
      }

      // 添加到FPS历史值
      this.fpsValues[this.fpsIndex] = this.fps;
      this.fpsIndex = (this.fpsIndex + 1) % this.fpsValues.length;

      // 绘制FPS图表
      this.drawFPSGraph();
    }

    // 更新动画球的位置
    this.updateBallPosition();

    // 继续下一帧
    requestAnimationFrame(() => this.update());
  }

  updateBallPosition() {
    if (!this.ball || !this.animationBox) return;

    const boxWidth = this.animationBox.offsetWidth;
    const boxHeight = this.animationBox.offsetHeight;

    // 更新位置
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;

    // 边界检测
    if (this.ballX <= 0 || this.ballX + this.ballWidth >= boxWidth) {
      this.ballSpeedX = -this.ballSpeedX;
      this.ballX = Math.max(0, Math.min(this.ballX, boxWidth - this.ballWidth));
    }

    if (this.ballY <= 0 || this.ballY + this.ballHeight >= boxHeight) {
      this.ballSpeedY = -this.ballSpeedY;
      this.ballY = Math.max(0, Math.min(this.ballY, boxHeight - this.ballHeight));
    }

    // 应用位置
    this.ball.style.transform = `translate(${this.ballX}px, ${this.ballY}px)`;
  }

  drawFPSGraph() {
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // 清除画布
    this.ctx.clearRect(0, 0, width, height);

    // 绘制背景
    this.ctx.fillStyle = "#f5f5f5";
    this.ctx.fillRect(0, 0, width, height);

    // 绘制网格线
    this.ctx.strokeStyle = "#e0e0e0";
    this.ctx.lineWidth = 1;

    // 水平线 - 30fps和60fps基准线
    this.ctx.beginPath();
    const y30fps = height - (height * 30) / 80;
    const y60fps = height - (height * 60) / 80;

    this.ctx.moveTo(0, y30fps);
    this.ctx.lineTo(width, y30fps);
    this.ctx.moveTo(0, y60fps);
    this.ctx.lineTo(width, y60fps);
    this.ctx.stroke();

    // 标注
    this.ctx.fillStyle = "#9e9e9e";
    this.ctx.font = "10px Arial";
    this.ctx.fillText("30 FPS", 5, y30fps - 3);
    this.ctx.fillText("60 FPS", 5, y60fps - 3);

    // 绘制FPS数据
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#42b983";
    this.ctx.lineWidth = 2;

    const barWidth = width / this.fpsValues.length;

    for (let i = 0; i < this.fpsValues.length; i++) {
      const x = i * barWidth;
      const fpsValue =
        this.fpsValues[(this.fpsIndex - 1 - i + this.fpsValues.length) % this.fpsValues.length];
      const barHeight = (fpsValue / 80) * height; // 最大值设为80fps
      const y = height - barHeight;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  start() {
    requestAnimationFrame(() => this.update());
  }
}

// 生成大量测试数据
const generateTestData = (count) => {
  const result = [];
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
  ];

  for (let i = 1; i <= count; i++) {
    result.push({
      id: i,
      title: `项目 ${i}`,
      color: colors[i % colors.length],
    });
  }

  return result;
};

// 性能测试
const runPerformanceTest = () => {
  const testContainer = document.getElementById("performanceTestContainer");
  const testContent = document.getElementById("performanceTestContent");
  const testRealList = document.getElementById("performanceTestRealList");
  const testCloneList = document.getElementById("performanceTestCloneList");
  const resultsDiv = document.getElementById("testResults");

  // 测试控制元素
  const startTestBtn = document.getElementById("startTestBtn");
  const stopTestBtn = document.getElementById("stopTestBtn");
  const customDataCount = document.getElementById("customDataCount");
  const addDataCountBtn = document.getElementById("addDataCountBtn");
  const testDataCountsDiv = document.getElementById("testDataCounts");
  const clearDataCountsBtn = document.getElementById("clearDataCountsBtn");
  const testDurationSlider = document.getElementById("testDurationSlider");
  const testDurationValue = document.getElementById("testDurationValue");

  if (!testContainer) return;

  // 当前测试数据列表
  let dataCountsToTest = [100, 500, 1000];

  // 测试控制变量
  let currentTestIndex = 0;
  let isTestRunning = false;
  let currentScroll = null;
  let testTimeoutId = null;
  let fpsInterval = null;

  // 测试持续时间(秒)
  let testDuration = 5;

  // 更新测试列表显示
  const updateDataCountTags = () => {
    testDataCountsDiv.innerHTML = "";

    if (dataCountsToTest.length === 0) {
      testDataCountsDiv.innerHTML = '<em style="color:#666">未添加测试数据量</em>';
      return;
    }

    dataCountsToTest.forEach((count, index) => {
      const tag = document.createElement("div");
      tag.className = "data-count-tag";
      tag.innerHTML = `${count} 项 <span class="remove-tag" data-index="${index}">×</span>`;
      testDataCountsDiv.appendChild(tag);

      // 添加删除标签事件
      const removeBtn = tag.querySelector(".remove-tag");
      removeBtn.addEventListener("click", () => {
        dataCountsToTest.splice(index, 1);
        updateDataCountTags();
      });
    });
  };

  // 初始化测试持续时间滑块
  testDurationSlider.addEventListener("input", (e) => {
    testDuration = parseInt(e.target.value);
    testDurationValue.textContent = testDuration;
  });

  // 添加数据量按钮
  addDataCountBtn.addEventListener("click", () => {
    const count = parseInt(customDataCount.value);
    if (isNaN(count) || count < 10 || count > 10000) {
      alert("请输入10-10000之间的数据量");
      return;
    }

    // 如果已存在相同数据量，则不添加
    if (dataCountsToTest.includes(count)) {
      alert("该数据量已在测试列表中");
      return;
    }

    dataCountsToTest.push(count);
    // 按数字大小排序
    dataCountsToTest.sort((a, b) => a - b);
    updateDataCountTags();
  });

  // 清空测试列表按钮
  clearDataCountsBtn.addEventListener("click", () => {
    dataCountsToTest = [];
    updateDataCountTags();
  });

  // 停止当前测试
  const stopCurrentTest = () => {
    if (currentScroll) {
      currentScroll.destroy();
      currentScroll = null;
    }

    if (testTimeoutId) {
      clearTimeout(testTimeoutId);
      testTimeoutId = null;
    }

    if (fpsInterval) {
      clearInterval(fpsInterval);
      fpsInterval = null;
    }

    isTestRunning = false;
    startTestBtn.disabled = false;
    stopTestBtn.disabled = true;
  };

  // 停止测试按钮
  stopTestBtn.addEventListener("click", () => {
    stopCurrentTest();
    resultsDiv.innerHTML += "<p><strong>测试已手动停止</strong></p>";
  });

  // 开始测试按钮
  startTestBtn.addEventListener("click", () => {
    // 验证测试数据
    if (dataCountsToTest.length === 0) {
      alert("请先添加测试数据量");
      return;
    }

    // 重置测试状态
    isTestRunning = true;
    currentTestIndex = 0;

    // 更新UI
    startTestBtn.disabled = true;
    stopTestBtn.disabled = false;
    resultsDiv.innerHTML = "测试准备中...";

    // 清空之前的测试数据
    testRealList.innerHTML = "";
    if (testCloneList) testCloneList.innerHTML = "";

    // 创建结果表格
    let resultHTML = `
      <h3>性能测试结果</h3>
      <table border='1' style='width:100%; border-collapse:collapse;'>
        <thead>
          <tr>
            <th>数据量</th>
            <th>渲染时间 (ms)</th>
            <th>初始化时间 (ms)</th>
            <th>首次滚动时间 (ms)</th>
            <th>平均帧率</th>
            <th>最低帧率</th>
          </tr>
        </thead>
        <tbody id="resultsTableBody">
        </tbody>
      </table>
    `;

    resultsDiv.innerHTML = resultHTML;

    // 延迟开始第一个测试
    setTimeout(() => runSingleTest(0), 100);
  });

  // 创建列表项函数
  const createListItems = (container, dataItems) => {
    const fragment = document.createDocumentFragment();
    dataItems.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "scroll-item";

      const colorDiv = document.createElement("div");
      colorDiv.className = "item-color";
      colorDiv.style.backgroundColor = item.color;
      itemElement.appendChild(colorDiv);

      const textNode = document.createTextNode(item.title);
      itemElement.appendChild(textNode);

      fragment.appendChild(itemElement);
    });
    container.appendChild(fragment);
  };

  // 运行单次测试
  const runSingleTest = (index) => {
    // 检查是否需要停止测试
    if (!isTestRunning || index >= dataCountsToTest.length) {
      stopCurrentTest();
      resultsDiv.innerHTML += "<p><strong>测试已完成</strong></p>";
      return;
    }

    const count = dataCountsToTest[index];
    const testData = generateTestData(count);

    // 更新结果表格，添加当前测试行
    const resultsTableBody = document.getElementById("resultsTableBody");
    const newRow = document.createElement("tr");
    newRow.id = `test-row-${index}`;
    newRow.innerHTML = `
      <td>${count} 项</td>
      <td id="render-time-${index}">测试中...</td>
      <td id="init-time-${index}">测试中...</td>
      <td id="scroll-time-${index}">测试中...</td>
      <td id="avg-fps-${index}">测试中...</td>
      <td id="min-fps-${index}">测试中...</td>
    `;
    resultsTableBody.appendChild(newRow);

    // 清空之前的测试数据
    testRealList.innerHTML = "";
    if (testCloneList) testCloneList.innerHTML = "";

    // 捕获测试开始时的帧率
    const fpsElement = document.getElementById("fpsValue");
    let fpsReadings = [];
    fpsInterval = setInterval(() => {
      const currentFps = fpsElement ? parseInt(fpsElement.textContent) : 0;
      if (!isNaN(currentFps) && currentFps > 0) {
        fpsReadings.push(currentFps);

        // 更新平均帧率和最低帧率
        if (fpsReadings.length > 0) {
          const avgFps = Math.round(
            fpsReadings.reduce((sum, fps) => sum + fps, 0) / fpsReadings.length,
          );
          const minFps = Math.min(...fpsReadings);

          document.getElementById(`avg-fps-${index}`).textContent = `${avgFps} FPS`;
          document.getElementById(`min-fps-${index}`).textContent = `${minFps} FPS`;
        }
      }
    }, 500);

    // 测量渲染时间
    const renderStart = performance.now();
    createListItems(testRealList, testData);
    const renderEnd = performance.now();
    document.getElementById(`render-time-${index}`).textContent =
      `${(renderEnd - renderStart).toFixed(2)}`;

    // 测量初始化时间
    const initStart = performance.now();
    currentScroll = createSeamlessScroll(
      testContainer,
      testContent,
      testRealList,
      {
        direction: "vertical",
        speed: 50,
        pauseTime: 1000,
        hoverPause: true,
        autoScroll: false,
      },
      {
        onScroll: (distance) => {
          console.log("垂直滚动中:", distance);
        },
      },
      (state) => {
        console.log("state", state);
      },
    );
    const initEnd = performance.now();
    document.getElementById(`init-time-${index}`).textContent =
      `${(initEnd - initStart).toFixed(2)}`;

    // 测量首次滚动启动时间
    const scrollStart = performance.now();
    currentScroll.methods.start();

    // 使用requestAnimationFrame来捕获首帧渲染
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const scrollEnd = performance.now();
        document.getElementById(`scroll-time-${index}`).textContent =
          `${(scrollEnd - scrollStart).toFixed(2)}`;

        // 运行指定时间，然后进行下一个测试
        testTimeoutId = setTimeout(() => {
          if (currentScroll) {
            currentScroll.destroy();
            currentScroll = null;
          }

          if (fpsInterval) {
            clearInterval(fpsInterval);
            fpsInterval = null;
          }

          // 转到下一个测试
          currentTestIndex++;
          runSingleTest(currentTestIndex);
        }, testDuration * 1000); // 测试持续时间，转换为毫秒
      });
    });
  };

  // 初始化显示
  updateDataCountTags();
};

// DOM 准备好后初始化
document.addEventListener("DOMContentLoaded", () => {
  // 垂直滚动示例
  const verticalContainer = document.getElementById("verticalContainer");
  const verticalContent = document.getElementById("verticalContent");
  const verticalRealList = document.getElementById("verticalRealList");

  // 水平滚动示例
  const horizontalContainer = document.getElementById("horizontalContainer");
  const horizontalContent = document.getElementById("horizontalContent");
  const horizontalRealList = document.getElementById("horizontalRealList");

  // 配置控件
  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");
  const pauseTimeSlider = document.getElementById("pauseTimeSlider");
  const pauseTimeValue = document.getElementById("pauseTimeValue");
  const hoverPauseCheckbox = document.getElementById("hoverPauseCheckbox");

  // 控制按钮
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resumeBtn = document.getElementById("resumeBtn");
  const resetBtn = document.getElementById("resetBtn");

  const startBtnH = document.getElementById("startBtnH");
  const stopBtnH = document.getElementById("stopBtnH");
  const pauseBtnH = document.getElementById("pauseBtnH");
  const resumeBtnH = document.getElementById("resumeBtnH");
  const resetBtnH = document.getElementById("resetBtnH");

  // 创建列表项
  function createListItems(container, isHorizontal = false) {
    items.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = isHorizontal ? "scroll-item-horizontal" : "scroll-item";

      if (!isHorizontal) {
        const colorDiv = document.createElement("div");
        colorDiv.className = "item-color";
        colorDiv.style.backgroundColor = item.color;
        itemElement.appendChild(colorDiv);
      }

      const textNode = document.createTextNode(item.title);
      itemElement.appendChild(textNode);

      itemElement.addEventListener("click", () => {
        alert(`点击了: ${item.title}`);
      });

      container.appendChild(itemElement);
    });
  }

  // 创建垂直滚动列表
  createListItems(verticalRealList);

  // 创建水平滚动列表
  createListItems(horizontalRealList, true);

  // 滚动配置
  let options = {
    direction: "vertical",
    speed: 50,
    pauseTime: 2000,
    hoverPause: true,
    autoScroll: true,
    duration: 500,
  };

  // 创建垂直滚动实例
  const verticalScroll = createSeamlessScroll(
    verticalContainer,
    verticalContent,
    verticalRealList,
    { ...options },
    {
      // onScroll: (distance, direction) => {
      //   console.log("垂直滚动中:", distance, direction);
      // },
    },
    (state) => {
      console.log("state", state);
    },
  );
  // 根据 minClones 创建克隆列表

  if (verticalScroll.state.minClones > 0) {
    // 清空现有的克隆列表
    const existingClones = verticalContent.querySelectorAll(
      ".seamless-scroll-list:not(#verticalRealList)",
    );
    existingClones.forEach((clone) => clone.remove());

    // 创建新的克隆列表
    for (let i = 0; i < verticalScroll.state.minClones; i++) {
      const cloneList = verticalRealList.cloneNode(true);
      cloneList.id = `verticalCloneList-${i}`;
      verticalContent.appendChild(cloneList);
    }
  }

  // 创建水平滚动实例
  const horizontalScroll = createSeamlessScroll(
    horizontalContainer,
    horizontalContent,
    horizontalRealList,
    { ...options, direction: "horizontal" },
    {
      // onScroll: (distance, direction) => {
      //   console.log("水平滚动中:", distance, direction);
      // },
    },
    (state) => {
      console.log("horizontalScroll", state);
      // 根据 minClones 创建克隆列表
    },
  );

  if (horizontalScroll.state.minClones > 0) {
    // 清空现有的克隆列表
    const existingClones = horizontalContent.querySelectorAll(
      ".seamless-scroll-list:not(#horizontalRealList)",
    );
    existingClones.forEach((clone) => clone.remove());

    // 创建新的克隆列表
    for (let i = 0; i < horizontalScroll.state.minClones; i++) {
      const cloneList = horizontalRealList.cloneNode(true);
      cloneList.id = `horizontalCloneList-${i}`;
      horizontalContent.appendChild(cloneList);
    }
  }

  // 更新配置UI
  speedSlider.addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    speedValue.textContent = value;
    console.log("speedValue", value);
    verticalScroll.methods.updateOptions({ speed: value });
    horizontalScroll.methods.updateOptions({ speed: value });
  });

  pauseTimeSlider.addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    pauseTimeValue.textContent = value;

    verticalScroll.methods.updateOptions({ pauseTime: value });
    horizontalScroll.methods.updateOptions({ pauseTime: value });
  });

  hoverPauseCheckbox.addEventListener("change", (e) => {
    const checked = e.target.checked;

    verticalScroll.methods.updateOptions({ hoverPause: checked });
    horizontalScroll.methods.updateOptions({ hoverPause: checked });
  });

  // 按钮事件 - 垂直滚动
  startBtn.addEventListener("click", () => verticalScroll.methods.start());
  stopBtn.addEventListener("click", () => verticalScroll.methods.stop());
  pauseBtn.addEventListener("click", () => verticalScroll.methods.pause());
  resumeBtn.addEventListener("click", () => verticalScroll.methods.resume());
  resetBtn.addEventListener("click", () => verticalScroll.methods.reset());

  // 按钮事件 - 水平滚动
  startBtnH.addEventListener("click", () => horizontalScroll.methods.start());
  stopBtnH.addEventListener("click", () => horizontalScroll.methods.stop());
  pauseBtnH.addEventListener("click", () => horizontalScroll.methods.pause());
  resumeBtnH.addEventListener("click", () => horizontalScroll.methods.resume());
  resetBtnH.addEventListener("click", () => horizontalScroll.methods.reset());

  // 初始化
  verticalScroll.methods.start();
  horizontalScroll.methods.start();

  // 初始化FPS监控
  const fpsMonitor = new FPSMonitor();
  fpsMonitor.start();

  // 初始化性能测试
  runPerformanceTest();
});
