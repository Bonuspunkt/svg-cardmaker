interface Props {
  rules: string | string[];
  flavor?: string;
}

export function RulesBox({ rules, flavor }: Props) {
  const rulesText = Array.isArray(rules) ? rules.join("\n") : rules;
  const flavorText = flavor ? `\u201C${flavor}\u201D` : "";

  return (
    <div className="rules-box">
      <div className="rules-text">{rulesText}</div>
      {flavorText && <div className="rules-flavor">{flavorText}</div>}
    </div>
  );
}
