import { describe, expect, it } from "vitest";
import { SurveyResultState } from "@/types/survey";
import { skipSessionCategories } from "@/utils/survey/categories/skipSessionCategories";
import { getCurrentQuestion } from "@/utils/survey/questions/getCurrentQuestion";
import { getProgress } from "@/utils/survey/questions/getProgress";
import { buildResultInput } from "@/utils/survey/result/buildResultInput";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";
import { canReset } from "./canReset";
import { createSession } from "./createSession";

const UUID_V4 =
  /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/;

describe("createSession()", () => {
  const survey = createSurvey();

  describe("given a quiz", () => {
    it("starts in the first phase with a new UUID and nothing recorded", () => {
      const survey = createSurvey();
      const session = createSession(survey);

      expect(session.id).toMatch(UUID_V4);
      expect(session).toEqual({
        id: session.id,
        surveyId: "survey",
        entries: [],
        prioritizedCategoryIds: [],
        areCategoriesConfirmed: false,
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
      expect(session.areCategoriesConfirmed).toBe(false);
    });

    it("starts on the questions when the quiz has one visible category", () => {
      const withOne = createSurvey({
        categories: [
          createSurveyCategory("only"),
          createSurveyCategory("hidden", { isHidden: true }),
        ],
      });
      const session = createSession(withOne);

      expect(session.phase).toBe("questions");
      expect(session.prioritizedCategoryIds).toEqual([]);
    });

    it("starts such a quiz as a skipped category select leaves any other", () => {
      const withOne = createSurvey({
        categories: [createSurveyCategory("only")],
      });
      const started = createSession(withOne);
      const skipped = skipSessionCategories(survey, createSession(survey));

      expect(started.phase).toBe(skipped.phase);
      expect(started.prioritizedCategoryIds).toEqual(
        skipped.prioritizedCategoryIds,
      );
      expect(getCurrentQuestion(withOne, started)).toBe(withOne.questions[0]);
      expect(getProgress(withOne, started)).toEqual(
        getProgress(survey, skipped),
      );
      expect(canReset(started)).toBe(canReset(skipped));
      expect(buildResultInput(withOne, started).prioritizedCategories).toEqual(
        buildResultInput(survey, skipped).prioritizedCategories,
      );
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
