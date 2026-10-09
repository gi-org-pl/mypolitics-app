import { describe, expect, it } from "vitest";

import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { answerQuestion } from "./answerQuestion";
import { closeSessionCheckpoint } from "./closeSessionCheckpoint";
import { createSession } from "./createSession";
import { getProgress } from "./getProgress";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { leaveSessionEmailCapture } from "./leaveSessionEmailCapture";
import { resetSession } from "./resetSession";
import { setSessionCategories } from "./setSessionCategories";
import { showSessionCheckpoint } from "./showSessionCheckpoint";
import { skipQuestion } from "./skipQuestion";
import { stepBack } from "./stepBack";

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
    it("does not change with topics, a card or a closing phase", () => {
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
