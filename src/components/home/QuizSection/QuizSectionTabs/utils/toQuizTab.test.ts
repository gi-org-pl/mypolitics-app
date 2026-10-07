import { describe, expect, it } from "vitest";

import { toQuizTab } from "./toQuizTab";

describe("toQuizTab", () => {
  describe("when the value is a tab", () => {
    it("returns that tab", () => {
      expect(toQuizTab("all")).toBe("all");
      expect(toQuizTab("electoral")).toBe("electoral");
      expect(toQuizTab("social")).toBe("social");
    });
  });

  describe("when the value is not a tab", () => {
    it("returns the first tab", () => {
      expect(toQuizTab("debates")).toBe("all");
      expect(toQuizTab("")).toBe("all");
    });
  });
});
