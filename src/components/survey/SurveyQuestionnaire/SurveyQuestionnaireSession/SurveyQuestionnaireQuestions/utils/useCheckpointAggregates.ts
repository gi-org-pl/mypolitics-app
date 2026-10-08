import { useCallback, useEffect, useRef } from "react";

import type { CheckpointAggregates } from "@/types/checkpoint";
import { loadCheckpointAggregates } from "@/utils/survey/loadCheckpointAggregates";

// The answer counts of the quiz, for the stats chart card. The load is
// started when the questions are first drawn; drawn again - after a card,
// after a step back, after a reset - they get the counts already loaded, with
// no second request.
//
// The returned function gives the counts if they have arrived, and nothing
// until then. They are kept in a ref, so their arrival draws nothing again:
// nothing on screen depends on them, and a question never waits for them.
// Counts that arrive after the questions have left the screen are ignored.
export const useCheckpointAggregates = (
  surveyId: string,
): (() => CheckpointAggregates | undefined) => {
  const aggregates = useRef<CheckpointAggregates | undefined>(undefined);

  useEffect(() => {
    let isOnScreen = true;

    void loadCheckpointAggregates(surveyId).then((counts) => {
      if (isOnScreen) {
        aggregates.current = counts;
      }
    });

    return () => {
      isOnScreen = false;
      aggregates.current = undefined;
    };
  }, [surveyId]);

  return useCallback(() => aggregates.current, []);
};
