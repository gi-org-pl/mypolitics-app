import { useEffect, useState } from "react";

import {
  LINE_INTERVAL_MS,
  MAX_LINES,
  MIN_LINES,
} from "../SurveyQuestionnaireResultsCalculation.constants";
import type { LoaderLines } from "../SurveyQuestionnaireResultsCalculation.types";

// The last moment the clock of a run is needed for: the last line has
// arrived, and the minimum stay is over.
const LAST_TICK = Math.max(MIN_LINES, MAX_LINES - 1);

interface RunClock {
  run: number; // the run the count belongs to
  ticks: number; // how many lines have had their time
}

// The lines a run shows, and whether it has stayed long enough. The first
// line of the order is there at once; every `LINE_INTERVAL_MS` the next one
// arrives, up to `MAX_LINES`, and no line is taken twice. A new run starts
// from the first line again.
//
// The stay is counted in the time of `MIN_LINES` lines, however many lines
// the order has. Only the first run of the phase owes it: a run that follows
// a failure has stayed long enough from its start.
export const useLoaderLines = (
  order: readonly string[],
  run: number,
): LoaderLines => {
  const [clock, setClock] = useState<RunClock>({ run, ticks: 0 });
  const ticks = clock.run === run ? clock.ticks : 0;

  useEffect(() => {
    if (ticks >= LAST_TICK) return;

    const timer = setTimeout(
      () => setClock({ run, ticks: ticks + 1 }),
      LINE_INTERVAL_MS,
    );

    return () => clearTimeout(timer);
  }, [run, ticks]);

  return {
    lines: order.slice(0, Math.min(ticks + 1, MAX_LINES)),
    hasStayedLongEnough: run > 0 || ticks >= MIN_LINES,
  };
};
