import type { Theme } from "../types/theme.js";
import { dataUriForImage } from "../utils/image.js";

interface Props {
  theme: Theme;
  artPath?: string;
}

export function ArtClipDef({ theme }: { theme: Theme }) {
  const [x, y, w, h] = theme.art_rec;
  return (
    <clipPath id="artClip">
      <rect x={x} y={y} rx={10} ry={10} width={w} height={h} />
    </clipPath>
  );
}

export function ArtSection({ theme, artPath }: Props) {
  const [x, y, w, h] = theme.art_rec;

  const uri = artPath ? dataUriForImage(artPath) : null;

  return (
    <>
      {uri ? (
        <image
          href={uri}
          x={x}
          y={y}
          width={w}
          height={h}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#artClip)"
        />
      ) : (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={10}
          ry={10}
          fill={theme.art_bg}
          stroke={theme.frame_border}
          strokeWidth={2}
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        ry={10}
        fillOpacity={0}
        stroke={theme.frame_border}
        strokeWidth={2}
      />
    </>
  );
}
