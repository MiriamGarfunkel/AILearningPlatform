/** Hebrew + presentation forms used in Hebrew script (UI policy: English-only display). */
const HEBREW_SCRIPT = /[\u0590-\u05FF\uFB1D-\uFB4F]/;
/** Bidirectional / formatting marks that can leak script direction into the UI */
const BIDI_MARKS = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

/**
 * If the string contains Hebrew script, remove those characters and tidy whitespace.
 * Latin-only strings are returned unchanged.
 */
export function toEnglishUiText(value: string, emptyFallback: string): string {
  let s = String(value ?? '')
    .normalize('NFKC')
    .replace(BIDI_MARKS, '')
    .trim();
  if (!s) return emptyFallback;
  if (!HEBREW_SCRIPT.test(s)) return s;
  const stripped = s.replace(HEBREW_SCRIPT, '').replace(/\s{2,}/g, ' ').trim();
  return stripped.length > 0 ? stripped : emptyFallback;
}
