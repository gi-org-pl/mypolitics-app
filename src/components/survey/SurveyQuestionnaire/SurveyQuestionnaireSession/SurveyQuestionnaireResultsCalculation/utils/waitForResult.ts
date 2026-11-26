import { RESULT_READ_INTERVAL_MS, RESULT_WAIT_MS } from "@/constants/survey";
import { getResult } from "@/services/api/client/getResult";
import { pollUntil } from "@/utils/function/pollUntil";
import { isResultCalculated } from "@/utils/survey/result/isResultCalculated";

// Step 3 of a run: the stored result is read at once, and again a moment
// after each read has answered, so two reads never overlap. A read that
// fails, or finds no result, counts as "not calculated yet". The wait ends
// with `true` when a read shows the result calculated, and with `false` when
// the time is up or the run was left: the read on its way is cancelled then,
// and no timer is left running.
export const waitForResult = async (
  resultId: string,
  signal: AbortSignal,
): Promise<boolean> => {
  const load = await pollUntil(
    (readSignal) => getResult(resultId, { signal: readSignal }),
    isResultCalculated,
    { intervalMs: RESULT_READ_INTERVAL_MS, limitMs: RESULT_WAIT_MS, signal },
  );

  return load !== undefined;
};
