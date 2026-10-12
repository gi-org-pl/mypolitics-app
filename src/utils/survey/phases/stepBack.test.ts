import { describe, expect, it } from "vitest";

import { SurveyResultState, type SurveySession } from "@/types/survey";
import { setSessionCategories } from "@/utils/survey/categories/setSessionCategories";
import { closeSessionCheckpoint } from "@/utils/survey/checkpoints/closeSessionCheckpoint";
import { showSessionCheckpoint } from "@/utils/survey/checkpoints/showSessionCheckpoint";
import { leaveSessionDemographics } from "@/utils/survey/demographics/leaveSessionDemographics";
import { setSessionDemographics } from "@/utils/survey/demographics/setSessionDemographics";
import { setSessionEmail } from "@/utils/survey/email-capture/setSessionEmail";
import { answerQuestion } from "@/utils/survey/questions/answerQuestion";
import { skipQuestion } from "@/utils/survey/questions/skipQuestion";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";
import { stepBack } from "./stepBack";

const EMAIL_ON = { isEmailSendingSetUp: true };

describe("stepBack()", () => {
  const survey = createSurvey();

  describe("when there is nothing to step back to", () => {
    it("cannot step back on category select, on the first question, on a card or in results calculation", () => {
      const onCategorySelect = setSessionCategories(
        survey,
        createSession(survey),
        ["economy"],
      );
      const onFirstQuestion = createStartedSession(survey);
      const onCard = showSessionCheckpoint(
        survey,
        createStartedSession(survey, 2),
        "card",
      );
      const calculating = leaveSessionDemographics(
        survey,
        createStartedSession(survey, 5),
        false,
        { isEmailSendingSetUp: false },
      );
      const failed: SurveySession = {
        ...calculating,
        resultState: SurveyResultState.Failed,
      };
      const onShortResults: SurveySession = {
        ...calculating,
        phase: "short-results",
      };

      expect(stepBack(survey, onCategorySelect)).toBe(onCategorySelect);
      expect(stepBack(survey, onFirstQuestion)).toBe(onFirstQuestion);
      expect(stepBack(survey, onCard)).toBe(onCard);
      expect(stepBack(survey, calculating)).toBe(calculating);
      expect(stepBack(survey, failed)).toBe(failed);
      expect(stepBack(survey, onShortResults)).toBe(onShortResults);
    });
  });

  describe("when a question is done", () => {
    it("removes the last entry and its time sample", () => {
      const first = answerQuestion(
        survey,
        createStartedSession(survey),
        "q1-agree",
        3,
      );
      const second = answerQuestion(survey, first, "q2-coal", 5);
      const session = stepBack(survey, second);

      expect(session.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
      expect(session.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 3 },
      ]);
      expect(session.phase).toBe("questions");
      expect(session).toEqual(first);
    });

    it("leads back to the first question and no further, with or without category select", () => {
      const withOne = createSurvey({
        categories: [createSurveyCategory("only")],
      });

      for (const quiz of [survey, withOne]) {
        const onFirstQuestion = stepBack(quiz, createStartedSession(quiz, 1));

        expect(onFirstQuestion.phase).toBe("questions");
        expect(onFirstQuestion.entries).toEqual([]);
        expect(stepBack(quiz, onFirstQuestion)).toBe(onFirstQuestion);
      }
    });

    it("removes a skip the same way", () => {
      const start = createStartedSession(survey);
      const first = skipQuestion(survey, start, 3);
      const second = skipQuestion(survey, first, 5);

      expect(stepBack(survey, second)).toEqual(first);
      expect(stepBack(survey, stepBack(survey, second))).toEqual(start);
    });

    it("leaves the session it was handed as it was", () => {
      const before = createStartedSession(survey, 2);

      stepBack(survey, before);

      expect(before.entries).toHaveLength(2);
    });
  });

  describe("when the session is on demographics", () => {
    it("returns from demographics to the last question and keeps the picked values", () => {
      const done = skipQuestion(survey, createStartedSession(survey, 4), 6);
      const picked = setSessionDemographics(survey, done, {
        age: "30",
        gender: "male",
      });
      const session = stepBack(survey, picked);

      expect(session.phase).toBe("questions");
      expect(session.entries).toHaveLength(4);
      expect(session.checkpointRecord.timeSamples).toEqual([]);
      expect(session.demographics).toEqual({ age: "30", gender: "male" });
    });

    it("brings the taker back with the same values after the question is answered again", () => {
      const picked = setSessionDemographics(
        survey,
        createStartedSession(survey, 5),
        { age: "30" },
      );
      const session = answerQuestion(
        survey,
        stepBack(survey, picked),
        "q5-state",
      );

      expect(session.phase).toBe("demographics");
      expect(session.demographics).toEqual({ age: "30" });
    });
  });

  describe("when the session is on e-mail capture", () => {
    it("returns from e-mail capture to demographics and keeps the e-mail", () => {
      const picked = setSessionDemographics(
        survey,
        createStartedSession(survey, 5),
        { age: "30" },
      );
      const onEmail = setSessionEmail(
        survey,
        leaveSessionDemographics(survey, picked, false, EMAIL_ON),
        { address: "jan@example.com", hasConsent: true },
      );
      const session = stepBack(survey, onEmail);

      expect(session).toEqual({ ...onEmail, phase: "demographics" });
      expect(session.email).toEqual({
        address: "jan@example.com",
        hasConsent: true,
      });
      expect(session.demographics).toEqual({ age: "30" });
      expect(session.entries).toHaveLength(5);
    });
  });

  describe("when a card was shown", () => {
    it("never removes a shown card", () => {
      const onCard = showSessionCheckpoint(
        survey,
        createStartedSession(survey, 2),
        { id: "card" },
      );
      const afterCard = closeSessionCheckpoint(survey, onCard);
      const session = stepBack(survey, stepBack(survey, afterCard));

      expect(session.entries).toEqual([]);
      expect(session.checkpointRecord.cardsShown).toEqual([{ id: "card" }]);
      expect(session.phase).toBe("questions");
    });
  });
});
