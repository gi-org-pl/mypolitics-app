import { describe, expect, it } from "vitest";
import { createSession } from "@/utils/survey/session/createSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { setSessionCategories } from "./setSessionCategories";
import { skipSessionCategories } from "./skipSessionCategories";

describe("skipSessionCategories()", () => {
  const survey = createSurvey();

  describe("when the session is on category select", () => {
    it("empties the picked categories on skip and moves to questions", () => {
      const picked = setSessionCategories(survey, createSession(survey), [
        "ecology",
      ]);
      const session = skipSessionCategories(survey, picked);

      expect(session).toEqual({
        ...picked,
        prioritizedCategoryIds: [],
        areCategoriesConfirmed: true,
        phase: "questions",
      });
    });

    it("works with no category picked", () => {
      const session = skipSessionCategories(survey, createSession(survey));

      expect(session.phase).toBe("questions");
      expect(session.areCategoriesConfirmed).toBe(true);
      expect(session.prioritizedCategoryIds).toEqual([]);
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing outside category select", () => {
      const skipped = skipSessionCategories(survey, createSession(survey));

      expect(skipSessionCategories(survey, skipped)).toBe(skipped);
    });
  });
});
