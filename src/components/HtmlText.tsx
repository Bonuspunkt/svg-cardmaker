import type { CSSProperties, ReactNode } from "react";

const XHTML_NS = { xmlns: "http://www.w3.org/1999/xhtml" } as Record<
  string,
  string
>;

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  lineHeight?: number;
  fontStyle?: string;
  fontWeight?: string | number;
  padding?: string;
  children: ReactNode;
}

export function HtmlText({
  x,
  y,
  width,
  height,
  fontSize,
  fontFamily,
  fill,
  lineHeight,
  fontStyle,
  fontWeight,
  padding = "0",
  children,
}: Props) {
  const style: CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily,
    color: fill,
    lineHeight: lineHeight ? `${lineHeight}px` : undefined,
    fontStyle,
    fontWeight,
    padding,
    margin: 0,
    overflowWrap: "break-word",
    wordWrap: "break-word",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  };

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <div {...XHTML_NS} style={style}>
        {children}
      </div>
    </foreignObject>
  );
}
