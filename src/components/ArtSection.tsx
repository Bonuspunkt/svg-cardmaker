interface Props {
  artPath?: string;
  /** Pre-resolved image source (data URI or URL). Takes precedence over artPath. */
  artSrc?: string | null;
  /** Background image shown behind the card art. */
  bgSrc?: string;
}

export function ArtSection({ artPath, artSrc, bgSrc }: Props) {
  const src = artSrc ?? artPath ?? null;

  const style = bgSrc
    ? { backgroundImage: `url(${bgSrc})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;

  return (
    <div className="art-section" style={style}>
      {src && <img className="art-image" src={src} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
    </div>
  );
}
