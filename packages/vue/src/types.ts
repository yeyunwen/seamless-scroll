import type { SeamlessScrollProps, SeamlessScrollStyles } from "@seamless-scroll/shared";
import type { CSSProperties } from "vue";

// 扩展 SeamlessScrollProps 以支持 Vue 特定的样式类型
export type VueSeamlessScrollProps = SeamlessScrollProps<CSSProperties> & {
  /**
   * 虚拟滚动缓冲区大小（前后多渲染几个项目）
   */
  virtualScrollBuffer?: number;
  /**
   * 估计的每个项目高度/宽度（像素）- 用于初始计算
   */
  itemSize?: number;
  /**
   * 项目唯一标识字段或函数
   * 字符串表示从项目中取该字段作为key
   * 函数允许自定义key的生成逻辑
   */
  itemKey?: string | ((item: any, index: number) => string | number);
};

export type VueSeamlessScrollStyles = SeamlessScrollStyles<CSSProperties>;

export type HooksProps = Omit<
  VueSeamlessScrollProps,
  "data" | "customClass" | "style" | "containerWidth" | "containerHeight" | "itemClick"
>;
