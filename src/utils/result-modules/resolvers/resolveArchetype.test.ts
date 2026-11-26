import { describe, expect, it } from "vitest";

import type { ResultModule } from "@/types/results";
import { moduleQuizContext } from "@/utils/result-modules/resolveResult.fixtures";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { resolveArchetype } from "./resolveArchetype";

const resolve = (overrides: Partial<ResultModule>) =>
  resolveArchetype(
    createResultModule("identity", "archetype", overrides),
    moduleQuizContext,
  );

describe("resolveArchetype()", () => {
  describe("given a record that lists orientations", () => {
    it("returns every shown one with its value, in the author's order", () => {
      expect(
        resolve({ orientationIds: ["liberal", "anarchist", "socialist"] }),
      ).toMatchObject({
        type: "archetype",
        entries: [
          { orientation: { id: "liberal" }, value: 20 },
          { orientation: { id: "socialist" }, value: 100 },
        ],
      });
    });

    it("keeps an orientation that has no value", () => {
      const resolved = resolve({ orientationIds: ["party-right", "liberal"] });

      expect(
        resolved?.entries.map(({ orientation, value }) => [
          orientation.id,
          value,
        ]),
      ).toEqual([
        ["party-right", undefined],
        ["liberal", 20],
      ]);
    });
  });

  describe("given a record left with no shown orientation", () => {
    it("returns nothing", () => {
      expect(resolve({ orientationIds: [] })).toBeUndefined();
      expect(resolve({ orientationIds: ["anarchist"] })).toBeUndefined();
    });
  });
});
