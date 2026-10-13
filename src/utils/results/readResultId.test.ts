import { describe, expect, it } from "vitest";

import { readResultId } from "./readResultId";

const RESULT_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";

describe("readResultId()", () => {
  describe("given a result identifier", () => {
    it("returns it", () => {
      expect(readResultId(RESULT_ID)).toBe(RESULT_ID);
    });
  });

  describe("given an identifier with space around it", () => {
    it("trims it", () => {
      expect(readResultId(`  ${RESULT_ID}\n`)).toBe(RESULT_ID);
      expect(readResultId(`\t${RESULT_ID} `)).toBe(RESULT_ID);
    });
  });

  describe("given an identifier in upper case", () => {
    it("returns it in lower case", () => {
      expect(readResultId(RESULT_ID.toUpperCase())).toBe(RESULT_ID);
    });
  });

  describe("given a text that is not an identifier in form", () => {
    it.each([
      ["nothing", ""],
      ["only space", "   "],
      ["a word", "znajomy"],
      ["an identifier cut short", RESULT_ID.slice(0, 20)],
      ["an identifier with something after it", `${RESULT_ID}/edit`],
      ["two identifiers", `${RESULT_ID} ${RESULT_ID}`],
      ["a UUID of another version", "3f0c2a52-6f7b-1d53-9a55-0d5f1b9f3c11"],
    ])("returns none: %s", (_, text) => {
      expect(readResultId(text)).toBeUndefined();
    });
  });
});
