import { describe, expect, it } from "vitest";

import { Archetype } from "@/components/results/Archetype/Archetype";
import { DoubleAxisChart } from "@/components/results/DoubleAxisChart/DoubleAxisChart";
import { HorizontalBarChart } from "@/components/results/HorizontalBarChart/HorizontalBarChart";
import { MultiAxisChart } from "@/components/results/MultiAxisChart/MultiAxisChart";
import { NolanChart } from "@/components/results/NolanChart/NolanChart";
import { SingleAxisChart } from "@/components/results/SingleAxisChart/SingleAxisChart";
import { Traits } from "@/components/results/Traits/Traits";
import { RESULT_MODULE_TYPES } from "@/constants/results";
import type { DrawnModuleType } from "@/types/results";
import {
  findFriendModule,
  findModule,
} from "@/utils/result-modules/resolvedModules.fixtures";
import {
  FRIEND,
  MODULES_COMPARISON,
} from "../../../../ResultsColumns.fixtures";
import { MODULE_DRAWERS } from "../ModuleDrawing.constants";
import { MODULE_TEXTS } from "../ModuleDrawing.fixtures";
import { toArchetypeComparison } from "./comparison/toArchetypeComparison";
import { toDoubleAxisComparison } from "./comparison/toDoubleAxisComparison";
import { toHorizontalBarComparison } from "./comparison/toHorizontalBarComparison";
import { toMultiAxisComparison } from "./comparison/toMultiAxisComparison";
import { toNolanComparison } from "./comparison/toNolanComparison";
import { toSingleAxisComparison } from "./comparison/toSingleAxisComparison";
import { toTraitsComparison } from "./comparison/toTraitsComparison";
import { getModuleView } from "./getModuleView";
import { toArchetypeProps } from "./props/toArchetypeProps";
import { toDoubleAxisProps } from "./props/toDoubleAxisProps";
import { toHorizontalBarProps } from "./props/toHorizontalBarProps";
import { toMultiAxisProps } from "./props/toMultiAxisProps";
import { toNolanChartProps } from "./props/toNolanChartProps";
import { toSingleAxisProps } from "./props/toSingleAxisProps";
import { toTraitsProps } from "./props/toTraitsProps";

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

  describe("given a comparison", () => {
    const getComparison = (type: DrawnModuleType) =>
      getModuleView(findModule(type), MODULE_TEXTS, MODULES_COMPARISON).props
        .comparison;

    it("hands a single axis the value of the other side for the same orientation", () => {
      expect(getComparison("single_axis")).toEqual(
        toSingleAxisComparison(findFriendModule("single_axis"), FRIEND),
      );
      expect(getComparison("single_axis")).toEqual({
        orientation: FRIEND,
        value: 100,
      });
    });

    it("hands a double axis the start-side value of the other side for the same axis", () => {
      expect(getComparison("double_axis")).toEqual(
        toDoubleAxisComparison(findFriendModule("double_axis"), FRIEND),
      );
      expect(getComparison("double_axis")).toEqual({
        orientation: FRIEND,
        value: 0,
      });
    });

    it("hands a multi axis the start-side value of the other side for every axis, by axis", () => {
      expect(getComparison("multi_axis")).toEqual(
        toMultiAxisComparison(findFriendModule("multi_axis"), FRIEND),
      );
      expect(getComparison("multi_axis")).toEqual({
        orientation: FRIEND,
        values: { "society-axis": 50, "economy-axis": 0 },
      });
    });

    it("hands a horizontal bar the value of the other side for every orientation, by orientation", () => {
      expect(getComparison("horizontal_bar")).toEqual(
        toHorizontalBarComparison(findFriendModule("horizontal_bar"), FRIEND),
      );
      expect(getComparison("horizontal_bar")).toEqual({
        orientation: FRIEND,
        values: { "party-green": 75, "party-left": 25 },
      });
    });

    it("hands a Nolan chart the four side values of the other side", () => {
      expect(getComparison("nolan_chart")).toEqual(
        toNolanComparison(findFriendModule("nolan_chart"), FRIEND),
      );
      expect(getComparison("nolan_chart")).toEqual({
        orientation: FRIEND,
        horizontal: { start: 0, end: 100 },
        vertical: { start: 50, end: 50 },
      });
    });

    it("hands an archetype the value of the other side for every archetype", () => {
      expect(getComparison("archetype")).toEqual(
        toArchetypeComparison(findFriendModule("archetype"), FRIEND),
      );
      expect(getComparison("archetype")).toEqual({
        orientation: FRIEND,
        values: { liberal: 60, socialist: 25 },
      });
    });

    it("hands traits the traits the other side earned", () => {
      expect(getComparison("traits")).toEqual(
        toTraitsComparison(findFriendModule("traits"), FRIEND),
      );
      expect(getComparison("traits")).toEqual({
        orientation: FRIEND,
        earnedIds: ["calm"],
      });
    });

    it("keeps the component and every other prop of the module", () => {
      const module = findModule("multi_axis");
      const view = getModuleView(module, MODULE_TEXTS, MODULES_COMPARISON);

      expect(view.Component).toBe(MultiAxisChart);
      expect(view.props).toMatchObject(toMultiAxisProps(module));
    });
  });

  describe("given a comparison whose other result does not draw the module", () => {
    it("draws the module for one side alone", () => {
      const module = findModule("archetype");
      const view = getModuleView(module, MODULE_TEXTS, {
        orientation: FRIEND,
        modules: MODULES_COMPARISON.modules.filter(
          ({ type }) => type !== "archetype",
        ),
      });

      expect(view).toEqual({
        Component: Archetype,
        props: toArchetypeProps(module),
      });
      expect(view.props.comparison).toBeUndefined();
    });
  });

  describe("given no comparison", () => {
    it("hands no module one", () => {
      for (const type of Object.keys(MODULE_DRAWERS) as DrawnModuleType[]) {
        expect(
          getModuleView(findModule(type), MODULE_TEXTS).props.comparison,
        ).toBeUndefined();
      }
    });
  });

  describe("the table of module types", () => {
    it("has what is handed for the other side in every row", () => {
      for (const drawer of Object.values(MODULE_DRAWERS)) {
        expect(drawer.toComparison).toBeTypeOf("function");
      }
    });

    it("has a row for every type that stands among the modules, and none for the header", () => {
      expect(Object.keys(MODULE_DRAWERS).sort()).toEqual(
        RESULT_MODULE_TYPES.filter((type) => type !== "header").sort(),
      );
    });
  });
});
