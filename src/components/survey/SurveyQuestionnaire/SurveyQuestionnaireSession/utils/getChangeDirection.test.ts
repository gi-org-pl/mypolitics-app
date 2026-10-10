import { describe, expect, it } from "vitest";

import type { SurveyPhase, SurveySession } from "@/types/survey";
import { confirmSessionCategories } from "@/utils/survey/categories/confirmSessionCategories";
import { leaveSessionDemographics } from "@/utils/survey/demographics/leaveSessionDemographics";
import { stepBack } from "@/utils/survey/phases/stepBack";
import { answerQuestion } from "@/utils/survey/questions/answerQuestion";
import { skipQuestion } from "@/utils/survey/questions/skipQuestion";
import { createSession } from "@/utils/survey/session/createSession";
import { resetSession } from "@/utils/survey/session/resetSession";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { getChangeDirection } from "./getChangeDirection";

const survey = createSurvey();
const allDone = survey.questions.length;

const inPhase = (
  session: SurveySession,
  phase: SurveyPhase,
): SurveySession => ({
  ...session,
  phase,
});

describe("getChangeDirection()", () => {
  describe("given a step forwards", () => {
    it("is forwards after an answer", () => {
      const session = createStartedSession(survey, 0);

      expect(
        getChangeDirection(
          session,
          answerQuestion(survey, session, "q1-agree"),
        ),
      ).toBe("forwards");
    });

    it("is forwards after a skip", () => {
      const session = createStartedSession(survey, 1);

      expect(getChangeDirection(session, skipQuestion(survey, session))).toBe(
        "forwards",
      );
    });

    it("is forwards from category select to the first question", () => {
      const session = createSession(survey);

      expect(
        getChangeDirection(session, confirmSessionCategories(survey, session)),
      ).toBe("forwards");
    });

    it("is forwards from the last question to demographics, and on from there", () => {
      const lastQuestion = createStartedSession(survey, allDone - 1);
      const demographics = skipQuestion(survey, lastQuestion);

      expect(demographics.phase).toBe("demographics");
      expect(getChangeDirection(lastQuestion, demographics)).toBe("forwards");
      expect(
        getChangeDirection(
          demographics,
          leaveSessionDemographics(survey, demographics, false),
        ),
      ).toBe("forwards");
    });

    it("is forwards to a card and from a card to the next question", () => {
      const question = createStartedSession(survey, 1);
      const card = inPhase(question, "checkpoints");

      expect(getChangeDirection(question, card)).toBe("forwards");
      expect(getChangeDirection(card, question)).toBe("forwards");
    });
  });

  describe("given a step back", () => {
    it("is backwards from a question to the one before", () => {
      const session = createStartedSession(survey, 2);

      expect(getChangeDirection(session, stepBack(survey, session))).toBe(
        "backwards",
      );
    });

    it("is backwards from demographics to the last question", () => {
      const session = createStartedSession(survey, allDone);

      expect(getChangeDirection(session, stepBack(survey, session))).toBe(
        "backwards",
      );
    });

    it("is backwards from e-mail capture to demographics", () => {
      const session = inPhase(
        createStartedSession(survey, allDone),
        "email-capture",
      );

      expect(getChangeDirection(session, stepBack(survey, session))).toBe(
        "backwards",
      );
    });
  });

  describe("given a new session", () => {
    it("is forwards after a reset, though the first phase comes again", () => {
      const session = createStartedSession(survey, 3);
      const newSession = resetSession(survey, session);

      expect(newSession.id).not.toBe(session.id);
      expect(getChangeDirection(session, newSession)).toBe("forwards");
    });
  });
});
