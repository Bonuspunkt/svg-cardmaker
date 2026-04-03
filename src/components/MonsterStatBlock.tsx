import type { Theme } from "../types/theme.js";
import type { AbilityScore } from "../types/card.js";
import { diceAverage } from "../utils/dice.js";

interface Props {
  theme: Theme;
  ac: number;
  hp: string;
  ini: string;
  speed: string;
  str: AbilityScore;
  dex: AbilityScore;
  con: AbilityScore;
  int: AbilityScore;
  wis: AbilityScore;
  cha: AbilityScore;
}

function formatMod(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return (sign + n).padStart(3, " ");
}

function splitAttr(name: string, attr: AbilityScore): string {
  const v = attr.score;
  const m = attr.mod;
  const s = attr.save;
  return `${name.padStart(3, " ")}: ${formatMod(v)}| ${formatMod(m)}| ${formatMod(s)}`;
}

export function MonsterStatBlock({
  theme,
  ac,
  hp,
  ini,
  speed,
  str,
  dex,
  con,
  int: int_,
  wis,
  cha,
}: Props) {
  const [rx, ry, rw, rh] = theme.type_rec;
  const [baseX, baseY, fs] = theme.type_txt_rec;

  const hpAvg = Math.floor(diceAverage(hp));

  // Grid: 2 columns, rows advance after indices 1, 3, 5, 7
  const items = [
    ` AC: ${String(ac).padStart(3, " ")}`,
    `INI: ${ini}`,
    ` HP: ${String(hpAvg).padStart(3, " ")} (${hp})`,
    ` SP: ${speed}`,
    splitAttr("STR", str),
    splitAttr("INT", int_),
    splitAttr("DEX", dex),
    splitAttr("WIS", wis),
    splitAttr("CON", con),
    splitAttr("CHA", cha),
  ];

  const textElements: Array<{ x: number; y: number; text: string }> = [];
  let dx = 0;
  let y = baseY;

  for (let idx = 0; idx < items.length; idx++) {
    textElements.push({ x: baseX + dx, y, text: items[idx] });
    dx += 300;
    if (idx === 1 || idx === 3 || idx === 5 || idx === 7) {
      y += fs;
      dx = 0;
    }
  }

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
      {textElements.map((el, i) => (
        <text
          key={i}
          x={el.x}
          y={el.y}
          fontFamily={theme.font_mono}
          fontSize={fs}
          fill={theme.type_fg}
          xmlSpace="preserve"
        >
          {el.text}
        </text>
      ))}
    </>
  );
}
