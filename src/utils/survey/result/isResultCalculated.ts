import { type ResultLoadResult, ResultLoadStatus } from "@/types/survey";

// Whether a read found the result, and found it calculated. A read that
// failed, or found no result, says no.
export const isResultCalculated = (load: ResultLoadResult): boolean =>
  load.status === ResultLoadStatus.Ready && load.result.isCalculated;
