import { createResult } from "@/services/api/client/createResult";
import { CreateResultOutcome, type ResultInput } from "@/types/survey";

import { CREATE_RESULT_TIMEOUT_MS } from "../SurveyQuestionnaireResultsCalculation.constants";

// Step 1 of a run. A hand-in that got no answer - no connection, or no reply
// in time - is sent once more by itself; the second answer stands, whatever
// it is. A hand-in the API refused is not sent again: the same hand-in would
// be refused again. Nothing is sent once the run was left.
export const sendHandIn = async (
  input: ResultInput,
  signal: AbortSignal,
): Promise<CreateResultOutcome> => {
  const options = { signal, timeoutMs: CREATE_RESULT_TIMEOUT_MS };
  const outcome = await createResult(input, options);

  return outcome === CreateResultOutcome.Unreachable && !signal.aborted
    ? createResult(input, options)
    : outcome;
};
