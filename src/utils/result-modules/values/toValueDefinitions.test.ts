import { describe, expect, expectTypeOf, it } from "vitest";

import { toValueDefinitions } from "./toValueDefinitions";

const color = { kind: "color" } as const;

describe("toValueDefinitions()", () => {
  describe("given a list of keys and a definition", () => {
    it("returns that definition under each key", () => {
      expect(
        toValueDefinitions(["color.topLeft", "color.topRight"], color),
      ).toStrictEqual({
        "color.topLeft": { kind: "color" },
        "color.topRight": { kind: "color" },
      });
    });

    it("holds a definition with its rules as it is", () => {
      const count = {
        kind: "number",
        min: 1,
        max: 20,
        fallback: 3,
      } as const;

      expect(toValueDefinitions(["rows"], count)).toStrictEqual({
        rows: count,
      });
    });
  });

  describe("given no keys", () => {
    it("returns no definitions", () => {
      expect(toValueDefinitions([], color)).toStrictEqual({});
    });
  });

  // Checked by the compiler, not at run time.
  describe("the type of the result", () => {
    it("has the keys of the list and no other, each with the definition given", () => {
      const definitions = toValueDefinitions(
        ["color.topLeft", "color.topRight"] as const,
        color,
      );

      expectTypeOf(definitions).toEqualTypeOf<
        Record<"color.topLeft" | "color.topRight", { readonly kind: "color" }>
      >();
      // @ts-expect-error The list holds no such key.
      expect(definitions["color.centre"]).toBeUndefined();
    });
  });
});
