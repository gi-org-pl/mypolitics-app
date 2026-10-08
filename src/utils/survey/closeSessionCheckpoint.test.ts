import { describe, expect, it } from "vitest";

import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { closeSessionCheckpoint } from "./closeSessionCheckpoint";
import { getCurrentQuestion } from "./getCurrentQuestion";
import { showSessionCheckpoint } from "./showSessionCheckpoint";

describe("closeSessionCheckpoint()", () => {
  const survey = createSurvey();

  describe("when a card is up", () => {
    it("returns to questions on close", () => {
      const onCard = showSessionCheckpoint(
        survey,
        createStartedSession(survey, 2),
        "card",
      );
      const session = closeSessionCheckpoint(survey, onCard);

      expect(session).toEqual({ ...onCard, phase: "questions" });
      expect(getCurrentQuestion(survey, session)?.id).toBe("q3");
    });

    it("keeps the card on record", () => {
      const session = closeSessionCheckpoint(
        survey,
        showSessionCheckpoint(survey, createStartedSession(survey, 2), "card"),
      );

      expect(session.checkpointRecord.cardsShown).toEqual(["card"]);
    });
  });

  describe("when no card is up", () => {
    it("changes nothing", () => {
      const onQuestions = createStartedSession(survey, 2);
      const onDemographics = createStartedSession(survey, 5);

      expect(closeSessionCheckpoint(survey, onQuestions)).toBe(onQuestions);
      expect(closeSessionCheckpoint(survey, onDemographics)).toBe(
        onDemographics,
      );
    });
  });
});
