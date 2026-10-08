import { type AxiosAdapter, AxiosError } from "axios";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { API_TIMEOUT_MS, DEFAULT_API_URL } from "@/constants/api";
import { readSurvey } from "@/services/api/utils/survey/readSurvey";
import { createApiError } from "@/utils/vitest/createApiError";
import { createApiReply } from "@/utils/vitest/createApiReply";

import { apiClient } from "./apiClient";
import { getSurvey } from "./getSurvey";

const SURVEY_ID = "60beb898-a4e4-4160-88c4-07a9931ab499";
const SURVEY_URL = `/v1/survey/${SURVEY_ID}`;

const surveyResponse = {
  id: SURVEY_ID,
  title: "myPolitics Quiz Tożsamościowy",
  type: "OFFICIAL",
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  questions: [
    {
      id: "q1",
      text: "Stwierdzenie.",
      status: "LIVE",
      possibleAnswers: [{ id: "a1", text: "Tak", weight: 2 }],
    },
  ],
};

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = apiClient.defaults.adapter;

const getRequests = (): unknown[] =>
  adapter.mock.calls.map(([{ method, baseURL, url, params }]) => ({
    method,
    baseURL,
    url,
    params,
  }));

describe("getSurvey()", () => {
  beforeEach(() => {
    adapter.mockReset();
    apiClient.defaults.adapter = adapter;
  });

  afterAll(() => {
    apiClient.defaults.adapter = defaultAdapter;
  });

  describe("when called", () => {
    it("asks for the quiz in the given language", async () => {
      adapter.mockImplementationOnce(createApiReply(200, surveyResponse));

      await getSurvey(SURVEY_ID, "pl");

      expect(getRequests()).toEqual([
        {
          method: "get",
          baseURL: DEFAULT_API_URL,
          url: SURVEY_URL,
          params: { lang: "pl" },
        },
      ]);
    });

    it("keeps an identifier from changing the address", async () => {
      adapter.mockImplementationOnce(createApiReply(404));

      await getSurvey("../result/a b?lang=en", "pl");

      expect(adapter.mock.calls[0][0].url).toBe(
        "/v1/survey/..%2Fresult%2Fa%20b%3Flang%3Den",
      );
    });

    it("gives the request 30 seconds, or the shorter limit of the caller", async () => {
      adapter.mockImplementation(createApiReply(200, surveyResponse));

      await getSurvey(SURVEY_ID, "pl");
      await getSurvey(SURVEY_ID, "pl", { timeoutMs: 5000 });

      expect(adapter.mock.calls.map(([{ timeout }]) => timeout)).toEqual([
        API_TIMEOUT_MS,
        5000,
      ]);
    });

    it("never gives the request more than 30 seconds", async () => {
      adapter.mockImplementation(createApiReply(200, surveyResponse));

      await getSurvey(SURVEY_ID, "pl", { timeoutMs: 60_000 });
      await getSurvey(SURVEY_ID, "pl", { timeoutMs: 0 });

      expect(adapter.mock.calls.map(([{ timeout }]) => timeout)).toEqual([
        API_TIMEOUT_MS,
        1,
      ]);
    });
  });

  describe("given a quiz", () => {
    it("resolves ready with the quiz as read", async () => {
      adapter.mockImplementationOnce(createApiReply(200, surveyResponse));

      const result = await getSurvey(SURVEY_ID, "pl");

      expect(result).toEqual(readSurvey(surveyResponse, SURVEY_ID));
      expect(result).toMatchObject({
        status: "ready",
        survey: {
          id: SURVEY_ID,
          name: "myPolitics Quiz Tożsamościowy",
          isOfficial: true,
          questions: [{ id: "q1", text: "Stwierdzenie." }],
        },
      });
    });

    it("uses the identifier it was asked for by, not the one of the reply", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, { ...surveyResponse, id: "another-identifier" }),
      );

      expect(await getSurvey(SURVEY_ID, "pl")).toMatchObject({
        survey: { id: SURVEY_ID },
      });
    });

    it("does not ask again", async () => {
      adapter.mockImplementationOnce(createApiReply(200, surveyResponse));

      await getSurvey(SURVEY_ID, "pl");

      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a refusal while a language was named", () => {
    it.each([
      400, 403, 422,
    ])("asks once more without a language after a %i", async (status) => {
      adapter
        .mockImplementationOnce(createApiReply(status))
        .mockImplementationOnce(createApiReply(200, surveyResponse));

      await getSurvey(SURVEY_ID, "en");

      expect(getRequests()).toEqual([
        {
          method: "get",
          baseURL: DEFAULT_API_URL,
          url: SURVEY_URL,
          params: { lang: "en" },
        },
        {
          method: "get",
          baseURL: DEFAULT_API_URL,
          url: SURVEY_URL,
          params: undefined,
        },
      ]);
    });

    it("resolves ready with the quiz in its default language", async () => {
      adapter
        .mockImplementationOnce(
          createApiReply(400, {
            message: "Requested language is not supported for this survey.",
          }),
        )
        .mockImplementationOnce(createApiReply(200, surveyResponse));

      expect(await getSurvey(SURVEY_ID, "en")).toEqual(
        readSurvey(surveyResponse, SURVEY_ID),
      );
    });

    it("resolves failed when the second request is refused too", async () => {
      adapter.mockImplementation(createApiReply(400));

      expect(await getSurvey(SURVEY_ID, "en")).toEqual({ status: "failed" });
      expect(adapter).toHaveBeenCalledTimes(2);
    });

    it("resolves not-found when the second request says the quiz does not exist", async () => {
      adapter
        .mockImplementationOnce(createApiReply(400))
        .mockImplementationOnce(createApiReply(404));

      expect(await getSurvey(SURVEY_ID, "en")).toEqual({ status: "not-found" });
      expect(adapter).toHaveBeenCalledTimes(2);
    });

    it.each([
      ["no connection", createApiError(AxiosError.ERR_NETWORK)],
      ["no reply in time", createApiError(AxiosError.ETIMEDOUT)],
      ["a server error", createApiReply(500)],
    ])("resolves failed when the second request ends with %s", async (_, reply) => {
      adapter
        .mockImplementationOnce(createApiReply(400))
        .mockImplementationOnce(reply);

      expect(await getSurvey(SURVEY_ID, "en")).toEqual({ status: "failed" });
      expect(adapter).toHaveBeenCalledTimes(2);
    });

    it("gives the second request the signal and the time limit of the first", async () => {
      const { signal } = new AbortController();

      adapter
        .mockImplementationOnce(createApiReply(400))
        .mockImplementationOnce(createApiReply(200, surveyResponse));

      await getSurvey(SURVEY_ID, "en", { signal, timeoutMs: 5000 });

      expect(
        adapter.mock.calls.map(([config]) => [config.signal, config.timeout]),
      ).toEqual([
        [signal, 5000],
        [signal, 5000],
      ]);
    });
  });

  describe("given a 404", () => {
    it("resolves not-found", async () => {
      adapter.mockImplementationOnce(
        createApiReply(404, { message: "Survey with given ID not found." }),
      );

      expect(await getSurvey(SURVEY_ID, "pl")).toEqual({ status: "not-found" });
    });

    it("does not ask again", async () => {
      adapter.mockImplementation(createApiReply(404));

      await getSurvey(SURVEY_ID, "pl");

      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("given no connection, no reply in time or a server error", () => {
    const replies: [string, AxiosAdapter][] = [
      ["no connection", createApiError(AxiosError.ERR_NETWORK)],
      ["no reply in time", createApiError(AxiosError.ETIMEDOUT)],
      ["a 500", createApiReply(500)],
      ["a 503", createApiReply(503)],
    ];

    it.each(replies)("resolves failed for %s", async (_, reply) => {
      adapter.mockImplementation(reply);

      expect(await getSurvey(SURVEY_ID, "pl")).toEqual({ status: "failed" });
    });

    it.each(replies)("does not ask again after %s", async (_, reply) => {
      adapter.mockImplementation(reply);

      await getSurvey(SURVEY_ID, "pl");

      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a reply that is not a quiz", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["<html><body>Sign in to the network</body></html>"],
      [[]],
      [{}],
      [{ title: "Quiz" }],
      [{ questions: "questions" }],
    ])("resolves failed for %j", async (data) => {
      adapter.mockImplementationOnce(createApiReply(200, data));

      expect(await getSurvey(SURVEY_ID, "pl")).toEqual({ status: "failed" });
      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a quiz with no question left", () => {
    it("resolves not-found", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, {
          ...surveyResponse,
          questions: [{ ...surveyResponse.questions[0], status: "DRAFT" }],
        }),
      );

      expect(await getSurvey(SURVEY_ID, "pl")).toEqual({ status: "not-found" });
      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("when cancelled", () => {
    it("resolves failed without throwing", async () => {
      const controller = new AbortController();

      adapter.mockImplementationOnce((config) => {
        controller.abort();

        return createApiReply(200, surveyResponse)(config);
      });

      await expect(
        getSurvey(SURVEY_ID, "pl", { signal: controller.signal }),
      ).resolves.toEqual({ status: "failed" });
    });

    it("resolves failed without a request when it was cancelled before", async () => {
      await expect(
        getSurvey(SURVEY_ID, "pl", { signal: AbortSignal.abort() }),
      ).resolves.toEqual({ status: "failed" });
      expect(adapter).not.toHaveBeenCalled();
    });

    it("does not ask once more when it was cancelled after a refusal", async () => {
      const controller = new AbortController();

      adapter.mockImplementationOnce((config) => {
        controller.abort();

        return createApiReply(400)(config);
      });

      await expect(
        getSurvey(SURVEY_ID, "en", { signal: controller.signal }),
      ).resolves.toEqual({ status: "failed" });
      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a request that throws something unexpected", () => {
    it("resolves failed without throwing", async () => {
      adapter.mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(getSurvey(SURVEY_ID, "pl")).resolves.toEqual({
        status: "failed",
      });
    });
  });

  describe("privacy", () => {
    it("writes nothing to the console, whatever the outcome", async () => {
      const methods = ["log", "info", "warn", "error", "debug"] as const;
      const spies = methods.map((method) =>
        vi.spyOn(console, method).mockImplementation(() => undefined),
      );

      const replies = [
        createApiReply(200, surveyResponse),
        createApiReply(404),
        createApiReply(500),
        createApiError(AxiosError.ERR_NETWORK),
        createApiReply(200, "<html></html>"),
      ];

      for (const reply of replies) {
        adapter.mockImplementationOnce(reply);

        await getSurvey(SURVEY_ID, "pl");
      }

      expect(adapter).toHaveBeenCalledTimes(replies.length);

      for (const spy of spies) {
        expect(spy).not.toHaveBeenCalled();
      }

      vi.restoreAllMocks();
    });
  });
});
