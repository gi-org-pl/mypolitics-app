import { describe, expect, it } from "vitest";

import { withKeys } from "./withKeys";

const getId = (item: { id: string }): string => item.id;

describe("withKeys()", () => {
  describe("given items with different ids", () => {
    it("pairs each item with a key made from its id, in the given order", () => {
      const a = { id: "a" };
      const b = { id: "b" };

      expect(withKeys([a, b], getId)).toEqual([
        { item: a, key: "a-0" },
        { item: b, key: "b-0" },
      ]);
    });
  });

  describe("given the same id more than once", () => {
    it("numbers the occurrences so every key is unique", () => {
      const keys = withKeys(
        [{ id: "a" }, { id: "b" }, { id: "a" }, { id: "a" }],
        getId,
      ).map(({ key }) => key);

      expect(keys).toEqual(["a-0", "b-0", "a-1", "a-2"]);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("never gives two different ids the same key", () => {
      const keys = withKeys(
        [{ id: "a" }, { id: "a" }, { id: "a-1" }, { id: "a-0" }],
        getId,
      ).map(({ key }) => key);

      expect(new Set(keys).size).toBe(keys.length);
    });
  });

  describe("given the same items in another order", () => {
    it("keeps the key of an item whose id is unique", () => {
      const first = withKeys([{ id: "a" }, { id: "b" }], getId);
      const second = withKeys([{ id: "b" }, { id: "a" }], getId);

      expect(first.find(({ item }) => item.id === "b")?.key).toBe(
        second.find(({ item }) => item.id === "b")?.key,
      );
    });
  });

  describe("given an empty list", () => {
    it("returns an empty list", () => {
      expect(withKeys([], getId)).toEqual([]);
    });
  });

  describe("given any list", () => {
    it("does not mutate it", () => {
      const items = [{ id: "a" }];

      expect(withKeys(items, getId)[0].item).toBe(items[0]);
      expect(items).toEqual([{ id: "a" }]);
    });
  });
});
