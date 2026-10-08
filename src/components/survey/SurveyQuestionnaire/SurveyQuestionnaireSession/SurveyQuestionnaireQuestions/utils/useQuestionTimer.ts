import { useCallback, useEffect, useRef } from "react";

import type { Survey } from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";

const MS_PER_SECOND = 1000;

// How long a question has been on screen. The timer starts when the question
// appears, and the function it returns gives the seconds since then.
//
// A question is timed only when it appeared during this page's life. The one
// the page was loaded onto - the store still holds the very session it read
// from storage - was on screen before the reload for a time nobody knows, so
// it gives nothing and gets no sample. The first question of a session
// created on this page is timed like any other.
//
// The time a card is on screen belongs to no question: no question is
// mounted then, and the next one starts its own timer when it appears.
export const useQuestionTimer = (
  survey: Survey,
  questionId?: string,
): (() => number | undefined) => {
  const store = getSurveySessionStore(survey);
  const shownAt = useRef<number | undefined>(undefined);

  useEffect(() => {
    const isLoadedOnto = store.getState() === store.restoredSession;

    shownAt.current =
      questionId === undefined || isLoadedOnto ? undefined : performance.now();

    return () => {
      shownAt.current = undefined;
    };
  }, [store, questionId]);

  return useCallback(
    () =>
      shownAt.current === undefined
        ? undefined
        : (performance.now() - shownAt.current) / MS_PER_SECOND,
    [],
  );
};
