import { describe, expect, it } from "vitest";

import {
  type Survey,
  SurveyResultState,
  type SurveySession,
} from "@/types/survey";
import { confirmSessionCategories } from "@/utils/survey/categories/confirmSessionCategories";
import { setSessionCategories } from "@/utils/survey/categories/setSessionCategories";
import { closeSessionCheckpoint } from "@/utils/survey/checkpoints/closeSessionCheckpoint";
import { showSessionCheckpoint } from "@/utils/survey/checkpoints/showSessionCheckpoint";
import { turnSessionCheckpointsOff } from "@/utils/survey/checkpoints/turnSessionCheckpointsOff";
import { leaveSessionDemographics } from "@/utils/survey/demographics/leaveSessionDemographics";
import { setSessionDemographics } from "@/utils/survey/demographics/setSessionDemographics";
import { setSessionEmail } from "@/utils/survey/email-capture/setSessionEmail";
import { answerQuestion } from "@/utils/survey/questions/answerQuestion";
import { skipQuestion } from "@/utils/survey/questions/skipQuestion";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";
import { createSession } from "./createSession";
import { resetSession } from "./resetSession";

// A session with something in every part: categories, an answer, a time sample, a
// card, demographics and an e-mail.
const createFullSession = (survey: Survey): SurveySession => {
  const confirmed = confirmSessionCategories(
    survey,
    setSessionCategories(survey, createSession(survey), ["economy"]),
  );
  const afterCard = closeSessionCheckpoint(
    survey,
    showSessionCheckpoint(
      survey,
      answerQuestion(survey, confirmed, "q1-agree", 4),
      "card",
    ),
  );
  const onDemographics = survey.questions
    .slice(1)
    .reduce((session) => skipQuestion(survey, session), afterCard);
  const onEmail = leaveSessionDemographics(
    survey,
    setSessionDemographics(survey, onDemographics, {
      age: "42",
      gender: "female",
      residenceAreaSize: "village",
      education: "higher",
    }),
    true,
    { isEmailSendingSetUp: true },
  );

  return setSessionEmail(survey, onEmail, {
    address: "jan@example.com",
    hasConsent: true,
  });
};

describe("resetSession()", () => {
  const survey = createSurvey();

  describe("when the session can be reset", () => {
    it("starts a new session with a new identifier in the first phase", () => {
      const before = createStartedSession(survey, 3);
      const session = resetSession(survey, before);

      expect(session.id).not.toBe(before.id);
      expect(session.surveyId).toBe("survey");
      expect(session.phase).toBe("category-select");
    });

    it("starts on the first question of a quiz without category select", () => {
      const withoutCategorySelect = createSurvey({ categories: [] });
      const session = resetSession(
        withoutCategorySelect,
        createStartedSession(withoutCategorySelect, 2),
      );

      expect(session.phase).toBe("questions");
      expect(session.entries).toEqual([]);
    });

    it("starts on the first question of a quiz with one visible category", () => {
      const withOne = createSurvey({
        categories: [createSurveyCategory("only")],
      });
      const session = resetSession(withOne, createStartedSession(withOne, 2));

      expect(session.phase).toBe("questions");
      expect(session.entries).toEqual([]);
      expect(session.prioritizedCategoryIds).toEqual([]);
    });

    it("clears entries, categories, demographics, the e-mail and the checkpoint record", () => {
      const before = createFullSession(survey);
      const session = resetSession(survey, before);

      expect(before.phase).toBe("email-capture");
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

    it("carries checkpoints off over", () => {
      const optedOut = turnSessionCheckpointsOff(
        survey,
        createStartedSession(survey, 2),
      );

      expect(resetSession(survey, optedOut).areCheckpointsOff).toBe(true);
      expect(
        resetSession(survey, createStartedSession(survey, 2)).areCheckpointsOff,
      ).toBe(false);
    });

    it("starts over after a hand-in that failed", () => {
      const failed: SurveySession = {
        ...createStartedSession(survey, 5),
        phase: "results-calculation",
        resultState: SurveyResultState.Failed,
      };
      const session = resetSession(survey, failed);

      expect(session.id).not.toBe(failed.id);
      expect(session.resultState).toBe(SurveyResultState.NotSent);
      expect(session.phase).toBe("category-select");
    });
  });

  describe("when the session cannot be reset", () => {
    it("changes nothing on category select, on the first question or while the hand-in runs", () => {
      const onCategorySelect = setSessionCategories(
        survey,
        createSession(survey),
        ["economy"],
      );
      const onFirstQuestion = createStartedSession(survey);
      const calculating = leaveSessionDemographics(
        survey,
        createStartedSession(survey, 5),
        false,
        { isEmailSendingSetUp: false },
      );

      expect(resetSession(survey, onCategorySelect)).toBe(onCategorySelect);
      expect(resetSession(survey, onFirstQuestion)).toBe(onFirstQuestion);
      expect(resetSession(survey, calculating)).toBe(calculating);
    });
  });
});
