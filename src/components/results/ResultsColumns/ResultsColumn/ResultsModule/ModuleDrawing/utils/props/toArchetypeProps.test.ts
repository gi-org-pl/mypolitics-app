import { describe, expect, it } from "vitest";

import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { toArchetypeProps } from "./toArchetypeProps";

describe("toArchetypeProps()", () => {
  describe("given a resolved archetype", () => {
    it("hands over the title, what the card does with a leader below a partial match, and every entry with its value as its match", () => {
      const module = findModule("archetype");

      expect(toArchetypeProps(module)).toEqual({
        title: "Tożsamość",
        lowMatch: "no_match",
        archetypes: [
          { orientation: module.entries[0].orientation, match: 20 },
          { orientation: module.entries[1].orientation, match: 100 },
        ],
      });
    });

    it("hands over a card set to name a leader below a partial match as such", () => {
      expect(
        toArchetypeProps({ ...findModule("archetype"), lowMatch: "named" })
          .lowMatch,
      ).toBe("named");
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
