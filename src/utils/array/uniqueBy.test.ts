import { describe, expect, it } from "vitest";

import { uniqueBy } from "./uniqueBy";

const getId = (item: { id: string }) => item.id;

describe("uniqueBy()", () => {
  describe("given items with different keys", () => {
    it("returns all of them in the same order", () => {
      const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

      expect(uniqueBy(items, getId)).toEqual(items);
    });
  });

  describe("given two items with the same key", () => {
    it("keeps the first one and drops the later one", () => {
      const first = { id: "a", name: "first" };
      const second = { id: "b", name: "second" };
      const repeated = { id: "a", name: "repeated" };

      expect(uniqueBy([first, second, repeated], getId)).toEqual([
        first,
        second,
      ]);
    });
  });

  describe("given no items", () => {
    it("returns an empty list", () => {
      expect(uniqueBy([], getId)).toEqual([]);
    });
  });

  describe("given any list", () => {
    it("does not change the list it was given", () => {
      const items = [{ id: "a" }, { id: "a" }];

      uniqueBy(items, getId);

      expect(items).toHaveLength(2);
    });
  });
});
