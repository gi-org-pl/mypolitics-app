import { getAnswerCounts } from "@/services/api/client/getAnswerCounts";
import type { CheckpointAggregates } from "@/types/checkpoint";

const loads = new Map<string, Promise<CheckpointAggregates | undefined>>();

// The answer counts of one quiz for this page load: the first call asks the
// source, and every later call gets the same answer - the same counts, or the
// same nothing after a failure. Nobody asks twice and nobody tries again.
//
// The counts live here, in the memory of the page, and nowhere else: they are
// not written to the session or to storage, and they are not sent anywhere.
export const loadCheckpointAggregates = (
  surveyId: string,
): Promise<CheckpointAggregates | undefined> => {
  const knownLoad = loads.get(surveyId);

  if (knownLoad) return knownLoad;

  const load = getAnswerCounts(surveyId).catch(() => undefined);

  loads.set(surveyId, load);

  return load;
};
