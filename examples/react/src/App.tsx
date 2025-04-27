import { useCallback, useEffect, useRef, useState } from "react";
import {
  SeamlessScroll,
  type SeamlessScrollRef,
  type ScrollDirection,
} from "@seamless-scroll/react";
import "../../shared/style.css";
import { listData as initialListData, ListItem, getItemStyle } from "../../shared/index";

const App = () => {
  const [listData, setListData] = useState<ListItem[]>(initialListData);
  const [direction, setDirection] = useState<ScrollDirection>("vertical");
  const [speed, setSpeed] = useState(50);
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const [rowHeight, setRowHeight] = useState(40);
  const [columnWidth, setColumnWidth] = useState(200);
  const [pauseTime, setPauseTime] = useState(2000);

  // 不定高度选项
  const [useDynamicSize, setUseDynamicSize] = useState(false);
  const [minItemSize, setMinItemSize] = useState(40);

  // 虚拟滚动配置
  const [enableVirtualScroll, setEnableVirtualScroll] = useState(false);
  const [dataSize, setDataSize] = useState(100);
  const [largeDataItems, setLargeDataItems] = useState<ListItem[]>([]);

  // 性能监控
  const [fpsValues, setFpsValues] = useState<number[]>([]);
  const [currentFps, setCurrentFps] = useState(0);
  const lastFrameTime = useRef(performance.now());
  const frameCount = useRef(0);
  const fpsIntervalId = useRef<number | null>(null);
  const fpsUpdateInterval = 500; // 每500ms更新一次FPS

  // 点击项目
  const [clickedItem, setClickedItem] = useState<ListItem | null>(null);

  // 滚动组件引用
  const scrollRef = useRef<SeamlessScrollRef>(null);

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

  // 生成大量数据
  const generateLargeData = useCallback(() => {
    const count = dataSize;
    const newData: ListItem[] = [];

    for (let i = 0; i < count; i++) {
      // 在动态大小模式下，为每个项目设置随机高度倍数
      const heightMultiplier = useDynamicSize ? Math.floor(Math.random() * 3) + 1 : 1;

      newData.push({
        id: i,
        title: `大数据项 ${i}`,
        color: getRandomColor(),
        heightMultiplier, // 高度乘数，用于控制项目高度
        content:
          useDynamicSize && heightMultiplier > 1
            ? `这是一个高度为基础高度 ${heightMultiplier} 倍的项目，展示动态大小效果。`
            : undefined,
      });
    }

    setLargeDataItems(newData);
  }, [dataSize, useDynamicSize]);

  // 当前显示的数据
  const displayData = enableVirtualScroll ? largeDataItems : listData;

  // 计算要传递给组件的itemSize
  const computedItemSize = useDynamicSize
    ? undefined
    : direction === "vertical"
      ? rowHeight
      : columnWidth;

  // 计算要传递的最小项目尺寸
  const computedMinItemSize = !useDynamicSize ? undefined : minItemSize;

  // 启动FPS监控
  const startFpsMonitoring = useCallback(() => {
    if (fpsIntervalId.current) return;

    setFpsValues([]);
    frameCount.current = 0;
    lastFrameTime.current = performance.now();

    // 记录帧率
    const recordFrame = () => {
      frameCount.current++;
      requestAnimationFrame(recordFrame);
    };
    requestAnimationFrame(recordFrame);

    // 定期计算FPS
    fpsIntervalId.current = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastFrameTime.current;

      if (elapsed > 0) {
        const fps = Math.round((frameCount.current * 1000) / elapsed);
        setCurrentFps(fps);
        setFpsValues((prevValues) => {
          const newValues = [...prevValues, fps];
          // 只保留最近30个值
          if (newValues.length > 30) {
            return newValues.slice(1);
          }
          return newValues;
        });

        frameCount.current = 0;
        lastFrameTime.current = now;
      }
    }, fpsUpdateInterval);
  }, []);

  // 停止FPS监控
  const stopFpsMonitoring = useCallback(() => {
    if (fpsIntervalId.current) {
      clearInterval(fpsIntervalId.current);
      fpsIntervalId.current = null;
    }
  }, []);

  // 处理点击项目
  const handleItemClick = (item: ListItem, index: number) => {
    console.log("点击了项目:", item, "索引:", index);
    setClickedItem(item);

    // 3秒后清除
    setTimeout(() => {
      setClickedItem((prev) => (prev === item ? null : prev));
    }, 3000);
  };

  const handleClearData = () => {
    setListData([]);
  };

  const handleModifyData = () => {
    setListData([
      { id: 7, title: "项目 7", color: "#03a9f4" },
      { id: 8, title: "项目 8", color: "#00bcd4" },
      { id: 9, title: "项目 9", color: "#009688" },
      { id: 10, title: "项目 10", color: "#4caf50" },
    ]);
  };

  const handleReset = () => {
    setListData(initialListData);
  };

  // 激活快速滚动模式
  const activateTestMode = () => {
    setSpeed(100); // 更快的滚动速度
    setPauseTime(500); // 更短的暂停时间
    scrollRef.current?.reset(); // 重置并使用新设置
  };

  // 切换虚拟滚动
  const toggleVirtualScroll = useCallback(
    (enabled: boolean) => {
      if (enabled && largeDataItems.length === 0) {
        generateLargeData();
      }
      // 如果开启了虚拟滚动，自动启动FPS监控
      if (enabled) {
        startFpsMonitoring();
      } else {
        stopFpsMonitoring();
      }
    },
    [generateLargeData, largeDataItems.length, startFpsMonitoring, stopFpsMonitoring],
  );

  // 重新生成数据
  const regenerateData = () => {
    generateLargeData();
    scrollRef.current?.reset();
  };

  // 根据项目的heightMultiplier属性获取项目样式
  const getDynamicItemStyle = (item: ListItem) => {
    const baseStyle = getItemStyle(item, columnWidth, rowHeight);

    if (useDynamicSize && item.heightMultiplier) {
      const height = Math.max(rowHeight * item.heightMultiplier, minItemSize);
      const size =
        direction === "vertical"
          ? { height: `${height}px` }
          : { width: `${Math.max(columnWidth * item.heightMultiplier, minItemSize)}px` };

      return { ...baseStyle, ...size };
    }

    return baseStyle;
  };

  // 监听enableVirtualScroll变化
  useEffect(() => {
    toggleVirtualScroll(enableVirtualScroll);
  }, [enableVirtualScroll, toggleVirtualScroll]);

  // 监听useDynamicSize变化
  useEffect(() => {
    generateLargeData();
    scrollRef.current?.reset();
  }, [useDynamicSize, generateLargeData]);

  // 组件挂载时
  useEffect(() => {
    // 初始预生成一些数据以备用
    generateLargeData();

    // 组件卸载时
    return () => {
      stopFpsMonitoring();
    };
  }, [generateLargeData, stopFpsMonitoring]);

  return (
    <div className="examples-app">
      <h1>无缝滚动组件 - React 示例</h1>

      <div className="config-panel">
        <h2>配置</h2>
        <div className="config-group">
          <label>滚动方向:</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as ScrollDirection)}
          >
            <option value="vertical">垂直方向</option>
            <option value="horizontal">水平方向</option>
          </select>
        </div>

        <div className="config-group">
          <label>滚动速度: {speed}</label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
          />
        </div>

        <div className="config-group">
          <label>暂停时间: {pauseTime}ms</label>
          <input
            type="range"
            min="0"
            max="3000"
            step="100"
            value={pauseTime}
            onChange={(e) => setPauseTime(parseInt(e.target.value))}
          />
        </div>

        <div className="config-group">
          <label>
            <input
              type="checkbox"
              checked={pauseOnHover}
              onChange={() => setPauseOnHover(!pauseOnHover)}
            />
            悬停时暂停
          </label>
        </div>

        <div className="config-group">
          <label>
            <input
              type="checkbox"
              checked={useDynamicSize}
              onChange={() => setUseDynamicSize(!useDynamicSize)}
            />
            不定高度模式
          </label>
          <span className="option-description">
            {useDynamicSize ? "已启用动态大小，项目尺寸将不固定" : "固定大小模式"}
          </span>
        </div>

        {useDynamicSize && (
          <div className="config-group">
            <label>最小项目尺寸: {minItemSize}px</label>
            <input
              type="range"
              value={minItemSize}
              onChange={(e) => setMinItemSize(parseInt(e.target.value))}
              min="40"
              max="120"
              step="5"
            />
            <span className="option-description">防止项目尺寸过小导致滚动位置回退</span>
          </div>
        )}

        {!useDynamicSize && (
          <div className="config-group">
            <label>
              {direction === "vertical" ? "行高" : "列宽"}:
              {direction === "vertical" ? rowHeight : columnWidth}px
            </label>
            {direction === "vertical" ? (
              <input
                type="range"
                value={rowHeight}
                onChange={(e) => setRowHeight(parseInt(e.target.value))}
                min="20"
                max="80"
                step="5"
              />
            ) : (
              <input
                type="range"
                value={columnWidth}
                onChange={(e) => setColumnWidth(parseInt(e.target.value))}
                min="120"
                max="500"
                step="5"
              />
            )}
          </div>
        )}

        <div className="virtual-scroll-panel">
          <h3>虚拟滚动测试</h3>
          <div className="config-group">
            <label>
              <input
                type="checkbox"
                checked={enableVirtualScroll}
                onChange={() => setEnableVirtualScroll(!enableVirtualScroll)}
              />
              启用虚拟滚动
            </label>
          </div>
          {enableVirtualScroll && (
            <div className="config-group">
              <label>数据量: {dataSize}</label>
              <input
                type="range"
                value={dataSize}
                onChange={(e) => setDataSize(parseInt(e.target.value))}
                min="100"
                max="10000"
                step="100"
                onMouseUp={regenerateData}
                onTouchEnd={regenerateData}
              />
              <span className="data-count">{dataSize} 项</span>
            </div>
          )}
        </div>

        <div className="actions">
          <button onClick={() => scrollRef.current?.start()}>开始</button>
          <button onClick={() => scrollRef.current?.stop()}>停止</button>
          <button onClick={() => scrollRef.current?.pause()}>暂停</button>
          <button onClick={() => scrollRef.current?.resume()}>恢复</button>
          <button onClick={() => scrollRef.current?.reset()}>重置</button>
          <button onClick={activateTestMode} className="test-btn">
            快速滚动测试
          </button>
        </div>

        {!enableVirtualScroll && (
          <div className="actions">
            <button onClick={handleClearData}>清空数据</button>
            <button onClick={handleModifyData}>修改数据</button>
            <button onClick={handleReset}>重置数据</button>
          </div>
        )}
      </div>

      {/* 性能监控面板 */}
      {enableVirtualScroll && (
        <div className="performance-panel">
          <h3>性能监控</h3>
          <div className="fps-display">
            <div
              className={`fps-value ${
                currentFps > 50 ? "fps-high" : currentFps >= 30 ? "fps-medium" : "fps-low"
              }`}
            >
              {currentFps} FPS
            </div>
            <div className="fps-graph">
              {fpsValues.map((fps, index) => (
                <div
                  key={index}
                  className="fps-bar"
                  style={{
                    height: `${Math.min(100, fps * 1.5)}%`,
                    backgroundColor: fps > 50 ? "#4caf50" : fps >= 30 ? "#ff9800" : "#f44336",
                  }}
                  title={`${fps} FPS`}
                ></div>
              ))}
            </div>
          </div>
          <div className="performance-message">
            {currentFps > 50 ? (
              <>
                <span className="status-icon good">✓</span> 流畅（{currentFps} FPS）
              </>
            ) : currentFps >= 30 ? (
              <>
                <span className="status-icon warning">⚠</span> 尚可（{currentFps} FPS）
              </>
            ) : (
              <>
                <span className="status-icon bad">✗</span> 卡顿（{currentFps} FPS）
              </>
            )}
          </div>
        </div>
      )}

      <div className="demo-section">
        <h2>
          {enableVirtualScroll ? "虚拟滚动大数据演示" : "基础列表示例"}
          {useDynamicSize ? "（不定高度模式）" : "（固定尺寸）"}
        </h2>
        {enableVirtualScroll && (
          <p className="data-info">共 {displayData.length} 项数据，使用虚拟滚动优化渲染性能</p>
        )}
        <div className={`scroll-container ${direction === "vertical" ? "vertical" : "horizontal"}`}>
          <SeamlessScroll
            ref={scrollRef}
            data={displayData}
            speed={speed}
            direction={direction}
            hoverPause={pauseOnHover}
            forceScrolling
            pauseTime={pauseTime}
            emptyRender={"暂无数据，请添加数据或切换回正常模式"}
            itemSize={computedItemSize}
            minItemSize={computedMinItemSize}
            onItemClick={handleItemClick}
            itemKey={(item: ListItem) => item.id}
          >
            {({ item, index }: { item: ListItem; index: number }) => (
              <div className="list-item" style={getDynamicItemStyle(item)}>
                <div className="item-title">
                  {item.title} ({index + 1})
                </div>
                {item.content && <div className="item-content">{item.content}</div>}
              </div>
            )}
          </SeamlessScroll>
        </div>

        {clickedItem && <div className="clicked-info">点击了: {clickedItem.title}</div>}
      </div>
    </div>
  );
};

export default App;
