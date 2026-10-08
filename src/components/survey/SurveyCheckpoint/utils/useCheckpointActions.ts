import { useCallback, useEffect, useRef } from "react";

import type {
  CheckpointActions,
  SurveyCheckpointProps,
} from "../SurveyCheckpoint.types";

interface CheckpointActionsInput
  extends Pick<SurveyCheckpointProps, "onContinue" | "onOptOut"> {
  canDraw: boolean; // whether the card has a visual and a statement
}

// The two requests of a card. A card asks once: the first request goes
// through, and every later one - the same button again, or the other one - is
// ignored. A card that cannot be drawn leaves by itself, by asking to
// continue, and that is its one request too.
export const useCheckpointActions = ({
  canDraw,
  onContinue,
  onOptOut,
}: CheckpointActionsInput): CheckpointActions => {
  const hasRequested = useRef(false);
  const requestOnce = useCallback((request: () => void) => {
    if (hasRequested.current) return;

    hasRequested.current = true;
    request();
  }, []);

  useEffect(() => {
    if (!canDraw) {
      requestOnce(onContinue);
    }
  }, [canDraw, onContinue, requestOnce]);

  return {
    requestContinue: () => requestOnce(onContinue),
    requestOptOut: () => requestOnce(onOptOut),
  };
};
