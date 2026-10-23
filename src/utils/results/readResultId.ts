import { isResultId } from "./isResultId";

// The result identifier a text holds, as it was typed or pasted: the text
// without the space around it, in lower case, when that is a result
// identifier in form. Anything else holds none.
export const readResultId = (text: string): string | undefined => {
  const resultId = text.trim().toLowerCase();

  return isResultId(resultId) ? resultId : undefined;
};
