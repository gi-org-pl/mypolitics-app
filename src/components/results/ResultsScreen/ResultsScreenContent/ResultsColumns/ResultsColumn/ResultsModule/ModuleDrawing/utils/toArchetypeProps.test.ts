import { describe, expect, it } from "vitest";

import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { toArchetypeProps } from "./toArchetypeProps";

describe("toArchetypeProps()", () => {
  describe("given a resolved archetype", () => {
    it("hands over the title, and every entry with its value as its match", () => {
      const module = findModule("archetype");

      expect(toArchetypeProps(module)).toEqual({
        title: "Tożsamość",
        archetypes: [
          { orientation: module.entries[0].orientation, match: 20 },
          { orientation: module.entries[1].orientation, match: 100 },
        ],
      });
    });

    it("leaves an entry without a value without a match", () => {
      const module = findModule("archetype");
      const [{ orientation }] = module.entries;

      expect(
        toArchetypeProps({ ...module, entries: [{ orientation }] }).archetypes,
      ).toEqual([{ orientation, match: undefined }]);
    });
  });
});
