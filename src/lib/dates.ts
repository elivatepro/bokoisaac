// Paper still has "20XX" for dates Boko hasn't confirmed. These helpers keep placeholders off the public site:
// an unknown start reads "Until 2025", and a fully unknown period isn't shown at all.

/** True for a real year or word ("2025", "now"); false for placeholders like "20XX". */
export const known = (y?: string | null): y is string => !!y && !/X/i.test(y);

/** "20XX to 2025" → "Until 2025", "20XX to 20XX" / "20XX" → "", anything known stays as it is. */
export function period(when: string): string {
  const [from, to] = when.split(/\s+to\s+/i);
  if (to === undefined) return known(from) ? from : '';
  if (known(from) && known(to)) return from === to ? from : when;
  if (known(to)) return `Until ${to}`;
  if (known(from)) return `From ${from}`;
  return '';
}
