import type { SeamlessScrollProps, SeamlessScrollStyles } from "@seamless-scroll/shared";
import type { ScrollOptions } from "@seamless-scroll/core";
import type { CSSProperties } from "vue";

// 扩展 SeamlessScrollProps 以支持 Vue 特定的样式类型
export type VueSeamlessScrollProps<T = any> = SeamlessScrollProps<T, CSSProperties> & {
  /**
   * 虚拟滚动缓冲区大小（前后多渲染几个项目）
   */
  virtualScrollBuffer?: number;
  /**
   * 估计的每个项目高度/宽度（像素）- 用于初始计算
   * 注意：itemSize和minItemSize至少需要提供一个，如果都不设置将使用默认minItemSize=50
   */
  itemSize?: number;
  /**
   * 最小项目高度/宽度（像素）- 防止项目尺寸过小
   * 注意：itemSize和minItemSize至少需要提供一个，如果都不设置将使用默认minItemSize=50
   */
  minItemSize?: number;
  /**
   * 项目唯一标识字段或函数
   * 字符串表示从项目中取该字段作为key
   * 函数允许自定义key的生成逻辑
   */
  itemKey?: string | ((item: T, index: number) => string | number);
  /**
   * 数据源 - 使用泛型T提供类型安全
   */
  data: T[];
};

export type VueSeamlessScrollStyles = SeamlessScrollStyles<CSSProperties>;

export type HooksProps = ScrollOptions;
