import { useLingui } from "@lingui/react";
import { useCallback, useEffect, useState } from "react";

import { getSurvey } from "@/services/api/client/getSurvey";
import type { SurveyLoadResult, SurveyLoadState } from "@/types/survey";

interface SurveyRead {
  key: string; // which reading the result belongs to
  result: SurveyLoadResult;
}

const LOADING: SurveyLoadState = { status: "loading" };
const NOT_FOUND: SurveyLoadState = { status: "not-found" };

// The quiz of an identifier, read once per visit, language and retry. Nothing
// is kept between visits. A result is shown only for the reading it belongs
// to, so a change of the language or a retry is loading from the same render
// on. A reading that is left is cancelled and its result ignored. With no
// identifier there is nothing to read.
export const useSurvey = (
  surveyId?: string,
): { load: SurveyLoadState; retry: () => void } => {
  const { i18n } = useLingui();
  const language = i18n.locale;
  const [attempt, setAttempt] = useState(0);
  const [read, setRead] = useState<SurveyRead>();
  const key = JSON.stringify([surveyId, language, attempt]);

  useEffect(() => {
    if (surveyId === undefined) return;

    const controller = new AbortController();

    getSurvey(surveyId, language, { signal: controller.signal }).then(
      (result) => {
        if (!controller.signal.aborted) {
          setRead({ key, result });
        }
      },
    );

    return () => controller.abort();
  }, [surveyId, language, key]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  if (surveyId === undefined) {
    return { load: NOT_FOUND, retry };
  }

  return { load: read?.key === key ? read.result : LOADING, retry };
};
