import { useState } from "react";
import { SeamlessScroll } from "@seamless-scroll/react";

function App() {
  const [items] = useState([
    { id: 1, text: "公告1" },
    { id: 2, text: "公告2" },
    { id: 3, text: "公告3" },
  ]);

  const handleItemClick = (item: any) => {
    console.log("点击了项目:", item);
  };

  return (
    <div className="app">
      <SeamlessScroll
        data={items}
        containerHeight={200}
        duration={1000}
        forceScrolling
        onItemClick={handleItemClick}
      >
        {({ item, index }) => <div>{`${index} ${item.text}`}</div>}
      </SeamlessScroll>
    </div>
  );
}

export default App;
