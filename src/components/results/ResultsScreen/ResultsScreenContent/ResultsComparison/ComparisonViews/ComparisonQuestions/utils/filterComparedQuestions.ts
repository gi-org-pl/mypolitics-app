import { Agreement, type ComparedQuestion } from "@/types/comparison";
import { containsText } from "@/utils/text/containsText";

import type { QuestionsFilter } from "../ComparisonQuestions.types";

// The questions a comparison lists, of all it has: those whose text contains
// what is searched for, ignoring letter case, and - when only disagreement is
// asked for - those the two sides disagree on. A question passes when it
// passes both. The order is left as it is, and so is the list given.
export const filterComparedQuestions = (
  questions: readonly ComparedQuestion[],
  { search, isOnlyDisagreement }: QuestionsFilter,
): ComparedQuestion[] =>
  questions.filter(
    ({ question, agreement }) =>
      containsText(question.text, search) &&
      (!isOnlyDisagreement || agreement === Agreement.Disagree),
  );
