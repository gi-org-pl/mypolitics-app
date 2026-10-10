import { toSingleLine } from "@/utils/text/toSingleLine";

import { QUOTATION_MARKS } from "../SurveyCheckpointStats.constants";

// The part of a statement to mark as a quotation: the thesis as the statement
// holds it, with the quotation marks the line put around it - the frame sets
// the marks in italics too. The first place the thesis stands between marks
// is the one; a thesis the line left without marks is the quotation by
// itself. Nothing when the statement does not hold the thesis.
export const getStatsQuote = (statement?: string, thesis?: string): string => {
  const text = toSingleLine(statement);
  const quoted = toSingleLine(thesis);

  if (quoted === "" || !text.includes(quoted)) return "";

  for (
    let start = text.indexOf(quoted);
    start >= 0;
    start = text.indexOf(quoted, start + 1)
  ) {
    const end = start + quoted.length;

    if (
      QUOTATION_MARKS.includes(text[start - 1]) &&
      QUOTATION_MARKS.includes(text[end])
    ) {
      return text.slice(start - 1, end + 1);
    }
  }

  return quoted;
};
