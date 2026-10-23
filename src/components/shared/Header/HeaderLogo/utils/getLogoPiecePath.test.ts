import { describe, expect, it } from "vitest";

import { LOGO_REST_PIECES, LOGO_ROWS } from "../HeaderLogo.constants";
import { getLogoPiecePath } from "./getLogoPiecePath";

const getNumbers = (path: string) =>
  path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];

describe("getLogoPiecePath()", () => {
  describe("given every piece of the sign where it lies at rest", () => {
    it.each(
      LOGO_REST_PIECES,
    )("writes the outline of the brand file for $id, character for character", ({
      row,
      side,
      d,
    }) => {
      const { top, gapAtRest } = LOGO_ROWS[row];

      expect(getLogoPiecePath({ side, top, gapStart: gapAtRest })).toBe(d);
    });
  });

  describe("given an axis whose gap moved", () => {
    it("runs from the start of the bar to the gap, rounded more at the start", () => {
      expect(getLogoPiecePath({ side: "axis", top: 0, gapStart: 54 })).toBe(
        "M0 8C0 3.58172 3.58172 0 8 0H50C52.2091 0 54 1.79086 54 4V20C54 22.2091 52.2091 24 50 24H8C3.58172 24 0 20.4183 0 16V8Z",
      );
    });
  });

  describe("given a position whose gap moved", () => {
    it("runs from the end of the gap to the end of the bar, rounded more at the end", () => {
      expect(
        getLogoPiecePath({ side: "position", top: 36, gapStart: 54 }),
      ).toBe(
        "M66 40C66 37.7909 67.7909 36 70 36H112C116.418 36 120 39.5817 120 44V52C120 56.4183 116.418 60 112 60H70C67.7909 60 66 58.2091 66 56V40Z",
      );
    });
  });

  describe("given a gap between two whole units", () => {
    it("writes no more than six significant digits", () => {
      const path = getLogoPiecePath({
        side: "axis",
        top: 0,
        gapStart: 47.123_456_789,
      });

      expect(path).toContain("H43.1235");
      expect(
        getNumbers(path).every(
          (value) => value.toString().replace(/[-.]/g, "").length <= 6,
        ),
      ).toBe(true);
    });
  });
});
