import { describe, expect, it } from "vitest";
import { toggleSelection } from "./toggleSelection";

describe("toggleSelection()", () => {
  describe("when id is already in the list", () => {
    it("returns the list with the id removed", () => {
      const result = toggleSelection(["a", "b", "c"], "b", 3);
      expect(result).toEqual(["a", "c"]);
    });

    it("returns the list with the first id removed", () => {
      const result = toggleSelection(["a", "b"], "a", 3);
      expect(result).toEqual(["b"]);
    });
  });

  describe("when id is not in the list and length < max", () => {
    it("returns the list with the id appended", () => {
      const result = toggleSelection(["a", "b"], "c", 3);
      expect(result).toEqual(["a", "b", "c"]);
    });

    it("returns the list with the id appended when list is empty", () => {
      const result = toggleSelection([], "a", 3);
      expect(result).toEqual(["a"]);
    });
  });

  describe("when id is not in the list and length === max", () => {
    it("returns the original list unchanged", () => {
      const original = ["a", "b", "c"];
      const result = toggleSelection(original, "d", 3);
      expect(result).toEqual(["a", "b", "c"]);
    });

    it("returns the exact same array reference", () => {
      const original = ["a", "b", "c"];
      const result = toggleSelection(original, "d", 3);
      expect(result).toBe(original);
    });
  });
});