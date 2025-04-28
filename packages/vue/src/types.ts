import type { SeamlessScrollProps, SeamlessScrollStyles } from "@seamless-scroll/shared";
import type { ScrollOptions } from "@seamless-scroll/core";
import type { CSSProperties } from "vue";

// 扩展 SeamlessScrollProps 以支持 Vue 特定的样式类型
export type VueSeamlessScrollProps<T = any> = SeamlessScrollProps<T, CSSProperties>;

export type VueSeamlessScrollStyles = SeamlessScrollStyles<CSSProperties>;

export type HooksProps = ScrollOptions;
