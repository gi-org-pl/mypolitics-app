import { describe, expect, it } from "vitest";

import { getTitleTone } from "./getTitleTone";

describe("getTitleTone()", () => {
  describe("given no colour", () => {
    it("is neutral in either look", () => {
      expect(getTitleTone("moderate")).toBe("neutral");
      expect(getTitleTone("extreme", "")).toBe("neutral");
    });
  });

  describe("given the moderate look", () => {
    it("writes the title in the colour when it has 4.5:1 on its tint", () => {
      expect(getTitleTone("moderate", "#8443e9")).toBe("colored");
      expect(getTitleTone("moderate", "#1e3a8a")).toBe("colored");
    });

    it.each([
      "#00d492",
      "#36db8b",
      "#fff176",
      "#e43235",
    ])("writes it in the primary colour on the tint of %s, which has less", (color) => {
      expect(getTitleTone("moderate", color)).toBe("light");
    });

    it("reads a colour of three digits as six", () => {
      expect(getTitleTone("moderate", "#0d9")).toBe("light");
      expect(getTitleTone("moderate", "#228")).toBe("colored");
    });
  });

  describe("given the extreme look", () => {
    it("writes the title in white when it has 4.5:1 on the colour", () => {
      expect(getTitleTone("extreme", "#8443e9")).toBe("colored");
    });

    it.each([
      "#00d492",
      "#fff176",
    ])("writes it in the primary colour on %s, where white has less", (color) => {
      expect(getTitleTone("extreme", color)).toBe("light");
    });

    it("keeps white on a colour where neither has 4.5:1 and white reads better", () => {
      // #e43235 has 4.4:1 with white and 2.6:1 with the primary colour.
      expect(getTitleTone("extreme", "#e43235")).toBe("colored");
    });
  });

  describe("given a colour that is not plain hex", () => {
    it("falls back to its lightness", () => {
      expect(getTitleTone("moderate", "rgb(255 241 118)")).toBe("colored");
      expect(getTitleTone("moderate", "#fff17680")).toBe("light");
    });
  });
});
