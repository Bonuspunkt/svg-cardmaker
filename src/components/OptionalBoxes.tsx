import type { Theme } from "../types/theme.js";

interface Props {
  theme: Theme;
  pt?: string | null;
  price?: string | null;
  weight?: string | null;
}

export function OptionalBoxes({ theme, pt, price, weight }: Props) {
  let [bx, by, bw, bh] = theme.opt_box;
  let [tx, ty, tfs] = theme.opt_txt_rec;

  const boxes: React.ReactElement[] = [];

  for (const el of [pt, price, weight]) {
    if (el) {
      boxes.push(
        <g key={`opt-${el}-${bx}`}>
          <rect
            x={bx - bw}
            y={by}
            width={bw}
            height={bh}
            rx={8}
            ry={8}
            fill={theme.pt_bg}
            stroke={theme.frame_border}
            strokeWidth={2}
          />
          <text
            x={tx}
            y={ty}
            fontFamily={theme.font_serif}
            fontSize={tfs}
            fontWeight={700}
            textAnchor="middle"
            fill={theme.pt_fg}
          >
            {el}
          </text>
        </g>,
      );
      bx -= bw + 6;
      tx -= bw + 6;
    }
  }

  return <>{boxes}</>;
}
