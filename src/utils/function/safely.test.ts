import { describe, expect, it, vi } from "vitest";

import { safely } from "./safely";

describe("safely()", () => {
  describe("given a step that works", () => {
    it("returns what the step returns", () => {
      expect(safely(() => "value", "fallback")).toBe("value");
    });

    it("returns a result that is empty as it is, not the fallback", () => {
      expect(safely<string | null>(() => null, "fallback")).toBeNull();
      expect(safely(() => 0, 7)).toBe(0);
    });

    it("runs the step once", () => {
      const run = vi.fn(() => 1);

      safely(run, 0);

      expect(run).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a step that throws", () => {
    it("returns the fallback", () => {
      expect(
        safely(() => {
          throw new Error("refused");
        }, "fallback"),
      ).toBe("fallback");
    });

    it("returns the fallback whatever is thrown", () => {
      expect(
        safely<number | undefined>(() => {
          throw "not an error";
        }, undefined),
      ).toBeUndefined();
    });
  });
});
