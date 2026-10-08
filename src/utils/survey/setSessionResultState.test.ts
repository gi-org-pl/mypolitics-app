import { describe, expect, it } from "vitest";

import type { SurveyResultState } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { setSessionResultState } from "./setSessionResultState";

const RESULT_STATES: SurveyResultState[] = [
  "sending",
  "created",
  "calculated",
  "failed",
  "not-sent",
];

describe("setSessionResultState()", () => {
  const survey = createSurvey();
  const onDemographics = createStartedSession(survey, 5);
  const calculating = leaveSessionDemographics(survey, onDemographics, false, {
    isEmailSendingSetUp: false,
  });

  describe("when the session is in results calculation", () => {
    it("records every result state it is handed", () => {
      let session = calculating;

      for (const resultState of RESULT_STATES) {
        session = setSessionResultState(survey, session, resultState);

        expect(session.resultState).toBe(resultState);
        expect(session.phase).toBe("results-calculation");
      }
    });

    it("changes nothing else of the session", () => {
      expect(setSessionResultState(survey, calculating, "sending")).toEqual({
        ...calculating,
        resultState: "sending",
      });
    });

    it("changes nothing when the state is the one it has", () => {
      expect(setSessionResultState(survey, calculating, "not-sent")).toBe(
        calculating,
      );
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing", () => {
      const onQuestions = createStartedSession(survey, 2);

      expect(setSessionResultState(survey, onQuestions, "failed")).toBe(
        onQuestions,
      );
      expect(setSessionResultState(survey, onDemographics, "created")).toBe(
        onDemographics,
      );
    });
  });
});
