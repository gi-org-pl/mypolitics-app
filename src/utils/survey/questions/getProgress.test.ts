import { describe, expect, it } from "vitest";
import { setSessionCategories } from "@/utils/survey/categories/setSessionCategories";
import { closeSessionCheckpoint } from "@/utils/survey/checkpoints/closeSessionCheckpoint";
import { showSessionCheckpoint } from "@/utils/survey/checkpoints/showSessionCheckpoint";
import { leaveSessionDemographics } from "@/utils/survey/demographics/leaveSessionDemographics";
import { leaveSessionEmailCapture } from "@/utils/survey/email-capture/leaveSessionEmailCapture";
import { stepBack } from "@/utils/survey/phases/stepBack";
import { createSession } from "@/utils/survey/session/createSession";
import { resetSession } from "@/utils/survey/session/resetSession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { answerQuestion } from "./answerQuestion";
import { getProgress } from "./getProgress";
import { skipQuestion } from "./skipQuestion";

describe("getProgress()", () => {
  const survey = createSurvey();

  describe("when questions are done", () => {
    it("counts an answer and a skip alike", () => {
      const answered = answerQuestion(
        survey,
        createStartedSession(survey),
        "q1-agree",
      );
      const skipped = skipQuestion(survey, answered);

      expect(getProgress(survey, answered)).toEqual({ done: 1, all: 5 });
      expect(getProgress(survey, skipped)).toEqual({ done: 2, all: 5 });
    });

    it("has done equal to all after the last question", () => {
      expect(getProgress(survey, createStartedSession(survey, 5))).toEqual({
        done: 5,
        all: 5,
      });
    });
  });

  describe("when the taker steps back", () => {
    it("shrinks by one after a step back", () => {
      const session = stepBack(survey, createStartedSession(survey, 3));

      expect(getProgress(survey, session)).toEqual({ done: 2, all: 5 });
    });
  });

  describe("when anything else happens", () => {
    it("does not change with picked categories, a card or a closing phase", () => {
      const picking = setSessionCategories(survey, createSession(survey), [
        "economy",
      ]);
      const onCard = showSessionCheckpoint(
        survey,
        createStartedSession(survey, 2),
        { id: "card" },
      );
      const afterCard = closeSessionCheckpoint(survey, onCard);
      const onEmail = leaveSessionDemographics(
        survey,
        createStartedSession(survey, 5),
        false,
        { isEmailSendingSetUp: true },
      );
      const calculating = leaveSessionEmailCapture(survey, onEmail, false);

      expect(getProgress(survey, picking)).toEqual({ done: 0, all: 5 });
      expect(getProgress(survey, onCard)).toEqual({ done: 2, all: 5 });
      expect(getProgress(survey, afterCard)).toEqual({ done: 2, all: 5 });
      expect(getProgress(survey, onEmail)).toEqual({ done: 5, all: 5 });
      expect(getProgress(survey, calculating)).toEqual({ done: 5, all: 5 });
    });
  });

  describe("when the session is reset", () => {
    it("is zero after a reset", () => {
      const session = resetSession(survey, createStartedSession(survey, 3));

      expect(getProgress(survey, session)).toEqual({ done: 0, all: 5 });
    });
  });
});
