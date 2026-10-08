import { describe, expect, it } from "vitest";

import type { SurveyResultState, SurveySession } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { canStepBack } from "./canStepBack";
import { createSession } from "./createSession";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { setSessionTopics } from "./setSessionTopics";
import { showSessionCheckpoint } from "./showSessionCheckpoint";

const RESULT_STATES: SurveyResultState[] = [
  "not-sent",
  "sending",
  "created",
  "calculated",
  "failed",
];

describe("canStepBack()", () => {
  const survey = createSurvey();
  const onDemographics = createStartedSession(survey, 5);

  describe("given a phase with something behind it", () => {
    it("can step back on a question once one is done", () => {
      expect(canStepBack(createStartedSession(survey, 1))).toBe(true);
      expect(canStepBack(createStartedSession(survey, 4))).toBe(true);
    });

    it("can step back on demographics and on e-mail capture", () => {
      const onEmail = leaveSessionDemographics(survey, onDemographics, false, {
        isEmailSendingSetUp: true,
      });

      expect(onEmail.phase).toBe("email-capture");
      expect(canStepBack(onDemographics)).toBe(true);
      expect(canStepBack(onEmail)).toBe(true);
    });
  });

  describe("given a phase with nothing to go back to", () => {
    it("cannot step back on category select, on the first question, on a card or in results calculation", () => {
      const onCategorySelect = setSessionTopics(survey, createSession(survey), [
        "economy",
      ]);
      const onCard = showSessionCheckpoint(
        survey,
        createStartedSession(survey, 2),
        "card",
      );
      const calculating = leaveSessionDemographics(
        survey,
        onDemographics,
        false,
        { isEmailSendingSetUp: false },
      );

      expect(onCard.phase).toBe("checkpoints");
      expect(calculating.phase).toBe("results-calculation");
      expect(canStepBack(onCategorySelect)).toBe(false);
      expect(canStepBack(createStartedSession(survey))).toBe(false);
      expect(canStepBack(onCard)).toBe(false);
      expect(canStepBack(calculating)).toBe(false);
    });

    it("cannot step back from results calculation in any result state", () => {
      for (const resultState of RESULT_STATES) {
        const session: SurveySession = {
          ...onDemographics,
          phase: "results-calculation",
          resultState,
        };

        expect(canStepBack(session)).toBe(false);
      }
    });

    it("cannot step back from short results", () => {
      expect(canStepBack({ ...onDemographics, phase: "short-results" })).toBe(
        false,
      );
    });
  });
});
