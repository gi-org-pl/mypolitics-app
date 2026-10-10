import { describe, expect, it } from "vitest";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { getCurrentQuestion } from "./getCurrentQuestion";

describe("getCurrentQuestion()", () => {
  const survey = createSurvey();

  describe("given a session with open questions", () => {
    it("is the first question of a new session", () => {
      expect(getCurrentQuestion(survey, createSession(survey))).toBe(
        survey.questions[0],
      );
    });

    it("is the question after the last entry", () => {
      expect(getCurrentQuestion(survey, createStartedSession(survey, 2))).toBe(
        survey.questions[2],
      );
    });

    it("is the last question when only one is open", () => {
      expect(getCurrentQuestion(survey, createStartedSession(survey, 4))).toBe(
        survey.questions[4],
      );
    });
  });

  describe("given a session with every question done", () => {
    it("is undefined", () => {
      expect(
        getCurrentQuestion(survey, createStartedSession(survey, 5)),
      ).toBeUndefined();
    });
  });
});
