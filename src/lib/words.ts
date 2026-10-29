// "Five people…", "Eight short answers…": counts written as words, as in the Paper copy.
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

/** Capitalised number word for 0–12, digits above that. */
export const countWord = (n: number) => WORDS[n] ?? String(n);
