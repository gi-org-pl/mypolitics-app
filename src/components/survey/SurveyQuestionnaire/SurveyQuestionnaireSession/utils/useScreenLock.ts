import { useCallback, useEffect, useState } from "react";

import type { ScreenLock } from "../../SurveyQuestionnaire.types";
import {
  CONTENT_CHANGE_MS,
  SCREEN_LOCK_LIMIT_MS,
} from "../SurveyQuestionnaireSession.constants";

interface LockState {
  contentKey: string; // the content the state belongs to
  reason?: "press" | "change"; // absent: the screen is open
}

// One lock for "ignored while an answer is acknowledged", "no press while the
// screen changes" and "two presses, one action". It starts at `lock()` and at
// every change of the content - in the very render that shows the new content
// - and is released when the new content is there: when its movement is over.
// A lock that no change answers releases itself after a time limit, so it can
// never leave the screen dead.
export const useScreenLock = (contentKey: string): ScreenLock => {
  const [state, setState] = useState<LockState>({ contentKey });

  if (state.contentKey !== contentKey) {
    setState({ contentKey, reason: "change" });
  }

  useEffect(() => {
    if (state.reason === undefined) return;

    const timeout = setTimeout(
      () => setState({ contentKey: state.contentKey }),
      state.reason === "change" ? CONTENT_CHANGE_MS : SCREEN_LOCK_LIMIT_MS,
    );

    return () => clearTimeout(timeout);
  }, [state]);

  // A press during a lock starts nothing new: the first lock stands.
  const lock = useCallback(
    () =>
      setState((current) =>
        current.reason === undefined
          ? { contentKey: current.contentKey, reason: "press" }
          : current,
      ),
    [],
  );

  return {
    isLocked: state.reason !== undefined || state.contentKey !== contentKey,
    lock,
  };
};
