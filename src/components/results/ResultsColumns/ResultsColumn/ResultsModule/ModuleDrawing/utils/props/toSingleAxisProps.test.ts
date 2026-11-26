import { describe, expect, it } from "vitest";
import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { toSingleAxisProps } from "./toSingleAxisProps";

describe("toSingleAxisProps()", () => {
  describe("given a resolved single axis", () => {
    it("hands over the orientation, its value and the marker", () => {
      expect(toSingleAxisProps(findModule("single_axis"))).toEqual({
        orientation: createOrientation("green", "Ekologia"),
        value: 100,
        marker: 60,
      });
    });

    it("hands over an entry without a value as it is, and a marker that is off", () => {
      const orientation = createOrientation("green", "Ekologia");

      expect(
        toSingleAxisProps({
          ...findModule("single_axis"),
          entry: { orientation },
          marker: false,
        }),
      ).toEqual({ orientation, value: undefined, marker: false });
    });
  });
});
