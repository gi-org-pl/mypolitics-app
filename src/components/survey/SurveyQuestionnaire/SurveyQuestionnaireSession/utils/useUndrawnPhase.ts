import { useEffect } from "react";

import type { SurveySessionApi } from "@/types/survey";

// A phase that has nothing to draw never holds the quiz: the session is moved
// on, as if the taker had passed the phase without giving anything. A card is
// closed, and the e-mail phase is left as skipped.
export const useUndrawnPhase = (
  { session, closeCheckpoint, leaveEmailCapture }: SurveySessionApi,
  isDrawn: boolean,
): void => {
  const { phase } = session;

  useEffect(() => {
    if (isDrawn) return;

    if (phase === "checkpoints") {
      closeCheckpoint();
    }

    if (phase === "email-capture") {
      leaveEmailCapture(false);
    }
  }, [isDrawn, phase, closeCheckpoint, leaveEmailCapture]);
};
