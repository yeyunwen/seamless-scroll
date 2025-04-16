import { SeamlessScrollProps, SeamlessScrollStyles } from "@seamless-scroll/shared";
import { CSSProperties, ReactElement, ReactNode } from "react";

export interface RenderProps {
  item: any;
  index: number;
}

export type ChildrenRenderFunction = (props: RenderProps) => ReactNode;

// 扩展 SeamlessScrollProps 以支持 React 特定的样式类型
export type ReactSeamlessScrollProps = SeamlessScrollProps<CSSProperties> & {
  children?: ChildrenRenderFunction | ReactElement;
  emptyRender?: ReactNode;
};

// 扩展 SeamlessScrollStyles 以支持 React 特定的样式类型
export type ReactSeamlessScrollStyles = SeamlessScrollStyles<CSSProperties>;

export type HooksProps = Omit<
  ReactSeamlessScrollProps,
  "data" | "customClass" | "style" | "containerWidth" | "containerHeight" | "itemClick"
>;
