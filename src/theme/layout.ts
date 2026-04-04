// All dimensions in cm, designed for standard 63mm x 88mm playing cards.
// Original SVG coordinate system was 744 x 1039 unitless pixels.
const S = 6.3 / 744; // cm per SVG unit

function cm(svgUnits: number): number {
  return Math.round(svgUnits * S * 10000) / 10000;
}

// Card dimensions
export const CARD_WIDTH = 6.3;
export const CARD_HEIGHT = 8.8;
export const OUTER_PADDING = cm(12);
export const INNER_PADDING = cm(18);
export const INNER_WIDTH = cm(708);

// Section heights
export const TITLE_H = cm(52);
export const ART_H = cm(430);
export const TYPE_H_ITEM = cm(52);
export const TYPE_H_SPELL = cm(134);
export const TYPE_H_MONSTER = cm(170);
export const RULES_H_ITEM = cm(393);
export const RULES_H_SPELL = cm(780);
export const RULES_H_MONSTER = cm(744);
export const OPT_H = cm(52);

// Font sizes (in cm, same coordinate system)
export const FONT_SIZE_TITLE = cm(32);
export const FONT_SIZE_RULE = cm(24);
export const FONT_SIZE_FOOTER = cm(11);

// Border radii
export const RADIUS_CARD = cm(18);
export const RADIUS_INNER = cm(14);
export const RADIUS_TITLE = cm(8);
export const RADIUS_ART = cm(10);
export const RADIUS_TYPE = cm(6);
export const RADIUS_RULES = cm(10);
export const RADIUS_OPT = cm(8);

// Common spacing
export const SECTION_GAP = cm(6);
/** Clear space above and below each fold line in tent mode (cm). */
export const FOLD_MARGIN = 0.25;
export const BORDER_WIDTH = cm(2);
export const PADDING_H = cm(18);
export const PADDING_V = cm(6);

// Font families
export const FONT_SERIF = "Georgia, 'Times New Roman', serif";
export const FONT_SANS = "Inter, Arial, sans-serif";
export const FONT_MONO = "Cascadia Code";
