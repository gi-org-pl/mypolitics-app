import { Archetype } from "@/components/results/Archetype/Archetype";
import { DoubleAxisChart } from "@/components/results/DoubleAxisChart/DoubleAxisChart";
import { HorizontalBarChart } from "@/components/results/HorizontalBarChart/HorizontalBarChart";
import { MultiAxisChart } from "@/components/results/MultiAxisChart/MultiAxisChart";
import { NolanChart } from "@/components/results/NolanChart/NolanChart";
import { SingleAxisChart } from "@/components/results/SingleAxisChart/SingleAxisChart";
import { Traits } from "@/components/results/Traits/Traits";

import type { ModuleDrawers } from "./ModuleDrawing.types";
import { toArchetypeProps } from "./utils/toArchetypeProps";
import { toDoubleAxisProps } from "./utils/toDoubleAxisProps";
import { toHorizontalBarProps } from "./utils/toHorizontalBarProps";
import { toMultiAxisProps } from "./utils/toMultiAxisProps";
import { toNolanChartProps } from "./utils/toNolanChartProps";
import { toSingleAxisProps } from "./utils/toSingleAxisProps";
import { toTraitsProps } from "./utils/toTraitsProps";

// Which component draws which module type, and what turns a resolved module
// of that type into the props of the component. A new module type is one
// more row here.
export const MODULE_DRAWERS: ModuleDrawers = {
  single_axis: { Component: SingleAxisChart, toProps: toSingleAxisProps },
  double_axis: { Component: DoubleAxisChart, toProps: toDoubleAxisProps },
  multi_axis: { Component: MultiAxisChart, toProps: toMultiAxisProps },
  horizontal_bar: {
    Component: HorizontalBarChart,
    toProps: toHorizontalBarProps,
  },
  nolan_chart: { Component: NolanChart, toProps: toNolanChartProps },
  archetype: { Component: Archetype, toProps: toArchetypeProps },
  traits: { Component: Traits, toProps: toTraitsProps },
};
