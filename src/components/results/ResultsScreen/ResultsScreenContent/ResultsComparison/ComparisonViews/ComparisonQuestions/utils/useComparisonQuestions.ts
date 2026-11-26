import { useCallback, useMemo, useState } from "react";

import type { OtherSide } from "@/types/comparison";
import type { ResultAnswer } from "@/types/results";
import type { Survey } from "@/types/survey";
import { toggleItem } from "@/utils/array/toggleItem";
import { getComparedQuestions } from "@/utils/comparison/getComparedQuestions";

import type { ComparisonQuestionsControls } from "../ComparisonQuestions.types";
import { filterComparedQuestions } from "./filterComparedQuestions";

// The view of the questions of one comparison: what is searched for, whether
// only disagreement is listed, which rows are open - and, from those, the
// questions to list. All of it lives here and nowhere else, and lasts as long
// as the view is shown.
//
// The questions are compared once per comparison, not on every key pressed,
// and a row stays open while the search or the filter takes it off the list:
// it is open again when it is back.
export const useComparisonQuestions = (
  survey: Pick<Survey, "questions">,
  answers: readonly ResultAnswer[],
  other: OtherSide,
): ComparisonQuestionsControls => {
  const [search, setSearch] = useState("");
  const [isOnlyDisagreement, setIsOnlyDisagreement] = useState(false);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const questions = useMemo(
    () => getComparedQuestions(survey, answers, other),
    [survey, answers, other],
  );
  const listed = useMemo(
    () => filterComparedQuestions(questions, { search, isOnlyDisagreement }),
    [questions, search, isOnlyDisagreement],
  );
  const toggleQuestion = useCallback(
    (questionId: string) =>
      setOpenIds((current) => toggleItem(current, questionId)),
    [],
  );

  return {
    search,
    isOnlyDisagreement,
    listed,
    openIds,
    setSearch,
    setIsOnlyDisagreement,
    toggleQuestion,
  };
};
