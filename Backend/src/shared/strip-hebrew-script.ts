/** Hebrew + Hebrew presentation forms in Unicode */
const HEBREW_SCRIPT = /[\u0590-\u05FF\uFB1D-\uFB4F]/g;

export function stripHebrewScript(input: string): string {
  return input.replace(HEBREW_SCRIPT, '').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Recursively removes Hebrew script from all string values in a JSON-like structure.
 */
export function stripHebrewFromDeep(value: unknown): unknown {
  if (typeof value === 'string') {
    const t = stripHebrewScript(value);
    return t.length > 0 ? t : '';
  }
  if (Array.isArray(value)) {
    return value.map((v) => stripHebrewFromDeep(v));
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      out[key] = stripHebrewFromDeep(obj[key]);
    }
    return out;
  }
  return value;
}
