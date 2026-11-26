import { HEADER_LINK_SLOT, HEADER_MODULE_TYPE } from "@/constants/results";
import type { ResolutionContext, ResolvedHeader } from "@/types/results";
import { getRecordEntries } from "@/utils/result-modules/orientations/getRecordEntries";

import { getTopEntry } from "./getTopEntry";

// What the header is given: of the header record's shown orientations the one
// with the highest value, that value as the confidence, and the label of the
// link. When none of them has a value the header has no orientation, and
// shows no match. A quiz with no header record has no header.
export const resolveHeader = (
  context: Pick<ResolutionContext, "survey" | "result" | "gender">,
): ResolvedHeader | undefined => {
  const record = context.survey.resultModules.find(
    ({ type }) => type === HEADER_MODULE_TYPE,
  );

  if (!record) return undefined;

  const top = getTopEntry(getRecordEntries(record, context));

  return {
    orientation: top?.orientation,
    confidence: top?.value,
    linkLabel: record.labels[HEADER_LINK_SLOT],
  };
};
