import { escapeRegExp } from "./escapeRegExp";

export interface TextRange {
  start: number;
  end: number;
}

const WORD_CHARACTER = String.raw`[\p{L}\p{M}\p{N}_]`;

export const findWholePhrases = (
  text: string,
  phrases: string[],
): TextRange[] => {
  const alternatives = phrases
    .map((phrase) => phrase.trim())
    .filter((phrase) => phrase !== "")
    .sort((first, second) => second.length - first.length)
    .map(escapeRegExp);

  if (alternatives.length === 0) return [];

  const pattern = new RegExp(
    `(?<!${WORD_CHARACTER})(?:${alternatives.join("|")})(?!${WORD_CHARACTER})`,
    "giu",
  );

  return Array.from(text.matchAll(pattern), (match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
};
