import { type AxiosAdapter, AxiosError } from "axios";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { API_TIMEOUT_MS } from "@/constants/api";
import { readAnswerCounts } from "@/services/api/utils/answer-counts/readAnswerCounts";
import { createApiError } from "@/utils/vitest/api/createApiError";
import { createApiReply } from "@/utils/vitest/api/createApiReply";

import { apiClient } from "./apiClient";
import { getAnswerCounts } from "./getAnswerCounts";

const SURVEY_ID = "60beb898-a4e4-4160-88c4-07a9931ab499";
// An address for the tests only: nothing is ever sent to it.
const SOURCE_URL = "https://counts.test/answer-counts";
const NOW = new Date("2026-10-08T12:00:00.000Z");

const countsResponse = {
  computedAt: "2026-10-08T06:00:00.000Z",
  questions: [
    {
      questionId: "question-1",
      resultsCounted: 1240,
      answers: [
        { answerId: "answer-1", count: 31 },
        { answerId: "answer-2", count: 62 },
        { answerId: "answer-3", count: 410 },
        { answerId: "answer-4", count: 365 },
      ],
    },
  ],
};

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = apiClient.defaults.adapter;

describe("getAnswerCounts()", () => {
  beforeEach(() => {
    adapter.mockReset();
    apiClient.defaults.adapter = adapter;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    apiClient.defaults.adapter = defaultAdapter;
  });

  describe("given no VITE_ANSWER_COUNTS_URL, or a blank one", () => {
    it.each([
      ["not set", undefined],
      ["empty", ""],
      ["blank", "   "],
    ])("resolves with nothing: %s", async (_, address) => {
      vi.stubEnv("VITE_ANSWER_COUNTS_URL", address);

      await expect(getAnswerCounts(SURVEY_ID)).resolves.toBeUndefined();
    });

    it.each([
      ["not set", undefined],
      ["empty", ""],
      ["blank", "   "],
    ])("makes no request: %s", async (_, address) => {
      vi.stubEnv("VITE_ANSWER_COUNTS_URL", address);
      adapter.mockImplementation(createApiReply(200, countsResponse));

      await getAnswerCounts(SURVEY_ID);

      expect(adapter).not.toHaveBeenCalled();
    });
  });

  describe("given a value that is not a web address", () => {
    it.each([
      "/answer-counts",
      "counts.test/answer-counts",
      "ftp://counts.test/answer-counts",
    ])("resolves with nothing and makes no request: %s", async (address) => {
      vi.stubEnv("VITE_ANSWER_COUNTS_URL", address);
      adapter.mockImplementation(createApiReply(200, countsResponse));

      await expect(getAnswerCounts(SURVEY_ID)).resolves.toBeUndefined();
      expect(adapter).not.toHaveBeenCalled();
    });
  });

  describe("given an address", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_ANSWER_COUNTS_URL", SOURCE_URL);
    });

    it("asks that address once, with the quiz identifier as surveyId", async () => {
      adapter.mockImplementation(createApiReply(200, countsResponse));

      await getAnswerCounts(SURVEY_ID);

      expect(adapter).toHaveBeenCalledTimes(1);
      expect(adapter.mock.calls[0][0]).toMatchObject({
        method: "get",
        url: SOURCE_URL,
        params: { surveyId: SURVEY_ID },
      });
      // The address is absolute: the base address of the client is not put
      // in front of it.
      expect(apiClient.getUri(adapter.mock.calls[0][0])).toBe(
        `${SOURCE_URL}?surveyId=${SURVEY_ID}`,
      );
    });

    it("takes an address with spaces around it", async () => {
      vi.stubEnv("VITE_ANSWER_COUNTS_URL", `  ${SOURCE_URL}  `);
      adapter.mockImplementation(createApiReply(200, countsResponse));

      await getAnswerCounts(SURVEY_ID);

      expect(adapter.mock.calls[0][0].url).toBe(SOURCE_URL);
    });

    it("sends nothing else: no body, no other parameter", async () => {
      adapter.mockImplementation(createApiReply(200, countsResponse));

      await getAnswerCounts(SURVEY_ID);

      const [{ data, params }] = adapter.mock.calls[0];

      expect(data).toBeUndefined();
      expect(params).toEqual({ surveyId: SURVEY_ID });
    });

    it("resolves with the counts read by readAnswerCounts at the current time", async () => {
      adapter.mockImplementation(createApiReply(200, countsResponse));

      const counts = await getAnswerCounts(SURVEY_ID);

      expect(counts).toEqual(readAnswerCounts(countsResponse, NOW));
      expect(counts).toEqual({
        "question-1": {
          resultsCounted: 1240,
          chosen: {
            "answer-1": 31,
            "answer-2": 62,
            "answer-3": 410,
            "answer-4": 365,
          },
        },
      });
    });

    it("gives the request the time limit of the client, or the shorter one of the caller", async () => {
      adapter.mockImplementation(createApiReply(200, countsResponse));

      await getAnswerCounts(SURVEY_ID);
      await getAnswerCounts(SURVEY_ID, { timeoutMs: 5000 });

      expect(adapter.mock.calls.map(([{ timeout }]) => timeout)).toEqual([
        API_TIMEOUT_MS,
        5000,
      ]);
    });
  });

  describe("given the source answers with an error, does not answer, or answers too late", () => {
    const replies: [string, AxiosAdapter][] = [
      ["a 404", createApiReply(404)],
      ["a 500", createApiReply(500)],
      ["a 503", createApiReply(503)],
      ["no connection", createApiError(AxiosError.ERR_NETWORK)],
      ["no reply in time", createApiError(AxiosError.ETIMEDOUT)],
    ];

    beforeEach(() => {
      vi.stubEnv("VITE_ANSWER_COUNTS_URL", SOURCE_URL);
    });

    it.each(
      replies,
    )("resolves with nothing and does not reject: %s", async (_, reply) => {
      adapter.mockImplementation(reply);

      await expect(getAnswerCounts(SURVEY_ID)).resolves.toBeUndefined();
    });

    it.each(replies)("does not ask again after %s", async (_, reply) => {
      adapter.mockImplementation(reply);

      await getAnswerCounts(SURVEY_ID);

      expect(adapter).toHaveBeenCalledTimes(1);
    });

    it("resolves with nothing when the request throws something unexpected", async () => {
      adapter.mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(getAnswerCounts(SURVEY_ID)).resolves.toBeUndefined();
    });

    it("resolves with nothing when it was cancelled", async () => {
      await expect(
        getAnswerCounts(SURVEY_ID, { signal: AbortSignal.abort() }),
      ).resolves.toBeUndefined();
      expect(adapter).not.toHaveBeenCalled();
    });
  });

  describe("given a response that cannot be read", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_ANSWER_COUNTS_URL", SOURCE_URL);
    });

    it.each([
      [undefined],
      [null],
      ["<html><body>Sign in to the network</body></html>"],
      [[]],
      [{}],
      [{ questions: countsResponse.questions }],
      [{ ...countsResponse, questions: "questions" }],
    ])("resolves with nothing for %j", async (data) => {
      adapter.mockImplementationOnce(createApiReply(200, data));

      await expect(getAnswerCounts(SURVEY_ID)).resolves.toBeUndefined();
      expect(adapter).toHaveBeenCalledTimes(1);
    });

    it("resolves with nothing for counts older than 24 hours", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, {
          ...countsResponse,
          computedAt: "2026-10-07T11:59:59.999Z",
        }),
      );

      await expect(getAnswerCounts(SURVEY_ID)).resolves.toBeUndefined();
    });
  });

  describe("privacy", () => {
    it("writes nothing to the console, whatever the outcome", async () => {
      const methods = ["log", "info", "warn", "error", "debug"] as const;
      const spies = methods.map((method) =>
        vi.spyOn(console, method).mockImplementation(() => undefined),
      );
      const replies = [
        createApiReply(200, countsResponse),
        createApiReply(500),
        createApiError(AxiosError.ERR_NETWORK),
        createApiReply(200, "<html></html>"),
      ];

      vi.stubEnv("VITE_ANSWER_COUNTS_URL", SOURCE_URL);

      for (const reply of replies) {
        adapter.mockImplementationOnce(reply);

        await getAnswerCounts(SURVEY_ID);
      }

      expect(adapter).toHaveBeenCalledTimes(replies.length);

      for (const spy of spies) {
        expect(spy).not.toHaveBeenCalled();
      }

      vi.restoreAllMocks();
    });
  });
});
