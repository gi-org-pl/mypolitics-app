import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { toEntryValues } from "./toEntryValues";

describe("toEntryValues()", () => {
  describe("given entries", () => {
    it("returns their values by orientation", () => {
      expect(
        toEntryValues([
          { orientation: createOrientation("a"), value: 75 },
          { orientation: createOrientation("b"), value: 0 },
        ]),
      ).toEqual({ a: 75, b: 0 });
    });

    it("leaves out an entry without a value", () => {
      expect(
        toEntryValues([
          { orientation: createOrientation("a") },
          { orientation: createOrientation("b"), value: 20 },
        ]),
      ).toEqual({ b: 20 });
    });
  });

  describe("given no entries", () => {
    it("returns nothing", () => {
      expect(toEntryValues([])).toEqual({});
    });
  });
});
