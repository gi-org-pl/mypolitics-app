import { describe, expect, it } from "vitest";

import { PATHS } from "./paths";

describe("PATHS.quiz()", () => {
  describe("given a slug", () => {
    it("returns the address of a quiz", () => {
      expect(PATHS.quiz("mypolitics")).toBe("/quizzes/mypolitics");
      expect(PATHS.quiz("prezydencki2025")).toBe("/quizzes/prezydencki2025");
    });

    it("leaves the letter case of the slug as it is", () => {
      expect(PATHS.quiz("MyPolitics")).toBe("/quizzes/MyPolitics");
    });

    it("puts the quiz under the address of the quizzes", () => {
      expect(PATHS.quiz("mypolitics")).toBe(`${PATHS.quizzes}/mypolitics`);
    });
  });

  describe("given a slug with characters an address gives a meaning to", () => {
    it("keeps them from changing the address", () => {
      expect(PATHS.quiz("a/b?c#d e")).toBe("/quizzes/a%2Fb%3Fc%23d%20e");
    });
  });
});

describe("PATHS.result()", () => {
  describe("given a result identifier", () => {
    it("returns the address of a result", () => {
      expect(PATHS.result("3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11")).toBe(
        "/results/3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11",
      );
    });
  });

  describe("given an identifier with characters an address gives a meaning to", () => {
    it("keeps them from changing the address", () => {
      expect(PATHS.result("a/b?c#d e")).toBe("/results/a%2Fb%3Fc%23d%20e");
    });
  });
});
