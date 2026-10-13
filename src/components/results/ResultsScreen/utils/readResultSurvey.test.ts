import { afterEach, describe, expect, it, vi } from "vitest";

import { getSurvey } from "@/services/api/client/getSurvey";
import { SurveyLoadStatus } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyResult } from "@/utils/vitest/survey/createSurveyResult";

import { readResultSurvey } from "./readResultSurvey";

vi.mock("@/services/api/client/getSurvey");

const SURVEY_ID = "60beb898-a4e4-4160-88c4-07a9931ab499";
const RESULT = createSurveyResult({ isCalculated: true, surveyId: SURVEY_ID });

const getSurveyMock = vi.mocked(getSurvey);
const { signal } = new AbortController();

describe("readResultSurvey()", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("given a result that names its survey", () => {
    it("asks for exactly that survey, in the given language", async () => {
      getSurveyMock.mockResolvedValue({ status: SurveyLoadStatus.Failed });

      await readResultSurvey(RESULT, "en", signal);

      expect(getSurveyMock).toHaveBeenCalledTimes(1);
      expect(getSurveyMock).toHaveBeenCalledWith(SURVEY_ID, "en", { signal });
    });

    it("answers with the survey when it is read", async () => {
      const survey = createSurvey({ id: SURVEY_ID });

      getSurveyMock.mockResolvedValue({
        status: SurveyLoadStatus.Ready,
        survey,
      });

      expect(await readResultSurvey(RESULT, "pl", signal)).toBe(survey);
    });

    it.each([
      [SurveyLoadStatus.NotFound],
      [SurveyLoadStatus.Failed],
    ] as const)("answers with nothing when the survey cannot be read: %s", async (status) => {
      getSurveyMock.mockResolvedValue({ status });

      expect(await readResultSurvey(RESULT, "pl", signal)).toBeUndefined();
    });
  });

  describe("given a result that names no survey", () => {
    it("answers with nothing, and asks for nothing", async () => {
      expect(
        await readResultSurvey(
          createSurveyResult({ isCalculated: true }),
          "pl",
          signal,
        ),
      ).toBeUndefined();
      expect(getSurveyMock).not.toHaveBeenCalled();
    });
  });
});
