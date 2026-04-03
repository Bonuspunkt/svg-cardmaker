import { wrapSvgText } from "../utils/text-wrap.js";

interface Props {
  text: string | string[];
  x: number;
  y: number;
  widthChars?: number;
  lineHeight?: number;
  fontFamily: string;
  fontSize: number;
  fill: string;
  fontWeight?: string | number;
  fontStyle?: string;
}

export function SvgText({
  text,
  x,
  y,
  widthChars = 62,
  lineHeight = 20,
  fontFamily,
  fontSize,
  fill,
  fontWeight,
  fontStyle,
}: Props) {
  const entries = wrapSvgText(text, widthChars, lineHeight, x);

  return (
    <text
      x={x}
      y={y}
      fontFamily={fontFamily}
      fontSize={fontSize}
      fill={fill}
      fontWeight={fontWeight}
      fontStyle={fontStyle}
    >
      {entries.map((entry, i) => (
        <tspan key={i} x={entry.x} dy={entry.dy}>
          {entry.text}
        </tspan>
      ))}
    </text>
  );
}
