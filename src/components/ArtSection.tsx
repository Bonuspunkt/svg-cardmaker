interface Props {
  artPath?: string;
  /** Pre-resolved image source (data URI or URL). Takes precedence over artPath. */
  artSrc?: string | null;
}

export function ArtSection({ artPath, artSrc }: Props) {
  const src = artSrc ?? artPath ?? null;

  return (
    <div className="art-section">
      {src && <img className="art-image" src={src} />}
    </div>
  );
}
