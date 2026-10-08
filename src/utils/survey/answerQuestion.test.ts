import { describe, expect, it } from "vitest";

import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { answerQuestion } from "./answerQuestion";
import { createSession } from "./createSession";
import { showSessionCheckpoint } from "./showSessionCheckpoint";

describe("answerQuestion()", () => {
  const survey = createSurvey();

  describe("when the current question has the answer", () => {
    it("adds an entry with the answer", () => {
      const first = answerQuestion(
        survey,
        createStartedSession(survey),
        "q1-strongly-agree",
      );
      const second = answerQuestion(survey, first, "q2-nuclear");

      expect(first.entries).toEqual([
        { questionId: "q1", answerId: "q1-strongly-agree" },
      ]);
      expect(second.entries).toEqual([
        { questionId: "q1", answerId: "q1-strongly-agree" },
        { questionId: "q2", answerId: "q2-nuclear" },
      ]);
      expect(second.phase).toBe("questions");
    });

    it("stores the seconds as the time sample of the question, and no sample without them", () => {
      const timed = answerQuestion(
        survey,
        createStartedSession(survey),
        "q1-agree",
        7.25,
      );
      const untimed = answerQuestion(survey, timed, "q2-coal");
      const badlyTimed = answerQuestion(survey, untimed, "q3-agree", -3);

      expect(timed.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 7.25 },
      ]);
      expect(untimed.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 7.25 },
      ]);
      expect(badlyTimed.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 7.25 },
      ]);
      expect(badlyTimed.entries).toHaveLength(3);
    });

    it("moves to demographics after the last question", () => {
      const session = answerQuestion(
        survey,
        createStartedSession(survey, 4),
        "q5-state",
      );

      expect(session.phase).toBe("demographics");
      expect(session.entries.at(-1)).toEqual({
        questionId: "q5",
        answerId: "q5-state",
      });
    });
  });

  describe("when the current question does not have the answer", () => {
    it("ignores an answer the current question does not have", () => {
      const session = createStartedSession(survey);

      expect(answerQuestion(survey, session, "q2-coal")).toBe(session);
      expect(answerQuestion(survey, session, "unknown")).toBe(session);
      expect(answerQuestion(survey, session, "")).toBe(session);
    });

    it("takes a second press on the same answer for no answer to the next question", () => {
      const answered = answerQuestion(
        survey,
        createStartedSession(survey),
        "q1-agree",
      );

      expect(answerQuestion(survey, answered, "q1-agree")).toBe(answered);
    });
  });

  describe("when the session is not on the questions", () => {
    it("changes nothing outside the questions phase", () => {
      const onCategorySelect = createSession(survey);
      const onCard = showSessionCheckpoint(
        survey,
        createStartedSession(survey, 1),
        "card",
      );
      const onDemographics = createStartedSession(survey, 5);

      expect(answerQuestion(survey, onCategorySelect, "q1-agree")).toBe(
        onCategorySelect,
      );
      expect(answerQuestion(survey, onCard, "q2-coal")).toBe(onCard);
      expect(answerQuestion(survey, onDemographics, "q5-state")).toBe(
        onDemographics,
      );
    });
  });
});
