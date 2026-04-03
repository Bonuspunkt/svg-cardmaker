/**
 * Sanitize a card name into a safe filename.
 * Replaces non-alphanumeric characters with underscores,
 * strips leading/trailing underscores.
 */
export function safeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
