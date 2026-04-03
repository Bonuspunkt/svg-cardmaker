export interface TspanEntry {
  text: string;
  dy: number;
  x: number;
}

/**
 * Port of Python's textwrap.wrap with break_long_words=False.
 * Wraps text at word boundaries, respecting a max character width.
 */
function wrapLine(text: string, width: number): string[] {
  if (text.length <= width) return [text];

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= width) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Convert text (string or string[]) into an array of tspan entries
 * suitable for rendering in SVG <tspan> elements.
 *
 * Mirrors the Python wrap_svg_text() function behavior.
 */
export function wrapSvgText(
  text: string | string[],
  widthChars: number = 62,
  lineHeight: number = 20,
  x: number = 0,
): TspanEntry[] {
  let joined: string;
  if (Array.isArray(text)) {
    joined = text.map((el) => el).join("\n");
  } else {
    joined = text;
  }

  const entries: TspanEntry[] = [];
  let dy = 0;

  for (const para of joined.split("\n")) {
    if (para.trim() === "") {
      entries.push({ text: "", dy, x });
      dy = lineHeight * 2;
      continue;
    }
    for (const line of wrapLine(para, widthChars)) {
      entries.push({ text: line, dy, x });
      dy = lineHeight;
    }
  }

  return entries;
}
