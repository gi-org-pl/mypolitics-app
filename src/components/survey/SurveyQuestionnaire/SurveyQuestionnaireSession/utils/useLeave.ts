import { useCallback, useEffect, useRef } from "react";

import type { SurveySessionApi } from "@/types/survey";
import { getResultsUrl } from "@/utils/survey/getResultsUrl";
import { openAddress } from "@/utils/url/openAddress";

// `onLeave` of the screen: the stored session is removed, then the results of
// that session open in the same tab. Called again, it does nothing - there is
// one navigation. The session in memory is not touched, so the screen keeps
// showing what it showed until the browser has left.
//
// A browser can show the page again from its memory when the taker comes
// back. The session that was handed in is then over: a new one starts.
export const useLeave = ({
  session,
  leave,
  startOver,
}: SurveySessionApi): (() => void) => {
  const hasLeft = useRef(false);
  const sessionId = session.id;

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && hasLeft.current) {
        hasLeft.current = false;
        startOver();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [startOver]);

  return useCallback(() => {
    if (hasLeft.current) return;

    hasLeft.current = true;
    leave();
    openAddress(getResultsUrl(sessionId));
  }, [leave, sessionId]);
};
