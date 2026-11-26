import type { DrawnModuleType, ResolvedModule } from "@/types/results";

import type { ModulesComparison } from "../../../../ResultsColumns.types";
import { MODULE_DRAWERS } from "../ModuleDrawing.constants";
import type {
  ModuleDrawer,
  ModuleProps,
  ModuleTexts,
  ModuleView,
} from "../ModuleDrawing.types";
import { findComparedModule } from "./comparison/findComparedModule";

// The component a resolved module is drawn by, and the props it is given:
// one lookup in the table by the type of the module.
//
// With a comparison the props carry the other side as well: what the row of
// the table makes out of the same module resolved from the other result.
// When the other result does not draw that module, it is drawn for one side
// alone.
export const getModuleView = (
  module: ResolvedModule,
  texts: ModuleTexts,
  comparison?: ModulesComparison,
): ModuleView => {
  // Each row of the table pairs a component with the mappers of its own
  // type. A lookup by the type of a module that can be of any type cannot
  // carry that pairing, so it is restated here, and again for the props.
  const { Component, toProps, toComparison } = MODULE_DRAWERS[
    module.type
  ] as ModuleDrawer<DrawnModuleType>;
  const other = comparison && findComparedModule(module, comparison.modules);
  const props = toProps(module, texts);

  return {
    Component,
    props: other
      ? ({
          ...props,
          comparison: toComparison(other, comparison.orientation),
        } as ModuleProps)
      : props,
  };
};
