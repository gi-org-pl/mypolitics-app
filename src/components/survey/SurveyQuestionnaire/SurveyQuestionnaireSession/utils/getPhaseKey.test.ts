import { describe, expect, it } from "vitest";

import { setSessionCategories } from "@/utils/survey/categories/setSessionCategories";
import { skipSessionCategories } from "@/utils/survey/categories/skipSessionCategories";
import { stepBack } from "@/utils/survey/phases/stepBack";
import { answerQuestion } from "@/utils/survey/questions/answerQuestion";
import { skipQuestion } from "@/utils/survey/questions/skipQuestion";
import { createSession } from "@/utils/survey/session/createSession";
import { resetSession } from "@/utils/survey/session/resetSession";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { getPhaseKey } from "./getPhaseKey";

const survey = createSurvey();

describe("getPhaseKey()", () => {
  describe("given the same phase of the same session", () => {
    it("stays the same when a category is picked", () => {
      const session = createSession(survey);

      expect(
        getPhaseKey(setSessionCategories(survey, session, ["economy"])),
      ).toBe(getPhaseKey(session));
    });

    it("stays the same when a question is answered, skipped or opened again", () => {
      const session = createStartedSession(survey, 1);
      const key = getPhaseKey(session);

      expect(getPhaseKey(answerQuestion(survey, session, "q2-coal"))).toBe(key);
      expect(getPhaseKey(skipQuestion(survey, session))).toBe(key);
      expect(getPhaseKey(stepBack(survey, session))).toBe(key);
    });
  });

  describe("given another phase", () => {
    it("changes when the session moves on to the questions", () => {
      const session = createSession(survey);

      expect(getPhaseKey(skipSessionCategories(survey, session))).not.toBe(
        getPhaseKey(session),
      );
    });

    it("changes when the last question is done", () => {
      const session = createStartedSession(survey, survey.questions.length - 1);

      expect(getPhaseKey(skipQuestion(survey, session))).not.toBe(
        getPhaseKey(session),
      );
    });
  });

  describe("given another session", () => {
    it("changes after a reset, also when the phase is the same", () => {
      const session = createStartedSession(survey, 2);
      const fresh = { ...resetSession(survey, session), phase: session.phase };

      expect(fresh.id).not.toBe(session.id);
      expect(getPhaseKey(fresh)).not.toBe(getPhaseKey(session));
    });
  });
});
