import { Archetype } from "@/components/results/Archetype/Archetype";
import { DoubleAxisChart } from "@/components/results/DoubleAxisChart/DoubleAxisChart";
import { HorizontalBarChart } from "@/components/results/HorizontalBarChart/HorizontalBarChart";
import { MultiAxisChart } from "@/components/results/MultiAxisChart/MultiAxisChart";
import { NolanChart } from "@/components/results/NolanChart/NolanChart";
import { SingleAxisChart } from "@/components/results/SingleAxisChart/SingleAxisChart";
import { Traits } from "@/components/results/Traits/Traits";

import type { ModuleDrawers } from "./ModuleDrawing.types";
import { toArchetypeComparison } from "./utils/comparison/toArchetypeComparison";
import { toDoubleAxisComparison } from "./utils/comparison/toDoubleAxisComparison";
import { toHorizontalBarComparison } from "./utils/comparison/toHorizontalBarComparison";
import { toMultiAxisComparison } from "./utils/comparison/toMultiAxisComparison";
import { toNolanComparison } from "./utils/comparison/toNolanComparison";
import { toSingleAxisComparison } from "./utils/comparison/toSingleAxisComparison";
import { toTraitsComparison } from "./utils/comparison/toTraitsComparison";
import { toArchetypeProps } from "./utils/props/toArchetypeProps";
import { toDoubleAxisProps } from "./utils/props/toDoubleAxisProps";
import { toHorizontalBarProps } from "./utils/props/toHorizontalBarProps";
import { toMultiAxisProps } from "./utils/props/toMultiAxisProps";
import { toNolanChartProps } from "./utils/props/toNolanChartProps";
import { toSingleAxisProps } from "./utils/props/toSingleAxisProps";
import { toTraitsProps } from "./utils/props/toTraitsProps";

// Which component draws which module type, what turns a resolved module of
// that type into the props of the component, and what the component is
// handed for the other side of a comparison. A new module type is one more
// row here.
//
//   type            handed for the other side
//   single_axis     their value of the same orientation
//   double_axis     their start-side value of the same axis
//   multi_axis      their start-side value of every axis, by axis
//   horizontal_bar  their value of every orientation, by orientation; in a
//                   list by category, their value inside each category
//   nolan_chart     their four side values
//   archetype       their value of every archetype
//   traits          the traits they earned
export const MODULE_DRAWERS: ModuleDrawers = {
  single_axis: {
    Component: SingleAxisChart,
    toProps: toSingleAxisProps,
    toComparison: toSingleAxisComparison,
  },
  double_axis: {
    Component: DoubleAxisChart,
    toProps: toDoubleAxisProps,
    toComparison: toDoubleAxisComparison,
  },
  multi_axis: {
    Component: MultiAxisChart,
    toProps: toMultiAxisProps,
    toComparison: toMultiAxisComparison,
  },
  horizontal_bar: {
    Component: HorizontalBarChart,
    toProps: toHorizontalBarProps,
    toComparison: toHorizontalBarComparison,
  },
  nolan_chart: {
    Component: NolanChart,
    toProps: toNolanChartProps,
    toComparison: toNolanComparison,
  },
  archetype: {
    Component: Archetype,
    toProps: toArchetypeProps,
    toComparison: toArchetypeComparison,
  },
  traits: {
    Component: Traits,
    toProps: toTraitsProps,
    toComparison: toTraitsComparison,
  },
};
