import type { Theme } from "../types/theme.js";

interface Props {
  theme: Theme;
  name: string;
  rarity: string;
}

export function TitleBar({ theme, name, rarity }: Props) {
  const [rx, ry, rw, rh] = theme.title_rec;
  const [tx, ty, tfs] = theme.title_txt_rec;
  const [rrx, rry, rrfs] = theme.title_rarity_rec;

  return (
    <>
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        rx={8}
        ry={8}
        fill={theme.title_bg}
        stroke={theme.frame_border}
        strokeWidth={2}
      />
      <text
        x={tx}
        y={ty}
        fontFamily={theme.font_serif}
        fontSize={tfs}
        fontWeight={700}
        fill={theme.title_fg}
      >
        {name}
      </text>
      <text
        x={rrx}
        y={rry}
        fontFamily={theme.font_serif}
        fontSize={rrfs}
        textAnchor="end"
        fill={theme.title_fg}
      >
        {rarity}
      </text>
    </>
  );
}
