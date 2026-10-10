import { describe, expect, it } from "vitest";

import type { SurveyCheckpointRecord } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { setSessionCheckpointRecord } from "./setSessionCheckpointRecord";
import { showSessionCheckpoint } from "./showSessionCheckpoint";

describe("setSessionCheckpointRecord()", () => {
  const survey = createSurvey();
  const onCard = showSessionCheckpoint(
    survey,
    createStartedSession(survey, 2),
    { card: "puzzle" },
  );
  const record: SurveyCheckpointRecord = {
    cardsShown: [{ card: "puzzle", revealLines: { hit: "line" } }],
    timeSamples: [{ questionId: "q1", seconds: 3 }],
  };

  describe("when it is handed another record", () => {
    it("replaces the checkpoint record and nothing else", () => {
      const session = setSessionCheckpointRecord(survey, onCard, record);

      expect(session).toEqual({ ...onCard, checkpointRecord: record });
      expect(session.checkpointRecord).toBe(record);
      expect(session.phase).toBe("checkpoints");
    });

    it("does not change the session it was given", () => {
      const before = structuredClone(onCard);

      setSessionCheckpointRecord(survey, onCard, record);

      expect(onCard).toEqual(before);
    });

    it("replaces the record in any phase", () => {
      const onQuestions = createStartedSession(survey, 2);

      expect(
        setSessionCheckpointRecord(survey, onQuestions, record)
          .checkpointRecord,
      ).toBe(record);
    });
  });

  describe("when it is handed the record the session holds", () => {
    it("returns the very session", () => {
      expect(
        setSessionCheckpointRecord(survey, onCard, onCard.checkpointRecord),
      ).toBe(onCard);
    });
  });
});
