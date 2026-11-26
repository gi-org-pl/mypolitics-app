import { useCallback, useEffect, useRef } from "react";

import type { SurveySessionApi } from "@/types/survey";

// `onLeave` of the screen: the stored session is removed, then the result of
// that session is opened - its identifier is the identifier of the session.
// Called again, it does nothing: the result is opened once. The session in
// memory is not touched, so the screen keeps showing what it showed for as
// long as it is there.
//
// The session that was handed in is over once the screen is gone: a taker who
// comes back to the quiz finds a new one, and nothing of it is stored until
// they do something.
export const useLeave = (
  { session, leave, startOver }: SurveySessionApi,
  onResultOpen: (resultId: string) => void,
): (() => void) => {
  const hasLeft = useRef(false);
  const sessionId = session.id;

  useEffect(
    () => () => {
      if (!hasLeft.current) return;

      hasLeft.current = false;
      startOver();
      leave();
    },
    [leave, startOver],
  );

  return useCallback(() => {
    if (hasLeft.current) return;

    hasLeft.current = true;
    leave();
    onResultOpen(sessionId);
  }, [leave, onResultOpen, sessionId]);
};
