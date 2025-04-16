export interface ListItem {
  id: number;
  title: string;
  color: string;
}

export const listData: ListItem[] = [
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

// 获取项目样式
export const getItemStyle = (item: ListItem, columnWidth: number, rowHeight: number) => ({
  borderLeft: `4px solid ${item.color}`,
  width: `${columnWidth}px`,
  height: `${rowHeight}px`,
});
