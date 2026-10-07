import { findWholePhrases } from "@/utils/text/findWholePhrases";

import { EXPLANATION_PREVIEW_ELLIPSIS } from "../../SurveyQuestion.constants";

export const getExplanationPreview = (
  explanation: string,
  triggerPhrases: string[],
): string | undefined => {
  const firstTrigger = findWholePhrases(explanation, triggerPhrases).at(0);

  return firstTrigger
    ? `${explanation.slice(0, firstTrigger.end)}${EXPLANATION_PREVIEW_ELLIPSIS}`
    : undefined;
};
