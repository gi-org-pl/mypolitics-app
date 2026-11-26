import type { ResolvedModule, ResultModuleColumn } from "@/types/results";

import type { ResultsColumnsProps } from "../ResultsColumns.types";

export interface ResultsColumnProps extends ResultsColumnsProps {
  column: ResultModuleColumn; // the column whose modules are drawn
}

// A module and its place in the order of the whole list.
export interface ModuleSlot {
  module: ResolvedModule;
  order: number;
}
