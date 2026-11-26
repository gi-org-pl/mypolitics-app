import { describe, expect, it } from "vitest";

import type { ResultModule } from "@/types/results";
import { moduleQuizContext } from "@/utils/result-modules/resolveResult.fixtures";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { resolveSingleAxis } from "./resolveSingleAxis";

const resolve = (overrides: Partial<ResultModule>) =>
  resolveSingleAxis(
    createResultModule("ecology", "single_axis", overrides),
    moduleQuizContext,
  );

describe("resolveSingleAxis()", () => {
  describe("given a record that lists a shown orientation", () => {
    it("returns the orientation with its value, and the marker", () => {
      expect(resolve({ orientationIds: ["green"], marker: 60 })).toMatchObject({
        type: "single_axis",
        entry: { orientation: { id: "green", name: "Ekologia" }, value: 100 },
        marker: 60,
      });
    });

    it("returns a marker that is switched off as it is", () => {
      expect(
        resolve({ orientationIds: ["green"], marker: false })?.marker,
      ).toBe(false);
    });
  });

  describe("given a record that lists several orientations", () => {
    it("returns the first shown one", () => {
      expect(
        resolve({ orientationIds: ["secret", "liberal", "green"] })?.entry,
      ).toMatchObject({ orientation: { id: "liberal" }, value: 20 });
    });
  });

  describe("given an orientation with no value", () => {
    it("still returns it, with no value", () => {
      const resolved = resolve({ orientationIds: ["party-right"] });

      expect(resolved?.entry.orientation.id).toBe("party-right");
      expect(resolved?.entry.value).toBeUndefined();
    });
  });

  describe("given a record left with no shown orientation", () => {
    it("returns nothing", () => {
      expect(resolve({ orientationIds: [] })).toBeUndefined();
      expect(resolve({ orientationIds: ["secret"] })).toBeUndefined();
    });
  });
});
