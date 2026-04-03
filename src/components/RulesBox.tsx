import type { Theme } from "../types/theme.js";
import { SvgText } from "./SvgText.js";

interface Props {
  theme: Theme;
  rules: string | string[];
  flavor?: string;
}

export function RulesBox({ theme, rules, flavor }: Props) {
  const [rx, ry, rw, rh] = theme.rules_rec;
  const [tx, ty, tfs] = theme.rules_txt_rec;
  const [fx, fy, ffs] = theme.flavor_txt_rec;

  const flavorText = flavor
    ? `\u201C${flavor}\u201D`
    : "";

  return (
    <>
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        rx={10}
        ry={10}
        fill={theme.rules_bg}
        stroke={theme.frame_border}
        strokeWidth={2}
      />
      <SvgText
        text={rules}
        x={tx}
        y={ty}
        widthChars={60}
        lineHeight={tfs}
        fontFamily={theme.font_serif}
        fontSize={tfs}
        fill={theme.rules_fg}
      />
      {flavorText && (
        <SvgText
          text={flavorText}
          x={fx}
          y={fy}
          widthChars={60}
          lineHeight={ffs}
          fontFamily={theme.font_serif}
          fontSize={ffs}
          fill={theme.flavor_fg}
          fontStyle="italic"
        />
      )}
    </>
  );
}
