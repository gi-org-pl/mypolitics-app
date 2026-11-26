import type { ResultsColumnsProps } from "../../ResultsColumns.types";
import type { ModuleSlot } from "../ResultsColumn.types";

export interface ResultsModuleProps
  extends ModuleSlot,
    Pick<ResultsColumnsProps, "comparison"> {}
