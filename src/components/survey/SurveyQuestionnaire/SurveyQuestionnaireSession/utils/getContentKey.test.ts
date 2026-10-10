import { describe, expect, it } from "vitest";
import { SurveyResultState } from "@/types/survey";
import { setSessionCategories } from "@/utils/survey/categories/setSessionCategories";
import { setSessionDemographics } from "@/utils/survey/demographics/setSessionDemographics";
import { answerQuestion } from "@/utils/survey/questions/answerQuestion";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { getContentKey } from "./getContentKey";

const survey = createSurvey();

describe("getContentKey()", () => {
  describe("given the same content", () => {
    it("stays the same when a category is picked", () => {
      const session = createSession(survey);

      expect(
        getContentKey(setSessionCategories(survey, session, ["economy"])),
      ).toBe(getContentKey(session));
    });

    it("stays the same when a field is picked", () => {
      const session = createStartedSession(survey, survey.questions.length);

      expect(
        getContentKey(setSessionDemographics(survey, session, { age: "30" })),
      ).toBe(getContentKey(session));
    });

    it("stays the same when the result state changes", () => {
      const session = createStartedSession(survey, 1);

      expect(
        getContentKey({ ...session, resultState: SurveyResultState.Failed }),
      ).toBe(getContentKey(session));
    });
  });

  describe("given other content", () => {
    it("changes with the question", () => {
      const session = createStartedSession(survey, 0);

      expect(
        getContentKey(answerQuestion(survey, session, "q1-agree")),
      ).not.toBe(getContentKey(session));
    });

    it("changes with the phase", () => {
      const session = createStartedSession(survey, 1);

      expect(getContentKey({ ...session, phase: "checkpoints" })).not.toBe(
        getContentKey(session),
      );
    });

    it("changes with the session", () => {
      expect(getContentKey(createSession(survey))).not.toBe(
        getContentKey(createSession(survey)),
      );
    });
  });
});
