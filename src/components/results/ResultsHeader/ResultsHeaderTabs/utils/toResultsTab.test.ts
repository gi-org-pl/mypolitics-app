import { describe, expect, it } from "vitest";

import { toResultsTab } from "./toResultsTab";

describe("toResultsTab()", () => {
  describe("given the value of a tab", () => {
    it("returns that tab", () => {
      expect(toResultsTab("results")).toBe("results");
      expect(toResultsTab("comparison")).toBe("comparison");
    });
  });

  describe("given any other value", () => {
    it("falls back to the results tab", () => {
      expect(toResultsTab("")).toBe("results");
      expect(toResultsTab("settings")).toBe("results");
    });
  });
});
