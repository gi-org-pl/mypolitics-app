import { describe, expect, it } from "vitest";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { showSessionCheckpoint } from "./showSessionCheckpoint";
import { turnSessionCheckpointsOff } from "./turnSessionCheckpointsOff";

describe("turnSessionCheckpointsOff()", () => {
  const survey = createSurvey();

  describe("when a card is up", () => {
    it("turns checkpoints off and returns to questions", () => {
      const onCard = showSessionCheckpoint(
        survey,
        createStartedSession(survey, 2),
        "card",
      );
      const session = turnSessionCheckpointsOff(survey, onCard);

      expect(session).toEqual({
        ...onCard,
        areCheckpointsOff: true,
        phase: "questions",
      });
    });

    it("returns to questions even when checkpoints were off already", () => {
      const session = turnSessionCheckpointsOff(survey, {
        ...createStartedSession(survey, 2),
        phase: "checkpoints",
        areCheckpointsOff: true,
      });

      expect(session.phase).toBe("questions");
      expect(session.areCheckpointsOff).toBe(true);
    });
  });

  describe("when no card is up", () => {
    it("turns checkpoints off and stays in the phase it was in", () => {
      const onCategorySelect = createSession(survey);
      const onQuestions = createStartedSession(survey, 2);
      const onDemographics = createStartedSession(survey, 5);

      expect(turnSessionCheckpointsOff(survey, onCategorySelect)).toEqual({
        ...onCategorySelect,
        areCheckpointsOff: true,
      });
      expect(turnSessionCheckpointsOff(survey, onQuestions)).toEqual({
        ...onQuestions,
        areCheckpointsOff: true,
      });
      expect(turnSessionCheckpointsOff(survey, onDemographics)).toEqual({
        ...onDemographics,
        areCheckpointsOff: true,
      });
    });
  });

  describe("when checkpoints are off already", () => {
    it("changes nothing", () => {
      const session = turnSessionCheckpointsOff(
        survey,
        createStartedSession(survey, 2),
      );

      expect(turnSessionCheckpointsOff(survey, session)).toBe(session);
    });
  });
});
