import { HEADER_MODULE_TYPE } from "@/constants/results";
import type {
  ResolutionContext,
  ResolvedHeader,
  ResultModuleOf,
} from "@/types/results";
import { getRecordEntries } from "@/utils/result-modules/orientations/getRecordEntries";
import { getModuleValues } from "@/utils/result-modules/values/getModuleValues";

import { getTopEntry } from "./getTopEntry";

// What the header is given: of the header record's shown orientations the one
// with the highest value, that value as the confidence, the label of the
// link, and what the record says of a leader below a partial match: whether
// the header names it all the same, and what it says under it then. When none
// of them has a value the header has no orientation, and shows no match. A
// quiz with no header record has no header.
export const resolveHeader = (
  context: Pick<ResolutionContext, "survey" | "result" | "gender">,
): ResolvedHeader | undefined => {
  const record = context.survey.resultModules.find(
    (module): module is ResultModuleOf<typeof HEADER_MODULE_TYPE> =>
      module.type === HEADER_MODULE_TYPE,
  );

  if (!record) return undefined;

  const top = getTopEntry(getRecordEntries(record, context));
  const values = getModuleValues(record);

  return {
    orientation: top?.orientation,
    confidence: top?.value,
    linkLabel: values["label.link"],
    lowMatch: values.lowMatch,
    lowMatchLabel: values["label.lowMatch"],
  };
};
