import { seededShuffle } from "@/utils/checkpoint/seededShuffle";

import { RESULTS_CALCULATION_DRAW } from "../SurveyQuestionnaireResultsCalculation.constants";

// The order of a session: the pool, already in the language of the app,
// shuffled by the seed of the session - the same every time it is worked out
// for that session, in any language. A line that is empty or only space is
// left out afterwards, so it never moves the others.
export const getLoaderLines = (
  pool: readonly string[],
  seed: string,
): string[] =>
  seededShuffle(pool, seed, RESULTS_CALCULATION_DRAW).filter(
    (line) => line.trim() !== "",
  );
