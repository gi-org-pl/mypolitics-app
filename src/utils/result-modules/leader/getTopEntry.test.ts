import { describe, expect, it } from "vitest";

import type { ResultEntry } from "@/types/results";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { getTopEntry } from "./getTopEntry";

const toEntry = (id: string, value?: number): ResultEntry => ({
  orientation: createOrientation(id, id),
  value,
});

describe("getTopEntry()", () => {
  describe("given entries with values", () => {
    it("returns the one with the highest value", () => {
      const top = toEntry("b", 80);

      expect(getTopEntry([toEntry("a", 20), top, toEntry("c", 79.9)])).toBe(
        top,
      );
    });

    it("returns an entry whose value is 0 when no other has more", () => {
      const top = toEntry("a", 0);

      expect(getTopEntry([top, toEntry("b")])).toBe(top);
    });
  });

  describe("given two entries that share the highest value", () => {
    it("returns the one listed first", () => {
      const first = toEntry("a", 60);

      expect(getTopEntry([toEntry("c", 10), first, toEntry("b", 60)])).toBe(
        first,
      );
    });
  });

  describe("given an entry without a value among the others", () => {
    it("never returns it", () => {
      const top = toEntry("b", 1);

      expect(getTopEntry([toEntry("a"), top, toEntry("c", Number.NaN)])).toBe(
        top,
      );
    });
  });

  describe("given no entry that has a value", () => {
    it("returns nothing", () => {
      expect(getTopEntry([toEntry("a"), toEntry("b")])).toBeUndefined();
      expect(getTopEntry([])).toBeUndefined();
    });
  });
});
