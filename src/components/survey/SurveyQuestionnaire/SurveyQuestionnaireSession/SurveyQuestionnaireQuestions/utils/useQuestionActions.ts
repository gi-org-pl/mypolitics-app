import { useEffect, useMemo, useRef } from "react";

import type { SurveySessionApi } from "@/types/survey";

import type { QuestionActions } from "../SurveyQuestionnaireQuestions.types";

// Answer and skip: the one place a done question is handled. Nothing is asked
// of anybody after a done question here, and no time is measured: the
// checkpoint tasks add both in this hook.
//
// An answer reports its press only when its acknowledgement has played, a
// third of a second later. A question that has left the screen by then - the
// taker moved on in the site, or another question took its place - records
// nothing: an answer that was not acknowledged was not given.
export const useQuestionActions = ({
  answer,
  skip,
}: SurveySessionApi): QuestionActions => {
  const isOnScreen = useRef(false);

  useEffect(() => {
    isOnScreen.current = true;

    return () => {
      isOnScreen.current = false;
    };
  }, []);

  return useMemo(
    () => ({
      answer: (answerId) => {
        if (isOnScreen.current) {
          answer(answerId);
        }
      },
      skip: () => skip(),
    }),
    [answer, skip],
  );
};
