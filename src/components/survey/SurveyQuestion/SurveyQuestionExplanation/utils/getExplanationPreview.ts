import { findWholePhrases } from "@/utils/text/findWholePhrases";

export const getExplanationPreview = (
  explanation: string,
  triggerPhrases: string[],
  ellipsis: string,
): string | undefined => {
  const firstTrigger = findWholePhrases(explanation, triggerPhrases).at(0);

  return firstTrigger
    ? `${explanation.slice(0, firstTrigger.end)}${ellipsis}`
    : undefined;
};
