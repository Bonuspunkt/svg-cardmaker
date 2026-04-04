interface Props {
  setCode: string;
  collector: string;
  author: string;
  copyrightStr: string;
}

export function Footer({ setCode, collector, author, copyrightStr }: Props) {
  return (
    <div className="card-footer">
      <div>{setCode} &bull; {collector} &bull; {author}</div>
      <div>{copyrightStr}</div>
    </div>
  );
}
