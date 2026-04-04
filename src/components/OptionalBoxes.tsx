interface Props {
  pt?: string | null;
  price?: string | null;
  weight?: string | null;
}

export function OptionalBoxes({ pt, price, weight }: Props) {
  const items = [pt, price, weight].filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div className="optional-boxes">
      {items.map((el, i) => (
        <div key={i} className="optional-box">
          {el}
        </div>
      ))}
    </div>
  );
}
