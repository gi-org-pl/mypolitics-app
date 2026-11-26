import { describe, expect, it } from "vitest";

import { getPillTextClassName } from "./getPillTextClassName";

describe("getPillTextClassName()", () => {
  describe("given a text of several words", () => {
    it("wraps it onto two lines and cuts only after them", () => {
      expect(getPillTextClassName("Polityka zagraniczna")).toBe(
        "line-clamp-2 py-0.5 leading-5 wrap-break-word",
      );
    });
  });

  describe("given a single word", () => {
    it("keeps it on one line and cuts it with an ellipsis", () => {
      expect(getPillTextClassName("Światopogląd")).toBe("truncate leading-6");
    });

    it("treats the space around it as no space", () => {
      expect(getPillTextClassName("  Światopogląd ")).toBe(
        "truncate leading-6",
      );
    });
  });
});
