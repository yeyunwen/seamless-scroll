import { SeamlessScrollProps, SeamlessScrollStyles } from "@seamless-scroll/shared";
import { ScrollOptions } from "@seamless-scroll/core";
import { CSSProperties, ReactElement, ReactNode } from "react";

export interface RenderProps {
  item: any;
  index: number;
}

export type ChildrenRenderFunction = (props: RenderProps) => ReactNode;

// 扩展 SeamlessScrollProps 以支持 React 特定的样式类型
export type ReactSeamlessScrollProps<T = any> = SeamlessScrollProps<T, CSSProperties> & {
  children?: ChildrenRenderFunction | ReactElement;
  emptyRender?: ReactNode;
  onItemClick?: (item: T, index: number) => void;
  itemKey?: string | ((item: T, index: number) => string | number);
};

// 扩展 SeamlessScrollStyles 以支持 React 特定的样式类型
export type ReactSeamlessScrollStyles = SeamlessScrollStyles<CSSProperties>;

export type HooksProps = ScrollOptions;
