import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RESULT_READ_INTERVAL_MS, RESULT_WAIT_MS } from "@/constants/survey";
import { getResult } from "@/services/api/client/getResult";
import { getSurvey } from "@/services/api/client/getSurvey";
import { ResultLoadStatus, SurveyLoadStatus } from "@/types/survey";
import {
  identityQuizResult,
  identityResultQuiz,
} from "@/utils/result-modules/identityQuizResult.fixtures";
import { createResultLoad } from "@/utils/vitest/survey/createResultLoad";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { ResultsScreenStatus } from "../ResultsScreen.types";
import { loadResultsScreen } from "./loadResultsScreen";
import { toResultsScreenState } from "./toResultsScreenState";

vi.mock("@/services/api/client/getResult");
vi.mock("@/services/api/client/getSurvey");

const RESULT_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";
const SURVEY_ID = identityResultQuiz.id;

const PENDING = createResultLoad({ id: RESULT_ID, surveyId: SURVEY_ID });
const CALCULATED = createResultLoad({
  id: RESULT_ID,
  isCalculated: true,
  surveyId: SURVEY_ID,
  ...identityQuizResult,
});
const SURVEY_READY = {
  status: SurveyLoadStatus.Ready,
  survey: identityResultQuiz,
} as const;

const getResultMock = vi.mocked(getResult);
const getSurveyMock = vi.mocked(getSurvey);

const load = (resultId = RESULT_ID, signal = new AbortController().signal) =>
  loadResultsScreen(resultId, "pl", signal);

// The load, carried through however long its waits are.
const finish = async <State>(loading: Promise<State>): Promise<State> => {
  await vi.advanceTimersByTimeAsync(RESULT_WAIT_MS);

  return loading;
};

describe("loadResultsScreen()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getResultMock.mockResolvedValue(CALCULATED);
    getSurveyMock.mockResolvedValue(SURVEY_READY);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe("given a calculated result of a quiz with result modules", () => {
    it("asks for the result, then for the survey the result names, in the given language", async () => {
      await finish(
        loadResultsScreen(RESULT_ID, "en", new AbortController().signal),
      );

      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(getResultMock).toHaveBeenCalledWith(RESULT_ID, {
        signal: expect.any(AbortSignal),
      });
      expect(getSurveyMock).toHaveBeenCalledTimes(1);
      expect(getSurveyMock).toHaveBeenCalledWith(SURVEY_ID, "en", {
        signal: expect.any(AbortSignal),
      });
      expect(getResultMock.mock.invocationCallOrder[0]).toBeLessThan(
        getSurveyMock.mock.invocationCallOrder[0],
      );
    });

    it("is ready, with the quiz, the result and the resolved modules", async () => {
      expect(await finish(load())).toEqual(
        toResultsScreenState(identityResultQuiz, CALCULATED.result),
      );
      expect((await finish(load())).status).toBe(ResultsScreenStatus.Ready);
    });
  });

  describe("given a result that exists and is not calculated yet", () => {
    it("asks for it again every second, and is ready once it is calculated", async () => {
      getResultMock
        .mockResolvedValueOnce(PENDING)
        .mockResolvedValueOnce(PENDING)
        .mockResolvedValueOnce(CALCULATED);

      const loading = load();

      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS);

      expect(getResultMock).toHaveBeenCalledTimes(2);
      expect(getSurveyMock).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(RESULT_READ_INTERVAL_MS);

      expect((await loading).status).toBe(ResultsScreenStatus.Ready);
      expect(getResultMock).toHaveBeenCalledTimes(3);
      expect(getSurveyMock).toHaveBeenCalledTimes(1);
    });

    it("is not ready when it is still not calculated after 30 seconds, and asks for no survey", async () => {
      getResultMock.mockResolvedValue(PENDING);

      expect(await finish(load())).toEqual({
        status: ResultsScreenStatus.NotReady,
      });
      expect(getSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given a result the API does not have", () => {
    it("is not found, at once, and asks for no survey", async () => {
      getResultMock.mockResolvedValue({ status: ResultLoadStatus.NotFound });

      expect(await finish(load())).toEqual({
        status: ResultsScreenStatus.NotFound,
      });
      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(getSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given an identifier that is not a result identifier in form", () => {
    it.each([
      [""],
      ["wyniki"],
      ["12345"],
      ["3f0c2a52-6f7b-4d53-9a55"],
    ])('is not found, without asking the API: "%s"', async (resultId) => {
      expect(await finish(load(resultId))).toEqual({
        status: ResultsScreenStatus.NotFound,
      });
      expect(getResultMock).not.toHaveBeenCalled();
      expect(getSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given a read of the result that fails", () => {
    it("is failed, at once", async () => {
      getResultMock.mockResolvedValue({ status: ResultLoadStatus.Failed });

      expect(await finish(load())).toEqual({
        status: ResultsScreenStatus.Failed,
      });
      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(getSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given a survey that cannot be read", () => {
    it.each([
      ["it is gone, or no longer public", SurveyLoadStatus.NotFound],
      ["the read failed", SurveyLoadStatus.Failed],
    ] as const)("is failed: %s", async (_, status) => {
      getSurveyMock.mockResolvedValue({ status });

      expect(await finish(load())).toEqual({
        status: ResultsScreenStatus.Failed,
      });
    });

    it("is failed when the result names no survey, and asks for none", async () => {
      getResultMock.mockResolvedValue(
        createResultLoad({ id: RESULT_ID, isCalculated: true }),
      );

      expect(await finish(load())).toEqual({
        status: ResultsScreenStatus.Failed,
      });
      expect(getSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given a quiz with no result modules", () => {
    it("is not configured, and keeps the quiz", async () => {
      const survey = createSurvey({ id: SURVEY_ID });

      getSurveyMock.mockResolvedValue({
        status: SurveyLoadStatus.Ready,
        survey,
      });

      expect(await finish(load())).toEqual({
        status: ResultsScreenStatus.NotConfigured,
        survey,
      });
    });
  });

  describe("when the loading is left", () => {
    it("cancels the read of the result that is on its way", async () => {
      getResultMock.mockResolvedValue(PENDING);

      const controller = new AbortController();
      const loading = load(RESULT_ID, controller.signal);
      const signal = getResultMock.mock.calls[0][1]?.signal;

      controller.abort();
      await finish(loading);

      expect(signal?.aborted).toBe(true);
      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    it("hands its signal to the read of the survey", async () => {
      const controller = new AbortController();

      await finish(load(RESULT_ID, controller.signal));

      expect(getSurveyMock).toHaveBeenCalledWith(SURVEY_ID, "pl", {
        signal: controller.signal,
      });
    });
  });
});
