import { useMemo } from "react";

import type { SurveySessionApi } from "@/types/survey";

import type { QuestionActions } from "../../../SurveyQuestionnaire.types";

// Answer and skip: the one place a done question is handled. Nothing is asked
// of anybody after a done question here, and no time is measured: the
// checkpoint tasks add both in this hook.
export const useQuestionActions = ({
  answer,
  skip,
}: SurveySessionApi): QuestionActions =>
  useMemo(
    () => ({
      answer: (answerId) => answer(answerId),
      skip: () => skip(),
    }),
    [answer, skip],
  );
