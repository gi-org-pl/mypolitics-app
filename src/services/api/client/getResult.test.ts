import { type AxiosAdapter, AxiosError } from "axios";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { API_TIMEOUT_MS, DEFAULT_API_URL } from "@/constants/api";
import { type ResultLoadResult, ResultLoadStatus } from "@/types/survey";
import { createApiError } from "@/utils/vitest/api/createApiError";
import { createApiReply } from "@/utils/vitest/api/createApiReply";
import { createSurveyResult } from "@/utils/vitest/survey/createSurveyResult";

import { apiClient } from "./apiClient";
import { getResult } from "./getResult";

const RESULT_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";
const SURVEY_ID = "60beb898-a4e4-4160-88c4-07a9931ab499";
const ANSWERS = [{ questionId: "30eb37ca", answerId: "c1646132" }];

const calculation = {
  algorithm: "default",
  calculatedAt: "2026-10-08T10:00:00.000Z",
  orientations: [{ id: "0654e995", points: 10, maxPossible: 20 }],
};

const createResultResponse = (results: unknown): Record<string, unknown> => ({
  id: RESULT_ID,
  surveyId: SURVEY_ID,
  prioritizedCategories: [],
  results,
  answers: ANSWERS,
  createdAt: "2026-10-08T09:59:58.000Z",
  calculatedAt: null,
});

// The result as read before it is calculated, and the same result once it
// is.
const NOT_CALCULATED_RESULT = createSurveyResult({
  id: RESULT_ID,
  surveyId: SURVEY_ID,
  answers: ANSWERS,
});
const NOT_CALCULATED: ResultLoadResult = {
  status: ResultLoadStatus.Ready,
  result: NOT_CALCULATED_RESULT,
};
const CALCULATED: ResultLoadResult = {
  status: ResultLoadStatus.Ready,
  result: {
    ...NOT_CALCULATED_RESULT,
    isCalculated: true,
    scores: { "0654e995": { points: 10, maximum: 20 } },
  },
};
const NOT_FOUND: ResultLoadResult = { status: ResultLoadStatus.NotFound };
const FAILED: ResultLoadResult = { status: ResultLoadStatus.Failed };

// Whether the result a read found is calculated.
const isCalculated = async (): Promise<boolean | undefined> => {
  const load = await getResult(RESULT_ID);

  return load.status === ResultLoadStatus.Ready
    ? load.result.isCalculated
    : undefined;
};

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = apiClient.defaults.adapter;

