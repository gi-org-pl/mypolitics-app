import type { QuotedText } from "../SurveyCheckpointText.types";

// A statement as the parts before, inside and after its quotation: the first
// place the quote stands in it, as written. A quote that is blank or is not
// in the statement marks nothing, and the statement is one part.
export const splitByQuote = (statement: string, quote: string): QuotedText => {
  const start = quote === "" ? -1 : statement.indexOf(quote);

  if (start < 0) return { before: statement, quoted: "", after: "" };

  const end = start + quote.length;

  return {
    before: statement.slice(0, start),
    quoted: statement.slice(start, end),
    after: statement.slice(end),
  };
};
