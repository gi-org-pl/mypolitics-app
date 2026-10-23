import type { DrawnModuleType, ResolvedModule } from "@/types/results";

import { MODULE_DRAWERS } from "../ModuleDrawing.constants";
import type {
  ModuleDrawer,
  ModuleTexts,
  ModuleView,
} from "../ModuleDrawing.types";

// The component a resolved module is drawn by, and the props it is given:
// one lookup in the table by the type of the module.
export const getModuleView = (
  module: ResolvedModule,
  texts: ModuleTexts,
): ModuleView => {
  // Each row of the table pairs a component with the mapper of its own type.
  // A lookup by the type of a module that can be of any type cannot carry
  // that pairing, so it is restated here.
  const { Component, toProps } = MODULE_DRAWERS[
    module.type
  ] as ModuleDrawer<DrawnModuleType>;

  return { Component, props: toProps(module, texts) };
};
