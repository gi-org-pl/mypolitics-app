import { type AxiosAdapter, AxiosError } from "axios";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { API_TIMEOUT_MS, DEFAULT_API_URL } from "@/constants/api";
import { CreateResultOutcome, type ResultInput } from "@/types/survey";
import { createApiError } from "@/utils/vitest/api/createApiError";
import { createApiReply } from "@/utils/vitest/api/createApiReply";

import { apiClient } from "./apiClient";
import { createResult } from "./createResult";

const input: ResultInput = {
  surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
  sessionId: "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11",
  prioritizedCategories: ["9ccd7638-d271-406b-b412-42bfc2a19d5b"],
  answers: [
    {
      questionId: "30eb37ca-ba31-4fed-9b36-d9915dcb57f1",
      answerId: "c1646132-3eb5-49ac-8b8d-525bc9177baa",
    },
  ],
};

const inputWithDemographics: ResultInput = {
  ...input,
  demographics: {
    gender: "female",
    age: 34,
    residenceAreaSize: "city_below_200k",
    education: "higher",
  },
};

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = apiClient.defaults.adapter;

const getSentBodies = (): unknown[] =>
  adapter.mock.calls.map(([{ data }]) => JSON.parse(String(data)) as unknown);

describe("createResult()", () => {
  beforeEach(() => {
    adapter.mockReset();
    apiClient.defaults.adapter = adapter;
  });

  afterAll(() => {
    apiClient.defaults.adapter = defaultAdapter;
  });

  describe("when called", () => {
    it("posts the input as it is", async () => {
      adapter.mockImplementationOnce(createApiReply(201));

      await createResult(inputWithDemographics);

      expect(adapter.mock.calls[0][0]).toMatchObject({
        method: "post",
        baseURL: DEFAULT_API_URL,
        url: "/v1/result",
      });
      expect(adapter.mock.calls[0][0].headers.getContentType()).toBe(
        "application/json",
      );
      expect(getSentBodies()).toEqual([inputWithDemographics]);
    });

    it("sends no demographics key when the input has none", async () => {
      adapter.mockImplementation(createApiReply(201));

      await createResult(input);
      await createResult({ ...input, demographics: undefined });

      expect(getSentBodies()).toEqual([input, input]);
      expect(getSentBodies()[0]).not.toHaveProperty("demographics");
      expect(getSentBodies()[1]).not.toHaveProperty("demographics");
    });

    it("sends an empty list of categories and of answers as they are", async () => {
      adapter.mockImplementationOnce(createApiReply(201));

      await createResult({ ...input, prioritizedCategories: [], answers: [] });

      expect(getSentBodies()).toEqual([
        {
          surveyId: input.surveyId,
          sessionId: input.sessionId,
          prioritizedCategories: [],
          answers: [],
        },
      ]);
    });

    it("sends the same request when the same input is sent again", async () => {
      adapter.mockImplementation(createApiReply(409));

      await createResult(inputWithDemographics);
      await createResult(inputWithDemographics);

      expect(adapter.mock.calls[1][0].data).toBe(adapter.mock.calls[0][0].data);
      expect(adapter.mock.calls[1][0].url).toBe(adapter.mock.calls[0][0].url);
    });

    it("does not change the input", async () => {
      const sentInput = structuredClone(inputWithDemographics);

      adapter.mockImplementationOnce(createApiReply(422));

      await createResult(sentInput);

      expect(sentInput).toEqual(inputWithDemographics);
    });
  });

  describe("given a reply", () => {
    it("resolves stored on 201", async () => {
      adapter.mockImplementationOnce(
        createApiReply(201, { id: input.sessionId, results: null }),
      );

      expect(await createResult(input)).toBe(CreateResultOutcome.Stored);
    });

    it("resolves stored on 409", async () => {
      adapter.mockImplementationOnce(
        createApiReply(409, { message: "Result with this ID already exists" }),
      );

      expect(await createResult(input)).toBe(CreateResultOutcome.Stored);
    });

    it.each([
      [{ id: "another-identifier", surveyId: "another-survey" }],
      [undefined],
      [null],
      [""],
      ["<html></html>"],
      [[]],
    ])("resolves stored on 201 whatever the body holds: %j", async (data) => {
      adapter.mockImplementationOnce(createApiReply(201, data));

      expect(await createResult(input)).toBe(CreateResultOutcome.Stored);
    });

    it.each([
      400, 404, 422, 500,
    ])("resolves refused on 400, 404, 422 and 500: %i", async (status) => {
      adapter.mockImplementationOnce(
        createApiReply(status, { message: "Refused" }),
      );

      expect(await createResult(inputWithDemographics)).toBe(
        CreateResultOutcome.Refused,
      );
    });

    it.each([
      200, 202, 204, 401, 403, 429, 502, 503,
    ])("resolves refused on any other reply: %i", async (status) => {
      adapter.mockImplementationOnce(createApiReply(status));

      expect(await createResult(input)).toBe(CreateResultOutcome.Refused);
    });
  });

  describe("given no reply", () => {
    it("resolves unreachable with no connection and with no reply in time", async () => {
      adapter
        .mockImplementationOnce(createApiError(AxiosError.ERR_NETWORK))
        .mockImplementationOnce(createApiError(AxiosError.ETIMEDOUT));

      expect(await createResult(input)).toBe(CreateResultOutcome.Unreachable);
      expect(await createResult(input)).toBe(CreateResultOutcome.Unreachable);
    });

    it("resolves unreachable when the request throws something unexpected", async () => {
      adapter.mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(createResult(input)).resolves.toBe(
        CreateResultOutcome.Unreachable,
      );
    });
  });

  describe("given a time limit", () => {
    it("gives the request 30 seconds by default", async () => {
      adapter.mockImplementationOnce(createApiReply(201));

      await createResult(input);

      expect(adapter.mock.calls[0][0].timeout).toBe(API_TIMEOUT_MS);
    });

    it("honours a shorter time limit passed by the caller", async () => {
      adapter.mockImplementationOnce(createApiReply(201));

      await createResult(input, { timeoutMs: 8000 });

      expect(adapter.mock.calls[0][0].timeout).toBe(8000);
    });

    it("never waits longer than 30 seconds, whatever limit the caller passes", async () => {
      adapter.mockImplementation(createApiReply(201));

      await createResult(input, { timeoutMs: 120_000 });
      await createResult(input, { timeoutMs: 0 });

      expect(adapter.mock.calls.map(([{ timeout }]) => timeout)).toEqual([
        API_TIMEOUT_MS,
        1,
      ]);
    });
  });

  describe("when cancelled", () => {
    it("resolves unreachable without throwing", async () => {
      const controller = new AbortController();

      adapter.mockImplementationOnce((config) => {
        controller.abort();

        return createApiReply(201)(config);
      });

      await expect(
        createResult(input, { signal: controller.signal }),
      ).resolves.toBe(CreateResultOutcome.Unreachable);
    });

    it("resolves unreachable without a request when it was cancelled before", async () => {
      await expect(
        createResult(input, { signal: AbortSignal.abort() }),
      ).resolves.toBe(CreateResultOutcome.Unreachable);
      expect(adapter).not.toHaveBeenCalled();
    });
  });

  describe("whatever the outcome", () => {
    const replies: [string, AxiosAdapter][] = [
      ["201", createApiReply(201)],
      ["409", createApiReply(409)],
      ["400", createApiReply(400)],
      ["422", createApiReply(422)],
      ["500", createApiReply(500)],
      ["no connection", createApiError(AxiosError.ERR_NETWORK)],
      ["no reply in time", createApiError(AxiosError.ETIMEDOUT)],
    ];

    it.each(
      replies,
    )("never sends a second request by itself: %s", async (_, reply) => {
      adapter.mockImplementation(reply);

      await createResult(inputWithDemographics);

      expect(adapter).toHaveBeenCalledTimes(1);
    });

    it("never sends a refused request again without its demographics", async () => {
      adapter.mockImplementation(createApiReply(422));

      await createResult(inputWithDemographics);

      expect(getSentBodies()).toEqual([inputWithDemographics]);
    });

    it("writes nothing to the console", async () => {
      const methods = ["log", "info", "warn", "error", "debug"] as const;
      const spies = methods.map((method) =>
        vi.spyOn(console, method).mockImplementation(() => undefined),
      );

      for (const [, reply] of replies) {
        adapter.mockImplementationOnce(reply);

        await createResult(inputWithDemographics);
      }

      expect(adapter).toHaveBeenCalledTimes(replies.length);

      for (const spy of spies) {
        expect(spy).not.toHaveBeenCalled();
      }

      vi.restoreAllMocks();
    });
  });
});
