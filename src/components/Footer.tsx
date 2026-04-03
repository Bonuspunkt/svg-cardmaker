import type { Theme } from "../types/theme.js";

interface Props {
  theme: Theme;
  setCode: string;
  collector: string;
  author: string;
  copyrightStr: string;
}

export function Footer({ theme, setCode, collector, author, copyrightStr }: Props) {
  const [lx, ly, lfs] = theme.footer_txt_rec_l;
  const [rx, ry, rfs] = theme.footer_txt_rec_r;

  return (
    <g>
      <text
        x={lx}
        y={ly}
        fontFamily={theme.font_sans}
        fontSize={lfs}
        fill={theme.footer_fg}
      >
        {setCode} • {collector} • {author}
      </text>
      <text
        x={rx}
        y={ry}
        fontFamily={theme.font_sans}
        fontSize={rfs}
        textAnchor="end"
        fill={theme.footer_fg}
      >
        {copyrightStr}
      </text>
    </g>
  );
}
