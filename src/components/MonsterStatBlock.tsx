import type { AbilityScore } from "../types/card.js";
import { diceAverage } from "../utils/dice.js";

interface Props {
  ac: number;
  hp: string;
  ini: string;
  speed: string;
  str: AbilityScore;
  dex: AbilityScore;
  con: AbilityScore;
  int: AbilityScore;
  wis: AbilityScore;
  cha: AbilityScore;
}

function formatMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function AbilityCell({ label, attr }: { label: string; attr: AbilityScore }) {
  const hasProfSave = attr.save !== attr.mod;
  return (
    <div className="monster-stats-ability-cell">
      <div className="monster-stats-label">{label}</div>
      <div>
        {attr.score} ({formatMod(attr.mod)})
      </div>
      {hasProfSave && (
        <div className="monster-stats-save">
          Save {formatMod(attr.save)}
        </div>
      )}
    </div>
  );
}

export function MonsterStatBlock({
  ac,
  hp,
  ini,
  speed,
  str,
  dex,
  con,
  int: int_,
  wis,
  cha,
}: Props) {
  const hpAvg = Math.floor(diceAverage(hp));

  const abilities: Array<{ label: string; attr: AbilityScore }> = [
    { label: "STR", attr: str },
    { label: "DEX", attr: dex },
    { label: "CON", attr: con },
    { label: "INT", attr: int_ },
    { label: "WIS", attr: wis },
    { label: "CHA", attr: cha },
  ];

  return (
    <div className="monster-stats">
      <div className="monster-stats-kv-row">
        <div className="monster-stats-kv-cell">
          <span className="monster-stats-label">AC:</span> {ac}
        </div>
        <div className="monster-stats-kv-cell">
          <span className="monster-stats-label">Initiative:</span> {ini}
        </div>
      </div>
      <div className="monster-stats-kv-row">
        <div className="monster-stats-kv-cell">
          <span className="monster-stats-label">HP:</span> {hpAvg} ({hp})
        </div>
        <div className="monster-stats-kv-cell">
          <span className="monster-stats-label">Speed:</span> {speed}
        </div>
      </div>
      <div className="monster-stats-divider" />
      <div className="monster-stats-ability-row">
        {abilities.map(({ label, attr }) => (
          <AbilityCell key={label} label={label} attr={attr} />
        ))}
      </div>
    </div>
  );
}
