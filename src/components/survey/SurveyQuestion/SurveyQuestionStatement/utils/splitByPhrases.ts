import { findWholePhrases } from "@/utils/text/findWholePhrases";

import type { TextPart } from "../SurveyQuestionStatement.types";

export const splitByPhrases = (text: string, phrases: string[]): TextPart[] => {
  const parts: TextPart[] = [];
  let position = 0;

  for (const { start, end } of findWholePhrases(text, phrases)) {
    if (start > position) {
      parts.push({ text: text.slice(position, start), isMatched: false });
    }

    parts.push({ text: text.slice(start, end), isMatched: true });
    position = end;
  }

  if (position < text.length) {
    parts.push({ text: text.slice(position), isMatched: false });
  }

  return parts;
};
