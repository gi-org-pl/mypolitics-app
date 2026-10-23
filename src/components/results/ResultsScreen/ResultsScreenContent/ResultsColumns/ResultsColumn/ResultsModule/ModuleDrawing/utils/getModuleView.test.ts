import { describe, expect, it } from "vitest";

import { Archetype } from "@/components/results/Archetype/Archetype";
import { DoubleAxisChart } from "@/components/results/DoubleAxisChart/DoubleAxisChart";
import { HorizontalBarChart } from "@/components/results/HorizontalBarChart/HorizontalBarChart";
import { MultiAxisChart } from "@/components/results/MultiAxisChart/MultiAxisChart";
import { NolanChart } from "@/components/results/NolanChart/NolanChart";
import { SingleAxisChart } from "@/components/results/SingleAxisChart/SingleAxisChart";
import { Traits } from "@/components/results/Traits/Traits";
import { RESULT_MODULE_TYPES } from "@/constants/results";
import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { MODULE_DRAWERS } from "../ModuleDrawing.constants";
import { MODULE_TEXTS } from "../ModuleDrawing.fixtures";
import { getModuleView } from "./getModuleView";
import { toArchetypeProps } from "./toArchetypeProps";
import { toDoubleAxisProps } from "./toDoubleAxisProps";
import { toHorizontalBarProps } from "./toHorizontalBarProps";
import { toMultiAxisProps } from "./toMultiAxisProps";
import { toNolanChartProps } from "./toNolanChartProps";
import { toSingleAxisProps } from "./toSingleAxisProps";
import { toTraitsProps } from "./toTraitsProps";

describe("getModuleView()", () => {
  describe("given a resolved module of each type", () => {
    it("draws a single axis with SingleAxisChart", () => {
      const module = findModule("single_axis");

      expect(getModuleView(module, MODULE_TEXTS)).toEqual({
        Component: SingleAxisChart,
        props: toSingleAxisProps(module),
      });
    });

    it("draws a double axis with DoubleAxisChart", () => {
      const module = findModule("double_axis");

      expect(getModuleView(module, MODULE_TEXTS)).toEqual({
        Component: DoubleAxisChart,
        props: toDoubleAxisProps(module),
      });
    });

    it("draws a multi axis with MultiAxisChart", () => {
      const module = findModule("multi_axis");

      expect(getModuleView(module, MODULE_TEXTS)).toEqual({
        Component: MultiAxisChart,
        props: toMultiAxisProps(module),
      });
    });

    it("draws a horizontal bar with HorizontalBarChart, and hands the texts on", () => {
      const module = findModule("horizontal_bar");

      expect(getModuleView(module, MODULE_TEXTS)).toEqual({
        Component: HorizontalBarChart,
        props: toHorizontalBarProps(module, MODULE_TEXTS),
      });
    });

    it("draws a Nolan chart with NolanChart", () => {
      const module = findModule("nolan_chart");

      expect(getModuleView(module, MODULE_TEXTS)).toEqual({
        Component: NolanChart,
        props: toNolanChartProps(module),
      });
    });

    it("draws an archetype with Archetype", () => {
      const module = findModule("archetype");

      expect(getModuleView(module, MODULE_TEXTS)).toEqual({
        Component: Archetype,
        props: toArchetypeProps(module),
      });
    });

    it("draws traits with Traits", () => {
      const module = findModule("traits");

      expect(getModuleView(module, MODULE_TEXTS)).toEqual({
        Component: Traits,
        props: toTraitsProps(module),
      });
    });
  });

  describe("the table of module types", () => {
    it("has a row for every type that stands among the modules, and none for the header", () => {
      expect(Object.keys(MODULE_DRAWERS).sort()).toEqual(
        RESULT_MODULE_TYPES.filter((type) => type !== "header").sort(),
      );
    });
  });
});
