import type { Theme } from "../types/theme.js";

interface Props {
  theme: Theme;
  typeLine: string;
}

export function TypeLine({ theme, typeLine }: Props) {
  const [rx, ry, rw, rh] = theme.type_rec;
  const [tx, ty, tfs] = theme.type_txt_rec;

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
      <text
        x={tx}
        y={ty}
        fontFamily={theme.font_sans}
        fontSize={tfs}
        fontWeight={600}
        fill={theme.type_fg}
      >
        {typeLine}
      </text>
    </>
  );
}
