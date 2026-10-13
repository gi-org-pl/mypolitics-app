import type { ModuleResolver } from "@/types/results";
import { getRankedCategories } from "@/utils/result-modules/orientations/getRankedCategories";
import { getRankedEntries } from "@/utils/result-modules/orientations/getRankedEntries";
import { getSelectedOrientations } from "@/utils/result-modules/orientations/getSelectedOrientations";
import { getModuleParams } from "@/utils/result-modules/params/getModuleParams";

// A horizontal bar ranks the orientations its record selects: as one list
// with their values in the result, or as one list per category with their
// values inside it. It is not drawn when the selection leaves nothing, or
// when it groups by category and the quiz has no category to show.
export const resolveHorizontalBar: ModuleResolver<"horizontal_bar"> = (
  record,
  context,
) => {
  const { selection, groupBy, visibleRows } = getModuleParams(record);
  const orientations = getSelectedOrientations(
    { orientationIds: record.orientationIds, selection },
    context,
  );

  if (orientations.length === 0) return undefined;

  if (groupBy === "none") {
    const entries = getRankedEntries(orientations, context.result.scores);

    return { type: "horizontal_bar", entries, visibleRows };
  }

  const categories = getRankedCategories(orientations, context);

  return categories.length > 0
    ? { type: "horizontal_bar", categories, visibleRows }
    : undefined;
};
