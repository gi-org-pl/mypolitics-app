import { describe, expect, expectTypeOf, it } from "vitest";

import { toValueKeys } from "./toValueKeys";

describe("toValueKeys()", () => {
  describe("given a prefix and a list of names", () => {
    it("returns each name behind the prefix, in the order of the list", () => {
      expect(toValueKeys("label.", ["centre", "topLeftModerate"])).toEqual([
        "label.centre",
        "label.topLeftModerate",
      ]);
      expect(toValueKeys("color.", ["topLeft"])).toEqual(["color.topLeft"]);
    });

    it("leaves the list it was given as it is", () => {
      const names = ["centre", "link"] as const;

      toValueKeys("label.", names);

      expect(names).toEqual(["centre", "link"]);
    });
  });

  describe("given no names", () => {
    it("returns no keys", () => {
      expect(toValueKeys("label.", [])).toEqual([]);
    });
  });

  // Checked by the compiler, not at run time.
  describe("the type of the result", () => {
    it("holds each key as it is written, so that a table built from it knows its keys", () => {
      const keys = toValueKeys("color.", ["topLeft", "topRight"] as const);

      expectTypeOf(keys).toEqualTypeOf<
        ("color.topLeft" | "color.topRight")[]
      >();
    });
  });
});
