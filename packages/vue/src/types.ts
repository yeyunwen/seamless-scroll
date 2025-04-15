import type { SeamlessScrollProps, SeamlessScrollStyles } from "@seamless-scroll/shared";
import type { CSSProperties } from "vue";

// 扩展 SeamlessScrollProps 以支持 Vue 特定的样式类型
export type VueSeamlessScrollProps = SeamlessScrollProps<CSSProperties>;

export type VueSeamlessScrollStyles = SeamlessScrollStyles<CSSProperties>;

export type HooksProps = Omit<
  VueSeamlessScrollProps,
  "data" | "customClass" | "style" | "containerWidth" | "containerHeight" | "itemClick"
>;