describe("getResult()", () => {
  beforeEach(() => {
    adapter.mockReset();
    apiClient.defaults.adapter = adapter;
  });

  afterAll(() => {
    apiClient.defaults.adapter = defaultAdapter;
  });

  describe("when called", () => {
    it("asks for the result by its identifier", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(null)),
      );

      await getResult(RESULT_ID);

      expect(adapter).toHaveBeenCalledTimes(1);
      expect(adapter.mock.calls[0][0]).toMatchObject({
        method: "get",
        baseURL: DEFAULT_API_URL,
        url: `/v1/result/${RESULT_ID}`,
        timeout: API_TIMEOUT_MS,
      });
    });

    it("keeps an identifier from changing the address", async () => {
      adapter.mockImplementationOnce(createApiReply(404));

      await getResult("../survey/a b");

      expect(adapter.mock.calls[0][0].url).toBe(
        "/v1/result/..%2Fsurvey%2Fa%20b",
      );
    });

    it("passes the signal and the time limit of the caller on", async () => {
      const { signal } = new AbortController();

      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(null)),
      );

      await getResult(RESULT_ID, { signal, timeoutMs: 4000 });

      expect(adapter.mock.calls[0][0].signal).toBe(signal);
      expect(adapter.mock.calls[0][0].timeout).toBe(4000);
    });
  });

  describe("given a result", () => {
    it("is not calculated when results is null, and names its survey and holds its answers", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(null)),
      );

      expect(await getResult(RESULT_ID)).toEqual(NOT_CALCULATED);
    });

    it("is calculated, with its scores, when results is an object with orientations", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(calculation)),
      );

      expect(await getResult(RESULT_ID)).toEqual(CALCULATED);
    });

    it("is calculated, with its scores, when results is text that holds such an object", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(JSON.stringify(calculation))),
      );

      expect(await getResult(RESULT_ID)).toEqual(CALCULATED);
    });

    it("is calculated when the list of orientations is empty", async () => {
      adapter
        .mockImplementationOnce(
          createApiReply(200, createResultResponse({ orientations: [] })),
        )
        .mockImplementationOnce(
          createApiReply(200, createResultResponse('{"orientations":[]}')),
        );

      expect(await isCalculated()).toBe(true);
      expect(await isCalculated()).toBe(true);
    });

    it.each([
      ["null"],
      [""],
      ["calculated"],
      ["{}"],
      [{}],
      [{ algorithm: "default" }],
      [[]],
      [true],
      [7],
    ])('is not calculated when results is the text "null" or anything else: %j', async (results) => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(results)),
      );

      expect(await getResult(RESULT_ID)).toEqual(NOT_CALCULATED);
    });

    it("returns the identifier it was asked for", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, {
          ...createResultResponse(calculation),
          id: "another-identifier",
        }),
      );

      expect(await getResult(RESULT_ID)).toEqual(CALCULATED);
    });

    it("carries nothing else of the reply", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(calculation)),
      );

      expect(await getResult(RESULT_ID)).toStrictEqual(CALCULATED);
    });

    it("is a result that holds nothing when the reply is an object with nothing of a result in it", async () => {
      adapter.mockImplementationOnce(createApiReply(200, {}));

      expect(await getResult(RESULT_ID)).toEqual({
        status: ResultLoadStatus.Ready,
        result: createSurveyResult({ id: RESULT_ID }),
      });
    });
  });

  describe("given a result the API does not have", () => {
    it("is not found on a 404, without throwing", async () => {
      adapter.mockImplementationOnce(
        createApiReply(404, { message: "Result with given ID does not exist" }),
      );

      await expect(getResult(RESULT_ID)).resolves.toEqual(NOT_FOUND);
      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a failed read", () => {
    it.each([
      ["a 400", createApiReply(400)],
      ["a 500", createApiReply(500)],
      ["no connection", createApiError(AxiosError.ERR_NETWORK)],
      ["no reply in time", createApiError(AxiosError.ETIMEDOUT)],
      ["a reply that is not a result", createApiReply(200, "<html></html>")],
      ["an empty reply", createApiReply(200)],
    ])("is failed, without throwing and without asking again: %s", async (_, reply) => {
      adapter.mockImplementationOnce(reply);

      await expect(getResult(RESULT_ID)).resolves.toEqual(FAILED);
      expect(adapter).toHaveBeenCalledTimes(1);
    });

    it("is failed when the request throws something unexpected", async () => {
      adapter.mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(getResult(RESULT_ID)).resolves.toEqual(FAILED);
    });
  });

  describe("when cancelled", () => {
    it("resolves failed without throwing", async () => {
      const controller = new AbortController();

      adapter.mockImplementationOnce((config) => {
        controller.abort();

        return createApiReply(200, createResultResponse(calculation))(config);
      });

      await expect(
        getResult(RESULT_ID, { signal: controller.signal }),
      ).resolves.toEqual(FAILED);
    });

    it("resolves failed without a request when it was cancelled before", async () => {
      await expect(
        getResult(RESULT_ID, { signal: AbortSignal.abort() }),
      ).resolves.toEqual(FAILED);
      expect(adapter).not.toHaveBeenCalled();
    });
  });

  describe("privacy", () => {
    it("writes nothing to the console, whatever the outcome", async () => {
      const methods = ["log", "info", "warn", "error", "debug"] as const;
      const spies = methods.map((method) =>
        vi.spyOn(console, method).mockImplementation(() => undefined),
      );
      const replies = [
        createApiReply(200, createResultResponse(calculation)),
        createApiReply(404),
        createApiError(AxiosError.ERR_NETWORK),
      ];

      for (const reply of replies) {
        adapter.mockImplementationOnce(reply);

        await getResult(RESULT_ID);
      }

      expect(adapter).toHaveBeenCalledTimes(replies.length);

      for (const spy of spies) {
        expect(spy).not.toHaveBeenCalled();
      }

      vi.restoreAllMocks();
    });
  });
});
