import type { SpellInfo } from "../types/card.js";

interface Props {
  spell: SpellInfo;
}

export function SpellTypeGrid({ spell }: Props) {
  const rows = [
    [
      <><span className="spell-grid-label">School:</span> {spell.school}</>,
      <><span className="spell-grid-label">Casting time:</span> {spell.casting_time}</>,
    ],
    [
      <><span className="spell-grid-label">Range/Area:</span> {spell.range_area}</>,
    ],
    [
      <><span className="spell-grid-label">Components:</span> {spell.components.join(", ")}</>,
      <><span className="spell-grid-label">Duration:</span> {spell.duration}</>,
    ],
    [
      <><span className="spell-grid-label">Attack/Save:</span> {spell.attack_save}</>,
      <><span className="spell-grid-label">Damage/Effect:</span> {spell.damage_effect}</>,
    ],
  ];

  return (
    <div className="spell-grid">
      {rows.map((row, i) => (
        <div key={i} className="spell-grid-row">
          {row.map((cell, j) => (
            <div
              key={j}
              className={row.length === 1 ? "spell-grid-cell--full" : "spell-grid-cell"}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
