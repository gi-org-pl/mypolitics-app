import type { TextRange } from "@/types/text";

import { escapeRegExp } from "./escapeRegExp";

const WORD_CHARACTERS = String.raw`\p{L}\p{M}\p{N}_`;
const TEXT_START = " ";

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
    `([^${WORD_CHARACTERS}])(${alternatives.join("|")})(?![${WORD_CHARACTERS}])`,
    "giu",
  );
  const searchedText = `${TEXT_START}${text}`;
  const ranges: TextRange[] = [];

  for (
    let match = pattern.exec(searchedText);
    match !== null;
    match = pattern.exec(searchedText)
  ) {
    const [, boundary, phrase] = match;
    const start = match.index + boundary.length - TEXT_START.length;
    const end = start + phrase.length;

    ranges.push({ start, end });
    // The last character of a match may be the boundary before the next one.
    pattern.lastIndex = end + TEXT_START.length - 1;
  }

  return ranges;
};
