import { RESULT_READ_INTERVAL_MS, RESULT_WAIT_MS } from "@/constants/survey";
import { getResult } from "@/services/api/client/getResult";
import type { ResultLoadResult } from "@/types/survey";
import { pollUntil } from "@/utils/function/pollUntil";

import { isResultSettled } from "./isResultSettled";

// The result, read until it is calculated: a result that exists and is not
// calculated yet is asked for again every second, for up to 30 seconds. A
// read that finds no result, or fails, ends the wait at once. It answers
// with nothing when the result was not calculated in time, or the wait was
// left.
export const readCalculatedResult = (
  resultId: string,
  signal: AbortSignal,
): Promise<ResultLoadResult | undefined> =>
  pollUntil(
    (readSignal) => getResult(resultId, { signal: readSignal }),
    isResultSettled,
    { intervalMs: RESULT_READ_INTERVAL_MS, limitMs: RESULT_WAIT_MS, signal },
  );
