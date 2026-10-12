import { describe, expect, it } from "vitest";

import { SurveyResultState } from "@/types/survey";
import { leaveSessionDemographics } from "@/utils/survey/demographics/leaveSessionDemographics";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { setSessionResultState } from "./setSessionResultState";

const RESULT_STATES: SurveyResultState[] = [
  SurveyResultState.Sending,
  SurveyResultState.Created,
  SurveyResultState.Calculated,
  SurveyResultState.Failed,
  SurveyResultState.NotSent,
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
      expect(
        setSessionResultState(survey, calculating, SurveyResultState.Sending),
      ).toEqual({
        ...calculating,
        resultState: SurveyResultState.Sending,
      });
    });

    it("changes nothing when the state is the one it has", () => {
      expect(
        setSessionResultState(survey, calculating, SurveyResultState.NotSent),
      ).toBe(calculating);
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing", () => {
      const onQuestions = createStartedSession(survey, 2);

      expect(
        setSessionResultState(survey, onQuestions, SurveyResultState.Failed),
      ).toBe(onQuestions);
      expect(
        setSessionResultState(
          survey,
          onDemographics,
          SurveyResultState.Created,
        ),
      ).toBe(onDemographics);
    });
  });
});
