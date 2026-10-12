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
