import { describe, expect, it } from "vitest";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";
import { getEntryId } from "./getEntryId";

describe("getEntryId()", () => {
  describe("given an entry with an orientation", () => {
    it("returns the orientation id", () => {
      expect(getEntryId({ orientation: { id: "alfa", name: "Alfa" } })).toBe(
        "alfa",
      );
    });
  });

  describe("given an entry without an orientation", () => {
    it("returns an empty id", () => {
      expect(getEntryId({} as RankedEntry)).toBe("");
    });
  });
});
