import { describe, expect, it } from "vitest";
import { skipQuestion } from "@/utils/survey/questions/skipQuestion";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { closeSessionCheckpoint } from "./closeSessionCheckpoint";
import { showSessionCheckpoint } from "./showSessionCheckpoint";
import { turnSessionCheckpointsOff } from "./turnSessionCheckpointsOff";

describe("showSessionCheckpoint()", () => {
  const survey = createSurvey();

  describe("when a question is done and another is open", () => {
    it("records the card and moves to checkpoints", () => {
      const before = createStartedSession(survey, 2);
      const card = { type: "halfway", minutesLeft: 4 };
      const session = showSessionCheckpoint(survey, before, card);

      expect(session).toEqual({
        ...before,
        phase: "checkpoints",
        checkpointRecord: { cardsShown: [card], timeSamples: [] },
      });
      expect(session.checkpointRecord.cardsShown[0]).toBe(card);
    });

    it("adds a later card after the earlier ones", () => {
      const first = closeSessionCheckpoint(
        survey,
        showSessionCheckpoint(survey, createStartedSession(survey, 1), "first"),
      );
      const second = showSessionCheckpoint(
        survey,
        skipQuestion(survey, first, 2),
        "second",
      );

      expect(second.checkpointRecord.cardsShown).toEqual(["first", "second"]);
      expect(second.checkpointRecord.timeSamples).toEqual([
        { questionId: "q2", seconds: 2 },
      ]);
    });

    it("leaves the session it was handed as it was", () => {
      const before = createStartedSession(survey, 2);

      showSessionCheckpoint(survey, before, "card");

      expect(before.checkpointRecord.cardsShown).toEqual([]);
      expect(before.phase).toBe("questions");
    });
  });

  describe("when the card comes at the wrong moment", () => {
    it("drops a card after the last question", () => {
      const session = createStartedSession(survey, 5);

      expect(showSessionCheckpoint(survey, session, "card")).toBe(session);
    });

    it("drops a card while checkpoints are off", () => {
      const session = turnSessionCheckpointsOff(
        survey,
        createStartedSession(survey, 2),
      );

      expect(showSessionCheckpoint(survey, session, "card")).toBe(session);
    });

    it("drops a card before the first done question", () => {
      const session = createStartedSession(survey);

      expect(showSessionCheckpoint(survey, session, "card")).toBe(session);
    });

    it("drops a card while another card is up", () => {
      const onCard = showSessionCheckpoint(
        survey,
        createStartedSession(survey, 2),
        "first",
      );

      expect(showSessionCheckpoint(survey, onCard, "second")).toBe(onCard);
    });

    it("drops nothing handed in as a card", () => {
      const session = createStartedSession(survey, 2);

      expect(showSessionCheckpoint(survey, session, undefined)).toBe(session);
      expect(showSessionCheckpoint(survey, session, null)).toBe(session);
    });

    it("takes anything else for a card, whatever its shape", () => {
      const session = createStartedSession(survey, 2);

      for (const card of [0, "", false, {}, []]) {
        expect(
          showSessionCheckpoint(survey, session, card).checkpointRecord
            .cardsShown,
        ).toEqual([card]);
      }
    });

    it("drops a card on category select", () => {
      const session = createSession(survey);

      expect(showSessionCheckpoint(survey, session, "card")).toBe(session);
    });
  });
});
