const PUNCT_RE = /[.,،؛:!؟?\-–—…«»""''()\[\]{}]/g;

export function stripArabicPunctuation(value: string): string {
  return value
    .replace(PUNCT_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}
