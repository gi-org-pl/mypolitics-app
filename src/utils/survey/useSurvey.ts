import { useLingui } from "@lingui/react";
import { useCallback, useEffect, useState } from "react";

import { getLatestSurvey } from "@/services/api/client/getLatestSurvey";
import {
  type SurveyLoadResult,
  type SurveyLoadState,
  SurveyLoadStatus,
} from "@/types/survey";

interface SurveyRead {
  key: string; // which reading the result belongs to
  result: SurveyLoadResult;
}

const LOADING: SurveyLoadState = { status: SurveyLoadStatus.Loading };
const NOT_FOUND: SurveyLoadState = { status: SurveyLoadStatus.NotFound };

// The quiz of a project - its latest survey - read once per visit, language
// and retry. Nothing is kept between visits. A result is shown only for the
// reading it belongs to, so a change of the language or a retry is loading
// from the same render on. A reading that is left is cancelled and its result
// ignored. With no project identifier there is nothing to read.
export const useSurvey = (
  projectId?: string,
): { load: SurveyLoadState; retry: () => void } => {
  const { i18n } = useLingui();
  const language = i18n.locale;
  const [attempt, setAttempt] = useState(0);
  const [read, setRead] = useState<SurveyRead>();
  const key = JSON.stringify([projectId, language, attempt]);

  useEffect(() => {
    if (projectId === undefined) return;

    const controller = new AbortController();

    getLatestSurvey(projectId, language, { signal: controller.signal }).then(
      (result) => {
        if (!controller.signal.aborted) {
          setRead({ key, result });
        }
      },
    );

    return () => controller.abort();
  }, [projectId, language, key]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  if (projectId === undefined) {
    return { load: NOT_FOUND, retry };
  }

  return { load: read?.key === key ? read.result : LOADING, retry };
};
