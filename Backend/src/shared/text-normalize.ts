export const strip_outer_quotes = (text: string): string => {
  if (!text) return '';
  return text.trim().replace(/^"|"$/g, '');
};
