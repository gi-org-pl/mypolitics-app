import { describe, expect, it } from "vitest";

import {
  identityQuizResult,
  identityResultQuiz,
} from "@/utils/result-modules/identityQuizResult.fixtures";
import { resolveResult } from "@/utils/result-modules/resolveResult";
import { createResultModule } from "@/utils/vitest/results/createResultModule";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyResult } from "@/utils/vitest/survey/createSurveyResult";

import { ResultsScreenStatus } from "../ResultsScreen.types";
import { toResultsScreenState } from "./toResultsScreenState";

const identityResult = createSurveyResult({
  id: "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11",
  isCalculated: true,
  surveyId: identityResultQuiz.id,
  ...identityQuizResult,
});

describe("toResultsScreenState()", () => {
  describe("given a quiz with result modules and a result of it", () => {
    it("is ready, with the quiz, the result and what the modules are given", () => {
      expect(toResultsScreenState(identityResultQuiz, identityResult)).toEqual({
        status: ResultsScreenStatus.Ready,
        survey: identityResultQuiz,
        result: identityResult,
        resolved: resolveResult(identityResultQuiz, identityResult),
      });
    });

    it("hands the quiz and the result over as they are", () => {
      const state = toResultsScreenState(identityResultQuiz, identityResult);

      expect(state).toMatchObject({ status: ResultsScreenStatus.Ready });
      expect("result" in state && state.result).toBe(identityResult);
      expect("survey" in state && state.survey).toBe(identityResultQuiz);
    });
  });

  describe("given a result with no answers and no scores", () => {
    it("is ready: the header shows no match and the modules have no value", () => {
      const state = toResultsScreenState(
        identityResultQuiz,
        createSurveyResult({ isCalculated: true }),
      );

      expect(state.status).toBe(ResultsScreenStatus.Ready);
      expect("resolved" in state && state.resolved.header).toEqual({
        lowMatch: "named",
        lowMatchLabel: expect.any(String),
      });
      expect("resolved" in state && state.resolved.leader).toBeUndefined();
    });
  });

  describe("given a quiz whose only record is a header that leads to no one", () => {
    it("is ready: the header is always drawn", () => {
      const survey = createSurvey({
        resultModules: [createResultModule("header", "header")],
      });

      expect(toResultsScreenState(survey, createSurveyResult()).status).toBe(
        ResultsScreenStatus.Ready,
      );
    });
  });

  describe("given a quiz with no result modules", () => {
    it("is not configured, and keeps the quiz", () => {
      const survey = createSurvey();

      expect(toResultsScreenState(survey, identityResult)).toEqual({
        status: ResultsScreenStatus.NotConfigured,
        survey,
      });
    });
  });

  describe("given a quiz with no header and no module that can be drawn", () => {
    it("is not configured: there is nothing to draw", () => {
      const survey = createSurvey({
        resultModules: [
          createResultModule("traits", "traits", { orientationIds: ["gone"] }),
        ],
      });

      expect(toResultsScreenState(survey, identityResult)).toEqual({
        status: ResultsScreenStatus.NotConfigured,
        survey,
      });
    });
  });
});
