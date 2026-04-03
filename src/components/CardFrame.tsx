import type { Theme } from "../types/theme.js";

interface Props {
  theme: Theme;
}

export function CardFrame({ theme }: Props) {
  const [cardW, cardH] = theme.card_sz;
  const [x, y, w, h] = theme.inner_rec;

  return (
    <>
      <rect
        x={0}
        y={0}
        width={cardW}
        height={cardH}
        fill={theme.frame_bg}
        rx={18}
        ry={18}
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={theme.frame_inner}
        rx={14}
        ry={14}
        stroke={theme.frame_border}
        strokeWidth={2}
      />
    </>
  );
}
