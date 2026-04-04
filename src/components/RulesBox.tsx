import { FOLD_MARGIN, FONT_SIZE_RULE } from "../theme/layout.js";

const CHARS_PER_LINE = 45;
const LINE_H = FONT_SIZE_RULE * 1.25; // cm per line
const FOLD_GAP_H = FOLD_MARGIN * 2;

interface Props {
  rules: string | string[];
  flavor?: string;
  /** Fold line Y positions (cm from rules-box content top). */
  foldGaps?: number[];
}

export function RulesBox({ rules, flavor, foldGaps }: Props) {
  const rulesText = Array.isArray(rules) ? rules.join("\n") : rules;
  const flavorText = flavor ? `\u201C${flavor}\u201D` : "";

  if (!foldGaps || foldGaps.length === 0) {
    return (
      <div className="rules-box">
        <div className="rules-text">{rulesText}</div>
        {flavorText && <div className="rules-flavor">{flavorText}</div>}
      </div>
    );
  }

  // Split into paragraphs and insert spacers after crossing fold boundaries
  const paragraphs = rulesText.split("\n");
  const elements: React.ReactNode[] = [];
  let cumulativeH = 0;
  let gapIdx = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const lines = Math.max(1, Math.ceil(paragraphs[i].length / CHARS_PER_LINE));
    const paraH = lines * LINE_H;

    elements.push(<div key={`p-${i}`}>{paragraphs[i] || "\u00A0"}</div>);
    cumulativeH += paraH;

    // Insert spacer after the paragraph that crosses into the fold zone
    if (gapIdx < foldGaps.length && cumulativeH > foldGaps[gapIdx] - FOLD_MARGIN) {
      elements.push(
        <div key={`gap-${gapIdx}`} style={{ height: `${FOLD_GAP_H}cm`, flexShrink: 0 }} />
      );
      cumulativeH += FOLD_GAP_H;
      gapIdx++;
    }
  }

  return (
    <div className="rules-box">
      <div className="rules-text">{elements}</div>
      {flavorText && <div className="rules-flavor">{flavorText}</div>}
    </div>
  );
}
