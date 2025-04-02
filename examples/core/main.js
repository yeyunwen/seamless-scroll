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

// DOM 准备好后初始化
document.addEventListener("DOMContentLoaded", () => {
  // 垂直滚动示例
  const verticalContainer = document.getElementById("verticalContainer");
  const verticalContent = document.getElementById("verticalContent");
  const verticalRealList = document.getElementById("verticalRealList");
  const verticalCloneList = document.getElementById("verticalCloneList");

  // 水平滚动示例
  const horizontalContainer = document.getElementById("horizontalContainer");
  const horizontalContent = document.getElementById("horizontalContent");
  const horizontalRealList = document.getElementById("horizontalRealList");
  const horizontalCloneList = document.getElementById("horizontalCloneList");

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
    rowHeight: 60,
    columnWidth: 150,
  };

  // 创建垂直滚动实例
  const verticalScroll = createSeamlessScroll(
    verticalContainer,
    verticalContent,
    verticalRealList,
    verticalCloneList,
    { ...options },
    {
      // onScroll: (distance, direction) => {
      //   console.log("垂直滚动中:", distance, direction);
      // },
    },
  );

  // 创建水平滚动实例
  const horizontalScroll = createSeamlessScroll(
    horizontalContainer,
    horizontalContent,
    horizontalRealList,
    horizontalCloneList,
    { ...options, direction: "horizontal" },
    {
      // onScroll: (distance, direction) => {
      //   console.log("水平滚动中:", distance, direction);
      // },
    },
  );

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
});
