import { describe, expect, it } from "vitest";

import { isResultId } from "./isResultId";

describe("isResultId()", () => {
  describe("given a version 4 UUID", () => {
    it("says yes, whatever its letter case", () => {
      expect(isResultId("3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11")).toBe(true);
      expect(isResultId("3F0C2A52-6F7B-4D53-9A55-0D5F1B9F3C11")).toBe(true);
      expect(isResultId(crypto.randomUUID())).toBe(true);
    });
  });

  describe("given anything else", () => {
    it.each([
      ["nothing", ""],
      ["a word", "wyniki"],
      ["a number", "12345"],
      ["a UUID of another version", "3f0c2a52-6f7b-1d53-9a55-0d5f1b9f3c11"],
      ["a UUID cut short", "3f0c2a52-6f7b-4d53-9a55"],
      ["a UUID with something after it", `${crypto.randomUUID()}/edit`],
      ["a UUID with spaces around it", ` ${crypto.randomUUID()} `],
    ])("says no: %s", (_, resultId) => {
      expect(isResultId(resultId)).toBe(false);
    });
  });
});
