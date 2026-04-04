import type { CSSProperties } from "react";
import type { Theme } from "../types/theme.js";

const XHTML_NS = { xmlns: "http://www.w3.org/1999/xhtml" } as Record<
  string,
  string
>;

interface Props {
  theme: Theme;
  rules: string | string[];
  flavor?: string;
}

export function RulesBox({ theme, rules, flavor }: Props) {
  const [rx, ry, rw, rh] = theme.rules_rec;
  const [, , tfs] = theme.rules_txt_rec;
  const [, , ffs] = theme.flavor_txt_rec;

  const rulesText = Array.isArray(rules) ? rules.join("\n") : rules;
  const flavorText = flavor ? `\u201C${flavor}\u201D` : "";

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: "6px 18px",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  const rulesStyle: CSSProperties = {
    fontSize: `${tfs}px`,
    fontFamily: theme.font_serif,
    color: theme.rules_fg,
    lineHeight: `${Math.round(tfs * 1.25)}px`,
    margin: 0,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    wordWrap: "break-word",
  };

  const flavorStyle: CSSProperties = {
    fontSize: `${ffs}px`,
    fontFamily: theme.font_serif,
    color: theme.flavor_fg,
    lineHeight: `${Math.round(ffs * 1.25)}px`,
    fontStyle: "italic",
    marginTop: "auto",
    paddingBottom: "6px",
    overflowWrap: "break-word",
    wordWrap: "break-word",
  };

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
      <foreignObject x={rx} y={ry} width={rw} height={rh}>
        <div {...XHTML_NS} style={containerStyle}>
          <div style={rulesStyle}>{rulesText}</div>
          {flavorText && <div style={flavorStyle}>{flavorText}</div>}
        </div>
      </foreignObject>
    </>
  );
}
