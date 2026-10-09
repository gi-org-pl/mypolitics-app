import { describe, expect, it } from "vitest";
import { SurveyResultState } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { createSession } from "./createSession";

const UUID_V4 =
  /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/;

describe("createSession()", () => {
  describe("given a quiz", () => {
    it("starts in the first phase with a new UUID and nothing recorded", () => {
      const survey = createSurvey();
      const session = createSession(survey);

      expect(session.id).toMatch(UUID_V4);
      expect(session).toEqual({
        id: session.id,
        surveyId: "survey",
        entries: [],
        topicIds: [],
        areTopicsConfirmed: false,
        phase: "category-select",
        areCheckpointsOff: false,
        demographics: {},
        areDemographicsGiven: false,
        checkpointRecord: { cardsShown: [], timeSamples: [] },
        email: null,
        resultState: SurveyResultState.NotSent,
      });
    });

    it("starts on the questions when the quiz has no category select", () => {
      const session = createSession(createSurvey({ categories: [] }));

      expect(session.phase).toBe("questions");
      expect(session.areTopicsConfirmed).toBe(false);
    });

    it("gives two sessions two identifiers", () => {
      const survey = createSurvey();

      expect(createSession(survey).id).not.toBe(createSession(survey).id);
    });

    it("gives two sessions records of their own", () => {
      const survey = createSurvey();
      const first = createSession(survey);
      const second = createSession(survey);

      expect(first.entries).not.toBe(second.entries);
      expect(first.checkpointRecord).not.toBe(second.checkpointRecord);
    });
  });

  describe("given options", () => {
    it("carries checkpoints off when told to", () => {
      const survey = createSurvey();

      expect(
        createSession(survey, { areCheckpointsOff: true }).areCheckpointsOff,
      ).toBe(true);
      expect(
        createSession(survey, { areCheckpointsOff: false }).areCheckpointsOff,
      ).toBe(false);
      expect(createSession(survey, {}).areCheckpointsOff).toBe(false);
    });
  });
});
