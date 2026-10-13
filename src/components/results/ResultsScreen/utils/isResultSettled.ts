import { type ResultLoadResult, ResultLoadStatus } from "@/types/survey";

// Whether a read of the result needs no further read: the result is
// calculated, the API has no such result, or the read failed. Only a result
// that exists and is not calculated yet is asked for again.
export const isResultSettled = (load: ResultLoadResult): boolean =>
  load.status !== ResultLoadStatus.Ready || load.result.isCalculated;
