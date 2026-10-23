import type { Orientation } from "@/types/orientation";
import { friendModules } from "@/utils/result-modules/resolvedModules.fixtures";

import type { ModulesComparison } from "./ResultsColumns.types";

// A made-up friend, as the other side of a comparison is drawn.
export const FRIEND: Orientation = {
  id: "5218cde2-beac-4234-a0a7-c72f46e979a8",
  type: "person",
  name: "Znajomy",
};

// The friend laid over the modules of the fixture quiz.
export const MODULES_COMPARISON: ModulesComparison = {
  orientation: FRIEND,
  modules: friendModules,
};
