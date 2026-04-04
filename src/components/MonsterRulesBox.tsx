import type {
  MonsterSkill,
  MonsterAction,
  MonsterReaction,
  MonsterTrait,
} from "../types/card.js";

interface Props {
  skills: MonsterSkill[];
  gear: string[];
  senses: string[];
  languages: string[];
  actions: MonsterAction[];
  bonusActions: MonsterAction[];
  reactions: MonsterReaction[];
  traits: MonsterTrait[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  monTypeLine: string;
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="monster-rules-label">{label}:</div>
      <div className="monster-rules-content">{text}</div>
    </div>
  );
}

export function MonsterRulesBox({
  skills,
  gear,
  senses,
  languages,
  actions,
  bonusActions,
  reactions,
  traits,
  resistances,
  immunities,
  vulnerabilities,
  monTypeLine,
}: Props) {
  const flavorText = monTypeLine ? `\u201C${monTypeLine}\u201D` : "";

  let actionsText = "";
  if (actions.length > 0) {
    for (const action of actions) {
      if (action.name === "Spellcasting" && action.spell_list) {
        actionsText += `${action.name}: ${action.text}\n`;
        for (const sl of action.spell_list) {
          actionsText += `${sl.cooldown}: ${sl.spells.join(", ")}\n`;
        }
      } else {
        actionsText += `${action.name}: ${action.text}\n`;
      }
    }
    actionsText = actionsText.replace(/\n+$/, "");
  }

  return (
    <div className="monster-rules">
      <div>
        {skills.length > 0 && (
          <Section
            label="Skills"
            text={skills
              .map((s) => `${s.name}${s.bonus >= 0 ? "+" : ""}${s.bonus}`)
              .join(", ")}
          />
        )}
        {resistances.length > 0 && (
          <Section label="Resistances" text={resistances.join(", ")} />
        )}
        {immunities.length > 0 && (
          <Section label="Immunities" text={immunities.join(", ")} />
        )}
        {vulnerabilities.length > 0 && (
          <Section label="Vulnerabilities" text={vulnerabilities.join(", ")} />
        )}
        {gear.length > 0 && (
          <Section label="Gear" text={gear.join(", ")} />
        )}
        {senses.length > 0 && (
          <Section label="Senses" text={senses.join(", ")} />
        )}
        {languages.length > 0 && (
          <Section label="Languages" text={languages.join(", ")} />
        )}
        {traits.length > 0 && (
          <Section
            label="Traits"
            text={traits.map((t) => `${t.name}: ${t.text}`).join("\n")}
          />
        )}
        {actionsText && (
          <Section label="Actions" text={actionsText} />
        )}
        {bonusActions.length > 0 && (
          <Section
            label="Bonus Actions"
            text={bonusActions.map((a) => `${a.name}: ${a.text}`).join("\n")}
          />
        )}
        {reactions.length > 0 && (
          <Section
            label="Reactions"
            text={reactions
              .map((r) => {
                if (r.trigger && r.response) {
                  return `${r.name}: Trigger: ${r.trigger} Response: ${r.response}`;
                }
                return `${r.name}: ${r.text ?? ""}`;
              })
              .join("\n")}
          />
        )}
      </div>
      {flavorText && (
        <div className="rules-flavor">
          {flavorText}
        </div>
      )}
    </div>
  );
}
