import { toTrimmedText } from "@/utils/text/toTrimmedText";

import type { ResultsScreenState } from "../ResultsScreen.types";

// The name of the quiz the result belongs to, once that quiz is read. Absent
// before that, and for a quiz with no name.
export const getQuizName = (state: ResultsScreenState): string | undefined =>
  "survey" in state ? toTrimmedText(state.survey.name) : undefined;
