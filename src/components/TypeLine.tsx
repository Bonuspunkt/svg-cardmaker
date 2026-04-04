interface Props {
  typeLine: string;
}

export function TypeLine({ typeLine }: Props) {
  return <div className="type-line">{typeLine}</div>;
}
