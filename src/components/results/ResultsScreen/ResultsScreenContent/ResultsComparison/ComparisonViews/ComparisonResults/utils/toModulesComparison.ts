import type { ModulesComparison } from "@/components/results/ResultsColumns/ResultsColumns.types";

import type { ComparingState } from "../../../ResultsComparison.types";

// What is laid over the modules of the taker: the other side, and their
// result as it was resolved. An other side with no result - an orientation -
// lays nothing over them.
export const toModulesComparison = ({
  other,
  modules,
}: Pick<ComparingState, "other" | "modules">): ModulesComparison | undefined =>
  modules && { orientation: other.orientation, modules };
