import { useLingui } from "@lingui/react";
import { useCallback, useEffect, useState } from "react";

import { LOADING_STATE } from "../ResultsScreen.constants";
import type { ResultsScreenState } from "../ResultsScreen.types";
import { loadResultsScreen } from "./loadResultsScreen";

interface ReachedState {
  key: string; // which loading the state belongs to
  state: ResultsScreenState;
}

// The state of the screen for one result: loaded once per result, language
// and retry, and never kept beyond the open page. A state is shown only for
// the loading it belongs to, so another result, a change of the language or a
// retry is loading from the same render on. A loading that is left is
// cancelled and its outcome ignored.
export const useResultsScreenState = (
  resultId: string,
): { state: ResultsScreenState; retry: () => void } => {
  const { i18n } = useLingui();
  const language = i18n.locale;
  const [attempt, setAttempt] = useState(0);
  const [reached, setReached] = useState<ReachedState>();
  const key = JSON.stringify([resultId, language, attempt]);

  useEffect(() => {
    const controller = new AbortController();

    loadResultsScreen(resultId, language, controller.signal).then((state) => {
      if (!controller.signal.aborted) {
        setReached({ key, state });
      }
    });

    return () => controller.abort();
  }, [resultId, language, key]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return {
    state: reached?.key === key ? reached.state : LOADING_STATE,
    retry,
  };
};
