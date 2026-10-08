import type { Survey } from "@/types/survey";

import { getTopicLimit } from "./getTopicLimit";
import { getVisibleCategories } from "./getVisibleCategories";

// The identifiers that are visible categories of the quiz, each once, in the
// order given, cut to the limit.
export const getValidTopics = (
  survey: Survey,
  topicIds: readonly unknown[],
): string[] => {
  const visibleIds = new Set(getVisibleCategories(survey).map(({ id }) => id));

  return [...new Set(topicIds)]
    .filter(
      (topicId): topicId is string =>
        typeof topicId === "string" && visibleIds.has(topicId),
    )
    .slice(0, getTopicLimit(survey));
};
