import { describe, expect, it } from "vitest";

import { DEFAULT_COMPASS_QUADRANTS } from "@/constants/results";
import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { toNolanChartProps } from "./toNolanChartProps";

describe("toNolanChartProps()", () => {
  describe("given a resolved Nolan chart", () => {
    const module = findModule("nolan_chart");
    const props = toNolanChartProps({
      ...module,
      labels: {
        centre: "Centrum",
        horizontalEndModerate: "Prawicowy gospodarczo",
        verticalStartExtreme: "Skrajnie postępowy",
        bottomLeftModerate: "Lewica wolnościowa",
      },
      colors: { topLeft: "#ff0000" },
    });

    it("hands over the two axes with their names and entries", () => {
      expect(props.horizontal.name).toBe("gospodarczo");
      expect(props.horizontal.start.entry).toBe(module.horizontal.start);
      expect(props.horizontal.end.entry).toBe(module.horizontal.end);
      expect(props.vertical.name).toBe("światopoglądowo");
      expect(props.vertical.start.entry).toBe(module.vertical.start);
      expect(props.vertical.end.entry).toBe(module.vertical.end);
    });

    it("puts the labels into the names of the poles, by axis", () => {
      expect(props.horizontal.end.names?.moderate).toBe(
        "Prawicowy gospodarczo",
      );
      expect(props.horizontal.start.names?.extreme).toBeUndefined();
      expect(props.vertical.start.names?.extreme).toBe("Skrajnie postępowy");
    });

    it("puts the labels and the colours into the four corners, by corner", () => {
      expect(Object.keys(props.quadrants)).toEqual([
        "topLeft",
        "topRight",
        "bottomLeft",
        "bottomRight",
      ]);
      expect(props.quadrants.topLeft.color).toBe("#ff0000");
      expect(props.quadrants.topRight.color).toBe(
        DEFAULT_COMPASS_QUADRANTS.topRight.color,
      );
      expect(props.quadrants.bottomLeft.names?.moderate).toBe(
        "Lewica wolnościowa",
      );
    });

    it("names the middle of the map", () => {
      expect(props.centreName).toBe("Centrum");
    });
  });

  describe("given a record with no label and no colour", () => {
    it("leaves every name to the map, and draws the corners in the default colours", () => {
      const props = toNolanChartProps({
        ...findModule("nolan_chart"),
        labels: {},
        colors: {},
      });

      expect(props.centreName).toBeUndefined();
      expect(props.quadrants.bottomRight).toEqual({
        color: DEFAULT_COMPASS_QUADRANTS.bottomRight.color,
        names: {
          moderate: undefined,
          extreme: undefined,
          moderateShort: undefined,
          extremeShort: undefined,
        },
      });
    });
  });
});
