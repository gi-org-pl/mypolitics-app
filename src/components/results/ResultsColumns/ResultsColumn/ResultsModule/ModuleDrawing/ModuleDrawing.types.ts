import type { ComponentType } from "react";
import type { ArchetypeProps } from "@/components/results/Archetype/Archetype.types";
import type { DoubleAxisChartProps } from "@/components/results/DoubleAxisChart/DoubleAxisChart.types";
import type { HorizontalBarChartProps } from "@/components/results/HorizontalBarChart/HorizontalBarChart.types";
import type { MultiAxisChartProps } from "@/components/results/MultiAxisChart/MultiAxisChart.types";
import type { NolanChartProps } from "@/components/results/NolanChart/NolanChart.types";
import type { SingleAxisChartProps } from "@/components/results/SingleAxisChart/SingleAxisChart.types";
import type { TraitsProps } from "@/components/results/Traits/Traits.types";
import type { Orientation } from "@/types/orientation";
import type { DrawnModuleType, ResolvedModule } from "@/types/results";

import type { ModulesComparison } from "../../../ResultsColumns.types";

export interface ModuleDrawingProps {
  module: ResolvedModule;
  comparison?: ModulesComparison; // the other side of a comparison, laid over the module
}

// A resolved module of one type.
export type ResolvedModuleOf<Type extends DrawnModuleType> = Extract<
  ResolvedModule,
  { type: Type }
>;

// What the component of each module type takes.
export interface ModulePropsByType {
  single_axis: SingleAxisChartProps;
  double_axis: DoubleAxisChartProps;
  multi_axis: MultiAxisChartProps;
  horizontal_bar: HorizontalBarChartProps;
  nolan_chart: NolanChartProps;
  archetype: ArchetypeProps;
  traits: TraitsProps;
}

export type ModuleProps = ModulePropsByType[DrawnModuleType];

// The two axes of the map: the slots of its pole names begin with these.
export type NolanAxisDirection = "horizontal" | "vertical";

// The texts of the app a module is given beside what its record holds.
export interface ModuleTexts {
  verifiedLabel: string; // the name of the badge of an official orientation
}

// What the component of a module type takes as the other side of a
// comparison.
export type ModuleComparisonOf<Type extends DrawnModuleType> =
  ModulePropsByType[Type]["comparison"];

// How a module type is drawn: its component, what makes the props of that
// component out of a resolved module, and what the component is handed for
// the other side of a comparison: made out of the same module resolved from
// the other result, and the orientation the other side is drawn as.
export interface ModuleDrawer<Type extends DrawnModuleType> {
  Component: ComponentType<ModulePropsByType[Type]>;
  toProps: (
    module: ResolvedModuleOf<Type>,
    texts: ModuleTexts,
  ) => ModulePropsByType[Type];
  toComparison: (
    other: ResolvedModuleOf<Type>,
    orientation: Orientation,
  ) => ModuleComparisonOf<Type>;
}

export type ModuleDrawers = {
  [Type in DrawnModuleType]: ModuleDrawer<Type>;
};

// The component of one module with the props it is given.
export interface ModuleView {
  Component: ComponentType<ModuleProps>;
  props: ModuleProps;
}

// The explanation of a module: what its info action opens.
export interface ModuleInfo {
  isOpen: boolean;
  open?: () => void; // absent = the module has no description, so no info action
  close: () => void;
}
