import { SeamlessScrollProps, SeamlessScrollStyles } from "@seamless-scroll/shared";
import { ScrollOptions } from "@seamless-scroll/core";
import { CSSProperties, ReactElement, ReactNode } from "react";

export interface RenderProps<T = any> {
  item: T;
  index: number;
}

export type ChildrenRenderFunction<T = any> = (props: RenderProps<T>) => ReactNode;

// 扩展 SeamlessScrollProps 以支持 React 特定的样式类型
export type ReactSeamlessScrollProps<T = any> = SeamlessScrollProps<T, CSSProperties> & {
  children?: ChildrenRenderFunction<T> | ReactElement;
  emptyRender?: ReactNode;
  onItemClick?: (item: T, index: number) => void;
};

// 扩展 SeamlessScrollStyles 以支持 React 特定的样式类型
export type ReactSeamlessScrollStyles = SeamlessScrollStyles<CSSProperties>;

export type HooksProps = ScrollOptions;
