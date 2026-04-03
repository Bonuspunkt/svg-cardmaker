/**
 * Parse dice notation like "2D10+4" and return the average value.
 */
export function diceAverage(diceStr: string): number {
  const pattern = /^(\d+)[dD](\d+)\s*([+-]\d+)?$/;
  const match = diceStr.trim().match(pattern);

  if (!match) {
    throw new Error(`Invalid dice string: ${diceStr}`);
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  const avgDie = (1 + sides) / 2;
  return count * avgDie + modifier;
}
