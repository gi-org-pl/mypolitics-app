import { SurveyResultsCalculation } from "@/components/survey/SurveyResultsCalculation/SurveyResultsCalculation";
import type { SurveyPhaseContentProps } from "@/types/survey";

import { useResultsCalculation } from "./utils/useResultsCalculation";

// The sixth phase: the loader. While the lines arrive one by one, the session
// is handed in, the link to the result is asked for if the taker gave an
// address, and the result is waited for; then the taker leaves for the
// results. The card only draws - everything that waits is in the hooks.
export const SurveyQuestionnaireResultsCalculation = (
  props: SurveyPhaseContentProps,
) => <SurveyResultsCalculation {...useResultsCalculation(props)} />;
