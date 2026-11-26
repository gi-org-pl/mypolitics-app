import { describe, expect, it } from "vitest";

import { toLongHex } from "./toLongHex";

describe("toLongHex()", () => {
  describe("given a colour of 6 hex digits", () => {
    it("gives it as it is, without the space around it", () => {
      expect(toLongHex(" #00d492 ")).toBe("#00d492");
    });
  });

  describe("given a colour of 3 hex digits", () => {
    it("gives each digit twice", () => {
      expect(toLongHex("#0aF")).toBe("#00aaFF");
    });
  });

  describe("given any other notation", () => {
    it.each([
      "#00d4921a",
      "#0af8",
      "rgb(0 212 146)",
      "red",
      "",
      undefined,
    ])("gives nothing for %s", (color) => {
      expect(toLongHex(color)).toBeUndefined();
    });
  });
});
