import { getResult } from "@/services/api/client/getResult";

import {
  RESULT_READ_INTERVAL_MS,
  RESULT_WAIT_MS,
} from "../SurveyQuestionnaireResultsCalculation.constants";

// Step 3 of a run: the stored result is read at once, and again a moment
// after each read has answered, so two reads never overlap. A read that
// fails, or finds no result, counts as "not calculated yet". The wait ends
// with `true` when a read shows the result calculated, and with `false` when
// the time is up or the run was left: the read on its way is cancelled then,
// and no timer is left running.
export const waitForResult = (
  resultId: string,
  signal: AbortSignal,
): Promise<boolean> =>
  new Promise((resolve) => {
    const reads = new AbortController();
    let readTimer: ReturnType<typeof setTimeout> | undefined;

    const end = (isCalculated: boolean) => {
      clearTimeout(readTimer);
      clearTimeout(waitTimer);
      signal.removeEventListener("abort", giveUp);
      reads.abort();
      resolve(isCalculated);
    };

    const giveUp = () => end(false);

    const read = async () => {
      const { isCalculated } = await getResult(resultId, {
        signal: reads.signal,
      });

      if (reads.signal.aborted) return;

      if (isCalculated) {
        end(true);
      } else {
        readTimer = setTimeout(read, RESULT_READ_INTERVAL_MS);
      }
    };

    const waitTimer = setTimeout(giveUp, RESULT_WAIT_MS);

    signal.addEventListener("abort", giveUp);

    if (signal.aborted) {
      giveUp();
    } else {
      read();
    }
  });
