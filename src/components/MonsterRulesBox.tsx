import type {
  MonsterSkill,
  MonsterAction,
  MonsterReaction,
  MonsterTrait,
} from "../types/card.js";
import { FOLD_MARGIN, FONT_SIZE_RULE } from "../theme/layout.js";

const CHARS_PER_LINE = 45;
const LINE_H = FONT_SIZE_RULE * 1.25; // cm per line
const FOLD_GAP_H = FOLD_MARGIN * 2;

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
  /** Y positions (cm from content top) where fold-gap spacers go. */
  foldGaps?: number[];
}

function estimateSectionH(text: string): number {
  let total = 1; // label line
  for (const line of text.split("\n")) {
    total += Math.max(1, Math.ceil(line.length / CHARS_PER_LINE));
  }
  return total * LINE_H;
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
  foldGaps,
}: Props) {
  const flavorText = monTypeLine ? `\u201C${monTypeLine}\u201D` : "";

  // Build sections list
  const sections: { label: string; text: string }[] = [];

  if (skills.length > 0) {
    sections.push({
      label: "Skills",
      text: skills.map((s) => `${s.name}${s.bonus >= 0 ? "+" : ""}${s.bonus}`).join(", "),
    });
  }
  if (resistances.length > 0) sections.push({ label: "Resistances", text: resistances.join(", ") });
  if (immunities.length > 0) sections.push({ label: "Immunities", text: immunities.join(", ") });
  if (vulnerabilities.length > 0) sections.push({ label: "Vulnerabilities", text: vulnerabilities.join(", ") });
  if (gear.length > 0) sections.push({ label: "Gear", text: gear.join(", ") });
  if (senses.length > 0) sections.push({ label: "Senses", text: senses.join(", ") });
  if (languages.length > 0) sections.push({ label: "Languages", text: languages.join(", ") });
  if (traits.length > 0) {
    sections.push({
      label: "Traits",
      text: traits.map((t) => `${t.name}: ${t.text}`).join("\n"),
    });
  }

  if (actions.length > 0) {
    let text = "";
    for (const action of actions) {
      if (action.name === "Spellcasting" && action.spell_list) {
        text += `${action.name}: ${action.text}\n`;
        for (const sl of action.spell_list) {
          text += `${sl.cooldown}: ${sl.spells.join(", ")}\n`;
        }
      } else {
        text += `${action.name}: ${action.text}\n`;
      }
    }
    sections.push({ label: "Actions", text: text.replace(/\n+$/, "") });
  }

  if (bonusActions.length > 0) {
    sections.push({
      label: "Bonus Actions",
      text: bonusActions.map((a) => `${a.name}: ${a.text}`).join("\n"),
    });
  }

  if (reactions.length > 0) {
    sections.push({
      label: "Reactions",
      text: reactions
        .map((r) => {
          if (r.trigger && r.response) {
            return `${r.name}: Trigger: ${r.trigger} Response: ${r.response}`;
          }
          return `${r.name}: ${r.text ?? ""}`;
        })
        .join("\n"),
    });
  }

  // Render without fold gaps (normal path)
  if (!foldGaps || foldGaps.length === 0) {
    return (
      <div className="monster-rules">
        <div>
          {sections.map((s, i) => (
            <Section key={i} label={s.label} text={s.text} />
          ))}
        </div>
        {flavorText && <div className="rules-flavor">{flavorText}</div>}
      </div>
    );
  }

  // Render with fold-gap spacers between sections
  const elements: React.ReactNode[] = [];
  let cumulativeH = 0;
  let gapIdx = 0;

  for (let i = 0; i < sections.length; i++) {
    const sectionH = estimateSectionH(sections[i].text);

    elements.push(<Section key={`s-${i}`} label={sections[i].label} text={sections[i].text} />);
    cumulativeH += sectionH;

    // Insert spacer after the section that crosses into the fold zone
    if (gapIdx < foldGaps.length && cumulativeH > foldGaps[gapIdx] - FOLD_MARGIN) {
      elements.push(
        <div key={`gap-${gapIdx}`} style={{ height: `${FOLD_GAP_H}cm`, flexShrink: 0 }} />
      );
      cumulativeH += FOLD_GAP_H;
      gapIdx++;
    }
  }

  return (
    <div className="monster-rules">
      <div>{elements}</div>
      {flavorText && <div className="rules-flavor">{flavorText}</div>}
    </div>
  );
}
