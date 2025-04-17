import { useRef, useState } from "react";
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

  // 滚动组件引用
  const scrollRef = useRef<SeamlessScrollRef>(null);

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

  return (
    <div className="examples-app">
      <h1>无缝滚动组件 - React 示例</h1>

      <div className="config-panel">
        <h2>配置</h2>
        <label>滚动方向:</label>
        <select value={direction} onChange={(e) => setDirection(e.target.value as ScrollDirection)}>
          <option value="vertical">垂直方向</option>
          <option value="horizontal">水平方向</option>
        </select>

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
          <label>行高: {rowHeight}px</label>
          <input
            type="range"
            value={rowHeight}
            onChange={(e) => setRowHeight(parseInt(e.target.value))}
            min="20"
            max="80"
            step="5"
          />
        </div>

        <div className="config-group">
          <label>列宽: {columnWidth}px</label>
          <input
            type="range"
            value={columnWidth}
            onChange={(e) => setColumnWidth(parseInt(e.target.value))}
            min="120"
            max="500"
            step="5"
          />
        </div>

        <div className="actions">
          <button onClick={() => scrollRef.current?.start()}>开始</button>
          <button onClick={() => scrollRef.current?.stop()}>停止</button>
          <button onClick={() => scrollRef.current?.pause()}>暂停</button>
          <button onClick={() => scrollRef.current?.resume()}>恢复</button>
          <button onClick={() => scrollRef.current?.reset()}>重置</button>
        </div>

        <div className="actions">
          <button onClick={handleClearData}>清空数据</button>
          <button onClick={handleModifyData}>修改数据</button>
          <button onClick={handleReset}>重置数据</button>
        </div>
      </div>

      <div className="demo-section">
        <h2>基础列表示例</h2>
        <div className={`scroll-container ${direction === "vertical" ? "vertical" : "horizontal"}`}>
          <SeamlessScroll
            ref={scrollRef}
            data={listData}
            speed={speed}
            direction={direction}
            hoverPause={pauseOnHover}
            forceScrolling
            pauseTime={pauseTime}
            emptyRender={"暂无数据"}
          >
            {({ item, index }) => (
              <div className="list-item" style={getItemStyle(item, columnWidth, rowHeight)}>
                {item.title} ({index + 1})
              </div>
            )}
          </SeamlessScroll>
        </div>
      </div>
    </div>
  );
};

export default App;
