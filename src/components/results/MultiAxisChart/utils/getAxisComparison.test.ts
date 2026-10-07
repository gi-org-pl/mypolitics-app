import { describe, expect, it } from "vitest";

import type { Orientation } from "@/types/orientation";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import type { AxisComparison } from "../MultiAxisChart.types";
import { getAxisComparison } from "./getAxisComparison";

const friend: Orientation = { id: "friend", type: "person", name: "Ania" };
const force = createAxisPair("force", "Pacyfizm", "Militaryzm", 5, 95);

describe("getAxisComparison()", () => {
  describe("given a value for the axis", () => {
    it("returns the other side with that value", () => {
      expect(
        getAxisComparison(force, {
          orientation: friend,
          values: { force: 20 },
        }),
      ).toEqual({ orientation: friend, value: 20 });
    });

    it("keeps a value of zero", () => {
      expect(
        getAxisComparison(force, { orientation: friend, values: { force: 0 } }),
      ).toEqual({ orientation: friend, value: 0 });
    });
  });

  describe("given no value for the axis", () => {
    it("returns nothing", () => {
      expect(
        getAxisComparison(force, {
          orientation: friend,
          values: { other: 20 },
        }),
      ).toBeUndefined();
    });
  });

  describe("given a value that is not a number", () => {
    it("returns nothing", () => {
      expect(
        getAxisComparison(force, {
          orientation: friend,
          values: { force: "20" } as unknown as Record<string, number>,
        }),
      ).toBeUndefined();
      expect(
        getAxisComparison(force, {
          orientation: friend,
          values: { force: Number.NaN },
        }),
      ).toBeUndefined();
    });
  });

  describe("given an incomplete comparison", () => {
    it("returns nothing", () => {
      expect(getAxisComparison(force)).toBeUndefined();
      expect(
        getAxisComparison(force, {
          values: { force: 20 },
        } as unknown as AxisComparison),
      ).toBeUndefined();
      expect(
        getAxisComparison(force, {
          orientation: friend,
        } as unknown as AxisComparison),
      ).toBeUndefined();
    });
  });
});
