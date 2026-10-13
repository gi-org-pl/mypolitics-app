import { describe, expect, it } from "vitest";

import { toggleItem } from "./toggleItem";

describe("toggleItem()", () => {
  describe("given an item the list does not have", () => {
    it("puts it at the end", () => {
      expect(toggleItem(["q1", "q2"], "q3")).toEqual(["q1", "q2", "q3"]);
      expect(toggleItem([], "q1")).toEqual(["q1"]);
    });
  });

  describe("given an item the list has", () => {
    it("takes it out, and keeps the order of the rest", () => {
      expect(toggleItem(["q1", "q2", "q3"], "q2")).toEqual(["q1", "q3"]);
      expect(toggleItem(["q1"], "q1")).toEqual([]);
    });
  });

  describe("given any list", () => {
    it("leaves it as it is", () => {
      const items = ["q1", "q2"];

      toggleItem(items, "q1");
      toggleItem(items, "q3");

      expect(items).toEqual(["q1", "q2"]);
    });
  });
});
