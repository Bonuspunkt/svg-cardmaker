import type { Theme } from "../types/theme.js";

interface Props {
  theme: Theme;
  school: string;
  castingTime: string;
  rangeArea: string;
  components: string;
  duration: string;
  attackSave: string;
  damageEffect: string;
}

export function SpellTypeGrid({
  theme,
  school,
  castingTime,
  rangeArea,
  components,
  duration,
  attackSave,
  damageEffect,
}: Props) {
  const [rx, ry, rw, rh] = theme.type_rec;
  const [baseX, baseY, fs] = theme.type_txt_rec;

  // Grid layout: 2 columns, items advance row after indices 1, 2, 4, 6
  const items = [
    school,
    castingTime,
    rangeArea,
    components,
    duration,
    attackSave,
    damageEffect,
  ];

  const textElements: Array<{ x: number; y: number; text: string }> = [];
  let dx = 0;
  let y = baseY;

  for (let idx = 0; idx < items.length; idx++) {
    textElements.push({ x: baseX + dx, y, text: items[idx] });
    dx += 300;
    if (idx === 1 || idx === 2 || idx === 4 || idx === 6) {
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
          fontFamily={theme.font_sans}
          fontSize={fs}
          fill={theme.type_fg}
        >
          {el.text}
        </text>
      ))}
    </>
  );
}
