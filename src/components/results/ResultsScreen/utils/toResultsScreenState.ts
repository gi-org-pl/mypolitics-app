import type { Survey, SurveyResult } from "@/types/survey";
import { resolveResult } from "@/utils/result-modules/resolveResult";

import {
  type ResultsScreenState,
  ResultsScreenStatus,
} from "../ResultsScreen.types";

// What the screen is in once the result and its quiz are read: ready when the
// header or at least one module can be drawn, and not configured when the
// quiz gives nothing to draw - it has no result modules, or none of them can
// be drawn for this result.
//
// The declared gender is not in a result, so every orientation is resolved in
// its default form.
export const toResultsScreenState = (
  survey: Survey,
  result: SurveyResult,
): ResultsScreenState => {
  const resolved = resolveResult(survey, result);
  const hasContent =
    resolved.header !== undefined || resolved.modules.length > 0;

  return hasContent
    ? { status: ResultsScreenStatus.Ready, survey, result, resolved }
    : { status: ResultsScreenStatus.NotConfigured, survey };
};
