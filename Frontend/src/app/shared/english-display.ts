/** Bidirectional / formatting marks that can leak script direction into the UI */
const BIDI_MARKS = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

/**
 * Strips invisible bidi formatting marks and trims whitespace.
 * All scripts (Hebrew, Latin, etc.) are preserved.
 */
export function toEnglishUiText(value: string, emptyFallback: string): string {
  const s = String(value ?? '')
    .normalize('NFKC')
    .replace(BIDI_MARKS, '')
    .trim();
  return s.length > 0 ? s : emptyFallback;
}
