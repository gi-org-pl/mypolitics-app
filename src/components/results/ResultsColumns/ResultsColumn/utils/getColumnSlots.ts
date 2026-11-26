import type { ResolvedModule, ResultModuleColumn } from "@/types/results";

import type { ModuleSlot } from "../ResultsColumn.types";

// The modules that stand in one column, each with its place in the order of
// the whole list: the order they keep inside the column, and the order they
// take among the modules of both columns on a narrow screen.
export const getColumnSlots = (
  modules: ResolvedModule[],
  column: ResultModuleColumn,
): ModuleSlot[] =>
  modules
    .map((module, order) => ({ module, order }))
    .filter(({ module }) => module.column === column);
