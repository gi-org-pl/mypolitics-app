import { type AxiosAdapter, AxiosError } from "axios";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { API_TIMEOUT_MS, DEFAULT_API_URL } from "@/constants/api";
import { createApiError } from "@/utils/vitest/api/createApiError";
import { createApiReply } from "@/utils/vitest/api/createApiReply";

import { apiClient } from "./apiClient";
import { getResult } from "./getResult";

const RESULT_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";

const calculation = {
  algorithm: "default",
  calculatedAt: "2026-10-08T10:00:00.000Z",
  orientations: [{ id: "0654e995", points: 10, maxPossible: 20 }],
};

const createResultResponse = (results: unknown): Record<string, unknown> => ({
  id: RESULT_ID,
  surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
  prioritizedCategories: [],
  results,
  answers: [{ questionId: "30eb37ca", answerId: "c1646132" }],
  createdAt: "2026-10-08T09:59:58.000Z",
  calculatedAt: null,
});

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
    it("is not calculated when results is null", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(null)),
      );

      expect(await getResult(RESULT_ID)).toEqual({
        id: RESULT_ID,
        isCalculated: false,
      });
    });

    it("is calculated when results is an object with orientations", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(calculation)),
      );

      expect(await getResult(RESULT_ID)).toEqual({
        id: RESULT_ID,
        isCalculated: true,
      });
    });

    it("is calculated when results is text that holds such an object", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(JSON.stringify(calculation))),
      );

      expect((await getResult(RESULT_ID)).isCalculated).toBe(true);
    });

    it("is calculated when the list of orientations is empty", async () => {
      adapter
        .mockImplementationOnce(
          createApiReply(200, createResultResponse({ orientations: [] })),
        )
        .mockImplementationOnce(
          createApiReply(200, createResultResponse('{"orientations":[]}')),
        );

      expect((await getResult(RESULT_ID)).isCalculated).toBe(true);
      expect((await getResult(RESULT_ID)).isCalculated).toBe(true);
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

      expect(await getResult(RESULT_ID)).toEqual({
        id: RESULT_ID,
        isCalculated: false,
      });
    });

    it("returns the identifier it was asked for", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, {
          ...createResultResponse(calculation),
          id: "another-identifier",
        }),
      );

      expect(await getResult(RESULT_ID)).toEqual({
        id: RESULT_ID,
        isCalculated: true,
      });
    });

    it("carries nothing else of the reply", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, createResultResponse(calculation)),
      );

      expect(Object.keys(await getResult(RESULT_ID)).sort()).toEqual([
        "id",
        "isCalculated",
      ]);
    });
  });

  describe("given a failed read", () => {
    it.each([
      ["a 404", createApiReply(404, { message: "Result does not exist" })],
      ["a 400", createApiReply(400)],
      ["a 500", createApiReply(500)],
      ["no connection", createApiError(AxiosError.ERR_NETWORK)],
      ["no reply in time", createApiError(AxiosError.ETIMEDOUT)],
      ["a reply that is not a result", createApiReply(200, "<html></html>")],
      ["an empty reply", createApiReply(200)],
    ])("is not calculated on 404 and on any failed read, without throwing: %s", async (_, reply) => {
      adapter.mockImplementationOnce(reply);

      await expect(getResult(RESULT_ID)).resolves.toEqual({
        id: RESULT_ID,
        isCalculated: false,
      });
      expect(adapter).toHaveBeenCalledTimes(1);
    });

    it("is not calculated when the request throws something unexpected", async () => {
      adapter.mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(getResult(RESULT_ID)).resolves.toEqual({
        id: RESULT_ID,
        isCalculated: false,
      });
    });
  });

  describe("when cancelled", () => {
    it("resolves not calculated without throwing", async () => {
      const controller = new AbortController();

      adapter.mockImplementationOnce((config) => {
        controller.abort();

        return createApiReply(200, createResultResponse(calculation))(config);
      });

      await expect(
        getResult(RESULT_ID, { signal: controller.signal }),
      ).resolves.toEqual({ id: RESULT_ID, isCalculated: false });
    });

    it("resolves not calculated without a request when it was cancelled before", async () => {
      await expect(
        getResult(RESULT_ID, { signal: AbortSignal.abort() }),
      ).resolves.toEqual({ id: RESULT_ID, isCalculated: false });
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
