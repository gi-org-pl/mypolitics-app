import { describe, expect, it } from "vitest";
import { showSessionCheckpoint } from "@/utils/survey/checkpoints/showSessionCheckpoint";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { skipQuestion } from "./skipQuestion";

describe("skipQuestion()", () => {
  const survey = createSurvey();

  describe("when a question is open", () => {
    it("adds an entry with a skip", () => {
      const session = skipQuestion(survey, createStartedSession(survey));

      expect(session.entries).toEqual([{ questionId: "q1" }]);
      expect(session.entries[0]).not.toHaveProperty("answerId");
      expect(session.phase).toBe("questions");
    });

    it("stores the seconds as the time sample of the question, and no sample without them", () => {
      const timed = skipQuestion(survey, createStartedSession(survey), 2);
      const untimed = skipQuestion(survey, timed);
      const badlyTimed = skipQuestion(survey, untimed, Number.NaN);

      expect(timed.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 2 },
      ]);
      expect(badlyTimed.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 2 },
      ]);
      expect(badlyTimed.entries).toHaveLength(3);
    });

    it("moves to demographics after the last question", () => {
      const session = skipQuestion(survey, createStartedSession(survey, 4));

      expect(session.phase).toBe("demographics");
      expect(session.entries).toHaveLength(5);
    });

    it("lets the taker skip every question", () => {
      const session = createStartedSession(survey, 5);

      expect(
        session.entries.every(({ answerId }) => answerId === undefined),
      ).toBe(true);
      expect(session.phase).toBe("demographics");
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

      expect(skipQuestion(survey, onCategorySelect)).toBe(onCategorySelect);
      expect(skipQuestion(survey, onCard)).toBe(onCard);
      expect(skipQuestion(survey, onDemographics)).toBe(onDemographics);
    });
  });

  describe("when no question is open", () => {
    it("changes nothing", () => {
      const session = {
        ...createStartedSession(survey, 5),
        phase: "questions" as const,
      };

      expect(skipQuestion(survey, session)).toBe(session);
    });
  });
});
