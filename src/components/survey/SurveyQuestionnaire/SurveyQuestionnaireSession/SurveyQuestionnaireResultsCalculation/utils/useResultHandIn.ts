import { useEffect, useState } from "react";

import {
  CreateResultOutcome,
  type SurveyPhaseContentProps,
} from "@/types/survey";
import { buildResultInput } from "@/utils/survey/result/buildResultInput";

import { RESULT_STATES } from "../SurveyQuestionnaireResultsCalculation.constants";
import { HandInState } from "../SurveyQuestionnaireResultsCalculation.types";
import { sendHandIn } from "./sendHandIn";
import { waitForResult } from "./waitForResult";

interface ReachedState {
  run: number; // the run the state belongs to
  state: HandInState;
}

// Steps 1 and 3 of a run: the hand-in is sent when the run starts, and once
// the result is stored it is read until it is calculated. Every run sends the
// hand-in that was built when the phase opened - it is never changed to get
// it accepted, and a result that already exists counts as stored - so a
// retry and a refresh simply start from the hand-in again.
//
// The result state of the session follows the run; that is all the frame
// reads. A run that is left - the phase is over, or a retry replaced it - is
// cancelled: its requests are aborted, its timers cleared, its outcome
// ignored.
export const useResultHandIn = (
  {
    survey,
    session: { session, setResultState },
  }: Pick<SurveyPhaseContentProps, "survey" | "session">,
  run: number,
): HandInState => {
  const [input] = useState(() => buildResultInput(survey, session));
  const [reached, setReached] = useState<ReachedState>({
    run,
    state: HandInState.Sending,
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const reach = (state: HandInState) => {
      setReached({ run, state });
      setResultState(RESULT_STATES[state]);
    };

    const handIn = async () => {
      const outcome = await sendHandIn(input, signal);

      if (signal.aborted) return;

      if (outcome !== CreateResultOutcome.Stored) {
        reach(HandInState.NotSaved);

        return;
      }

      reach(HandInState.Created);

      const isCalculated = await waitForResult(input.sessionId, signal);

      if (!signal.aborted) {
        reach(isCalculated ? HandInState.Calculated : HandInState.NotReady);
      }
    };

    setResultState(RESULT_STATES[HandInState.Sending]);
    handIn();

    return () => controller.abort();
  }, [input, run, setResultState]);

  // A new run is sending from the render that starts it.
  return reached.run === run ? reached.state : HandInState.Sending;
};
