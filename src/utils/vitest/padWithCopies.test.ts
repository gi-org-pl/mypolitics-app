import { describe, expect, it } from "vitest";

import { padWithCopies } from "./padWithCopies";

const items = [
  { id: "a", text: "First" },
  { id: "b", text: "Second" },
];

describe("padWithCopies()", () => {
  describe("given a length above the number of items", () => {
    it("keeps the items and adds copies under new identifiers", () => {
      expect(padWithCopies(items, 5)).toEqual([
        { id: "a", text: "First" },
        { id: "b", text: "Second" },
        { id: "a-2", text: "First" },
        { id: "b-3", text: "Second" },
        { id: "a-4", text: "First" },
      ]);
    });

    it("gives every item an identifier of its own", () => {
      const ids = padWithCopies(items, 102).map(({ id }) => id);

      expect(new Set(ids).size).toBe(102);
    });
  });

  describe("given the number of items", () => {
    it("returns the items as they are", () => {
      expect(padWithCopies(items, 2)).toEqual(items);
    });
  });

  describe("given a length below the number of items", () => {
    it("returns the first ones", () => {
      expect(padWithCopies(items, 1)).toEqual([{ id: "a", text: "First" }]);
    });
  });
});
