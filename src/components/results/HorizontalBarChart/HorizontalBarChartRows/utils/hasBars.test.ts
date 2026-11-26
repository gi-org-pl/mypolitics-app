import { describe, expect, it } from "vitest";

import type { RankedComparison } from "@/types/results";
import { createOrientation } from "@/utils/vitest/createOrientation";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";
import { hasBars } from "./hasBars";

const entry = (id: string, value?: number): RankedEntry => ({
  orientation: createOrientation(id, id),
  value,
});

const friend = createOrientation("friend", "Znajomy");

describe("hasBars()", () => {
  describe("given a ranking with a value on at least one entry", () => {
    it("draws bars", () => {
      expect(hasBars([entry("a"), entry("b", 40)])).toBe(true);
    });

    it("draws bars for a value of zero", () => {
      expect(hasBars([entry("a", 0)])).toBe(true);
    });
  });

  describe("given a ranking with no value", () => {
    it("draws no bars", () => {
      expect(hasBars([entry("a"), entry("b")])).toBe(false);
    });

    it("draws bars when the other side of a comparison has a value on one of its entries", () => {
      const comparison: RankedComparison = {
        orientation: friend,
        values: { b: 30 },
      };

      expect(hasBars([entry("a"), entry("b")], comparison)).toBe(true);
    });

    it("draws no bars when the other side has no value on any of them", () => {
      const comparison: RankedComparison = {
        orientation: friend,
        values: { c: 30 },
      };

      expect(hasBars([entry("a"), entry("b")], comparison)).toBe(false);
    });
  });

  describe("given an empty ranking", () => {
    it("draws no bars", () => {
      expect(hasBars([])).toBe(false);
    });
  });
});
