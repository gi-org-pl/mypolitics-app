import { useLingui } from "@lingui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SurveyResultsCalculationProps } from "@/components/survey/SurveyResultsCalculation/SurveyResultsCalculation.types";
import type { SurveyPhaseContentProps } from "@/types/survey";
import { isOneOf } from "@/utils/array/isOneOf";

import {
  FAILED_HAND_IN_STATES,
  RESULTS_CALCULATION_POOL,
} from "../SurveyQuestionnaireResultsCalculation.constants";
import { getLoaderCardState } from "./getLoaderCardState";
import { getLoaderLines } from "./getLoaderLines";
import { isReadyToLeave } from "./isReadyToLeave";
import { useLoaderLines } from "./useLoaderLines";
import { useResultHandIn } from "./useResultHandIn";
import { useResultLink } from "./useResultLink";

// The runs of the phase. A run starts when the phase appears, and a new one
// at every retry of a run that failed: its lines, its hand-in and the wait
// for its result start over, while the link request - made once per session -
// keeps what it ended with.
//
// A run that is ready leaves through `onLeave`, once; when the link could not
// be sent, the notice stands in for leaving and "Zobacz wyniki" leaves. The
// session is never cleared and nothing is opened here: that is `onLeave`'s.
export const useResultsCalculation = ({
  survey,
  session,
  onLeave,
}: SurveyPhaseContentProps): SurveyResultsCalculationProps => {
  const { i18n } = useLingui();
  const { locale } = i18n;
  const sessionId = session.session.id;
  const [run, setRun] = useState(0);
  const hasLeft = useRef(false);

  // `i18n` stays the same object when the language changes, so the language
  // itself is what the order depends on.
  const order = useMemo(
    () =>
      getLoaderLines(
        RESULTS_CALCULATION_POOL.map((line) => i18n._(line)),
        sessionId,
      ),
    [i18n, locale, sessionId],
  );
  const handIn = useResultHandIn({ survey, session }, run);
  const link = useResultLink(session, handIn);
  const { lines, hasStayedLongEnough } = useLoaderLines(order, run);
  const isReady = isReadyToLeave({ handIn, link, hasStayedLongEnough });
  const state = getLoaderCardState({ handIn, link, isReadyToLeave: isReady });
  const hasFailed = isOneOf(FAILED_HAND_IN_STATES, handIn);

  const leave = useCallback(() => {
    if (hasLeft.current) return;

    hasLeft.current = true;
    onLeave();
  }, [onLeave]);

  useEffect(() => {
    if (isReady && state === "running") {
      leave();
    }
  }, [isReady, state, leave]);

  // A retry is for a run that failed: a second press finds a run under way.
  const retry = useCallback(() => {
    if (hasFailed) {
      setRun((count) => count + 1);
    }
  }, [hasFailed]);

  return { state, lines, onRetry: retry, onSeeResults: leave };
};
