import { describe, expect, it } from "vitest";

import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { getQuestionsLeftInCategory } from "./getQuestionsLeftInCategory";

// The test quiz asks: economy, ecology, economy, hidden, ecology.
describe("getQuestionsLeftInCategory()", () => {
  const survey = createSurvey();

  describe("given a category with open questions", () => {
    it("counts the open questions of the category, the current one included", () => {
      const session = createStartedSession(survey);

      expect(getQuestionsLeftInCategory(survey, session, "economy")).toBe(2);
      expect(getQuestionsLeftInCategory(survey, session, "ecology")).toBe(2);
      expect(getQuestionsLeftInCategory(survey, session, "hidden")).toBe(1);
    });

    it("is 1 on the last question of the category", () => {
      const onLastEconomyQuestion = createStartedSession(survey, 2);
      const onLastQuestion = createStartedSession(survey, 4);

      expect(
        getQuestionsLeftInCategory(survey, onLastEconomyQuestion, "economy"),
      ).toBe(1);
      expect(
        getQuestionsLeftInCategory(survey, onLastQuestion, "ecology"),
      ).toBe(1);
    });

    it("counts across a quiz that mixes its categories", () => {
      const onFirstEcologyQuestion = createStartedSession(survey, 1);

      expect(
        getQuestionsLeftInCategory(survey, onFirstEcologyQuestion, "ecology"),
      ).toBe(2);
      expect(
        getQuestionsLeftInCategory(survey, onFirstEcologyQuestion, "economy"),
      ).toBe(1);
    });
  });

  describe("given a category with no open question", () => {
    it("is 0 for a category with no open question", () => {
      const session = createStartedSession(survey, 3);

      expect(getQuestionsLeftInCategory(survey, session, "economy")).toBe(0);
    });

    it("is 0 for every category once every question is done", () => {
      const session = createStartedSession(survey, 5);

      expect(getQuestionsLeftInCategory(survey, session, "economy")).toBe(0);
      expect(getQuestionsLeftInCategory(survey, session, "ecology")).toBe(0);
      expect(getQuestionsLeftInCategory(survey, session, "hidden")).toBe(0);
    });

    it("is 0 for a category the quiz does not have", () => {
      const session = createStartedSession(survey);

      expect(getQuestionsLeftInCategory(survey, session, "unknown")).toBe(0);
    });
  });
});
