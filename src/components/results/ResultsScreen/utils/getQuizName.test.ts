import { describe, expect, it } from "vitest";

import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyResult } from "@/utils/vitest/survey/createSurveyResult";

import { ResultsScreenStatus } from "../ResultsScreen.types";
import { getQuizName } from "./getQuizName";

const survey = createSurvey({ name: "  Quiz Tożsamościowy " });

describe("getQuizName()", () => {
  describe("given a state in which the quiz is read", () => {
    it("names the quiz of a result that is ready", () => {
      expect(
        getQuizName({
          status: ResultsScreenStatus.Ready,
          survey,
          result: createSurveyResult(),
          resolved: { modules: [] },
        }),
      ).toBe("Quiz Tożsamościowy");
    });

    it("names the quiz that has no result view", () => {
      expect(
        getQuizName({ status: ResultsScreenStatus.NotConfigured, survey }),
      ).toBe("Quiz Tożsamościowy");
    });

    it("has no name for a quiz without one, or with a blank one", () => {
      for (const name of [undefined, "", "  "]) {
        expect(
          getQuizName({
            status: ResultsScreenStatus.NotConfigured,
            survey: createSurvey({ name }),
          }),
        ).toBeUndefined();
      }
    });
  });

  describe("given a state in which no quiz is read", () => {
    it.each([
      [ResultsScreenStatus.Loading],
      [ResultsScreenStatus.NotReady],
      [ResultsScreenStatus.NotFound],
      [ResultsScreenStatus.Failed],
    ] as const)("has no name: %s", (status) => {
      expect(getQuizName({ status })).toBeUndefined();
    });
  });
});
