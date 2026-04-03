import { readFileSync, existsSync } from "node:fs";
import { extname } from "node:path";

/**
 * Read an image file and return it as a base64 data URI.
 * Returns null if the file doesn't exist.
 */
export function dataUriForImage(path: string): string | null {
  if (!existsSync(path)) return null;

  const ext = extname(path).toLowerCase();
  const mime =
    ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";

  const data = readFileSync(path);
  const b64 = data.toString("base64");
  return `data:${mime};base64,${b64}`;
}
