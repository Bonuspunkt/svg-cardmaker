import type { CSSProperties } from "react";
import type { Theme } from "../types/theme.js";
import type { SpellInfo } from "../types/card.js";

const XHTML_NS = { xmlns: "http://www.w3.org/1999/xhtml" } as Record<
  string,
  string
>;

interface Props {
  theme: Theme;
  spell: SpellInfo;
}

function Label({ children }: { children: string }) {
  return <span style={{ fontWeight: "bold" }}>{children}</span>;
}

export function SpellTypeGrid({ theme, spell }: Props) {
  const [rx, ry, rw, rh] = theme.type_rec;
  const [, , fs] = theme.type_txt_rec;

  const rows = [
    [<><span style={{fontWeight:'bold'}}>School:</span> {spell.school}</>, <><span style={{fontWeight:'bold'}}>Casting time:</span> {spell.casting_time}</>],
    [<><span style={{fontWeight:'bold'}}>Range/Area:</span> {spell.range_area}</>],
    [<><span style={{fontWeight:'bold'}}>Components:</span> {spell.components.join(", ")}</>, <><span style={{fontWeight:'bold'}}>Duration:</span> {spell.duration}</>],
    [<><span style={{fontWeight:'bold'}}>Attack/Save:</span> {spell.attack_save}</>, <><span style={{fontWeight:'bold'}}>Damage/Effect:</span> {spell.damage_effect}</>],
  ];

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    padding: "6px 18px",
    boxSizing: "border-box",
    overflow: "hidden",
    fontFamily: theme.font_sans,
    fontSize: `${fs}px`,
    color: theme.type_fg,
    lineHeight: `${fs * 1.25}px`,
  };

  const rowStyle: CSSProperties = {
    display: "flex",
  };

  const cellStyle: CSSProperties = {
    flex: "0 0 50%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const fullWidthCellStyle: CSSProperties = {
    flex: "1 1 100%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <>
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        rx={6}
        ry={6}
        fill={theme.type_bg}
        stroke={theme.frame_border}
        strokeWidth={2}
      />
      <foreignObject x={rx} y={ry} width={rw} height={rh}>
        <div {...XHTML_NS} style={containerStyle}>
          {rows.map((row, i) => (
            <div key={i} style={rowStyle}>
              {row.map((cell, j) => (
                <div
                  key={j}
                  style={row.length === 1 ? fullWidthCellStyle : cellStyle}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </foreignObject>
    </>
  );
}
