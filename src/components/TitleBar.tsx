interface Props {
  name: string;
  rarity: string;
}

export function TitleBar({ name, rarity }: Props) {
  return (
    <div className="title-bar">
      <span className="title-name">{name}</span>
      <span className="title-rarity">{rarity}</span>
    </div>
  );
}
