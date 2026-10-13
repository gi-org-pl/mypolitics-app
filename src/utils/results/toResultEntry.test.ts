import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { toResultEntry } from "./toResultEntry";

const liberal = createOrientation("liberal", "Liberał");

describe("toResultEntry()", () => {
  describe("given an orientation that has a score", () => {
    it("gives it its points as a share of its maximum, never rounded", () => {
      expect(
        toResultEntry(liberal, { liberal: { points: 1, maximum: 3 } }),
      ).toEqual({ orientation: liberal, value: (1 / 3) * 100 });
    });

    it("gives it 0 when it has no points", () => {
      expect(
        toResultEntry(liberal, { liberal: { points: 0, maximum: 4 } }).value,
      ).toBe(0);
    });
  });

  describe("given an orientation whose maximum is 0", () => {
    it("gives it no value", () => {
      const entry = toResultEntry(liberal, {
        liberal: { points: 0, maximum: 0 },
      });

      expect(entry.orientation).toBe(liberal);
      expect(entry.value).toBeUndefined();
    });
  });

  describe("given an orientation that has no score", () => {
    it("gives it no value", () => {
      expect(
        toResultEntry(liberal, { other: { points: 1, maximum: 1 } }).value,
      ).toBeUndefined();
      expect(toResultEntry(liberal, {}).value).toBeUndefined();
    });
  });
});
