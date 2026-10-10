import { describe, expect, it } from "vitest";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { confirmSessionCategories } from "./confirmSessionCategories";
import { setSessionCategories } from "./setSessionCategories";

describe("confirmSessionCategories()", () => {
  const survey = createSurvey();

  describe("when a category is picked on category select", () => {
    it("confirms the categories and moves to questions", () => {
      const picked = setSessionCategories(survey, createSession(survey), [
        "ecology",
      ]);
      const session = confirmSessionCategories(survey, picked);

      expect(session).toEqual({
        ...picked,
        areCategoriesConfirmed: true,
        phase: "questions",
      });
      expect(session.prioritizedCategoryIds).toEqual(["ecology"]);
    });

    it("changes nothing when it is called again", () => {
      const confirmed = confirmSessionCategories(
        survey,
        setSessionCategories(survey, createSession(survey), ["ecology"]),
      );

      expect(confirmSessionCategories(survey, confirmed)).toBe(confirmed);
    });
  });

  describe("when no category is picked", () => {
    it("does not confirm with no category picked", () => {
      const session = createSession(survey);

      expect(confirmSessionCategories(survey, session)).toBe(session);
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing outside category select", () => {
      const session = createStartedSession(survey, 2);

      expect(confirmSessionCategories(survey, session)).toBe(session);
    });
  });
});
