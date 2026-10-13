import { describe, expect, it } from "vitest";

import { containsText } from "./containsText";

describe("containsText()", () => {
  describe("given a text that contains the search", () => {
    it("says yes", () => {
      expect(containsText("Wolny rynek", "rynek")).toBe(true);
      expect(containsText("Wolny rynek", "Wolny rynek")).toBe(true);
    });

    it("ignores letter case, also of Polish letters", () => {
      expect(containsText("Wolny rynek", "WOLNY")).toBe(true);
      expect(containsText("ŚWIATOPOGLĄD", "światopogląd")).toBe(true);
    });

    it("ignores the space around the search", () => {
      expect(containsText("Wolny rynek", "  rynek ")).toBe(true);
    });
  });

  describe("given a text that does not contain the search", () => {
    it("says no", () => {
      expect(containsText("Wolny rynek", "tradycja")).toBe(false);
      expect(containsText("Wolny rynek", "wolnyrynek")).toBe(false);
    });
  });

  describe("given an empty search", () => {
    it("says yes for every text", () => {
      expect(containsText("Wolny rynek", "")).toBe(true);
      expect(containsText("Wolny rynek", "   ")).toBe(true);
      expect(containsText(undefined, "")).toBe(true);
    });
  });

  describe("given no text", () => {
    it("says no for a search that is not empty", () => {
      expect(containsText(undefined, "rynek")).toBe(false);
    });
  });
});
