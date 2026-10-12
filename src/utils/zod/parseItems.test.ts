import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseItems } from "./parseItems";

const schema = z.object({ id: z.string().min(1), weight: z.number().catch(0) });

describe("parseItems()", () => {
  describe("given a list", () => {
    it("returns every item as the schema reads it, in the same order", () => {
      expect(
        parseItems(
          [
            { id: "b", weight: 2, text: "Second" },
            { id: "a", weight: "1" },
          ],
          schema,
        ),
      ).toEqual([
        { id: "b", weight: 2 },
        { id: "a", weight: 0 },
      ]);
    });

    it("drops an item the schema does not accept and keeps the others", () => {
      expect(
        parseItems(
          [
            { id: "a", weight: 1 },
            { weight: 2 },
            null,
            "c",
            7,
            [],
            { id: "d" },
          ],
          schema,
        ),
      ).toEqual([
        { id: "a", weight: 1 },
        { id: "d", weight: 0 },
      ]);
    });

    it("returns an empty list for an empty list", () => {
      expect(parseItems([], schema)).toEqual([]);
    });
  });

  describe("given something that is not a list", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["items"],
      [7],
      [{}],
      [{ 0: { id: "a" }, length: 1 }],
    ])("returns an empty list for %j", (items) => {
      expect(parseItems(items, schema)).toEqual([]);
    });
  });
});
