import { useCallback, useEffect, useState } from "react";

import { createResult } from "@/services/api/client/createResult";
import type { SurveyPhaseContentProps } from "@/types/survey";
import { buildResultInput } from "@/utils/survey/buildResultInput";

import type { HandIn } from "../../../SurveyQuestionnaire.types";

// The hand-in of the stand-in phase. The session is handed in at once when
// the phase opens, and again at every retry: always the hand-in that was built
// when the phase opened, so repeating it is safe. A stored result ends the
// phase by leaving; anything else is a failure the taker can retry. A request
// that is left - the phase is over, or a retry replaced it - is cancelled and
// its outcome ignored.
export const useHandIn = ({
  survey,
  session: { session, setResultState },
  onLeave,
}: Pick<SurveyPhaseContentProps, "survey" | "session" | "onLeave">): HandIn => {
  const [input] = useState(() => buildResultInput(survey, session));
  const [attempt, setAttempt] = useState(0);
  const hasFailed = session.resultState === "failed";

  // Every attempt is one request, also when it sends what the one before sent.
  useEffect(() => {
    const controller = new AbortController();

    setResultState("sending");
    createResult(input, { signal: controller.signal }).then((outcome) => {
      if (controller.signal.aborted) return;

      if (outcome === "stored") {
        setResultState("created");
        onLeave();
      } else {
        setResultState("failed");
      }
    });

    return () => controller.abort();
  }, [input, attempt, setResultState, onLeave]);

  // A retry is for a hand-in that failed: a second press finds one under way.
  const retry = useCallback(() => {
    if (hasFailed) {
      setAttempt((count) => count + 1);
    }
  }, [hasFailed]);

  return { hasFailed, retry };
};
