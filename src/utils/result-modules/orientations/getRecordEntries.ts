import type {
  ResolutionContext,
  ResultEntry,
  ResultModule,
} from "@/types/results";
import { toResultEntry } from "@/utils/results/toResultEntry";

import { getShownOrientations } from "./getShownOrientations";

// The shown orientations of a record, in the author's order, each with its
// value in the result.
export const getRecordEntries = (
  record: Pick<ResultModule, "orientationIds">,
  context: Pick<ResolutionContext, "survey" | "result" | "gender">,
): ResultEntry[] =>
  getShownOrientations(record.orientationIds, context).map((orientation) =>
    toResultEntry(orientation, context.result.scores),
  );
