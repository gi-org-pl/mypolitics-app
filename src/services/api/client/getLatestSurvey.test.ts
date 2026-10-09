import { type AxiosAdapter, AxiosError } from "axios";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { API_TIMEOUT_MS, DEFAULT_API_URL } from "@/constants/api";
import {
  electionQuizProject,
  identityQuizProject,
  presidentialQuizProject,
} from "@/services/api/utils/project/readProject.fixtures";
import { readSurvey } from "@/services/api/utils/survey/readSurvey";
import { SurveyLoadStatus } from "@/types/survey";
import { createApiError } from "@/utils/vitest/createApiError";
import { createApiReply } from "@/utils/vitest/createApiReply";

import { apiClient } from "./apiClient";
import { getLatestSurvey } from "./getLatestSurvey";
import { getSurvey } from "./getSurvey";

const PROJECT_ID = identityQuizProject.id;
const SURVEY_ID = identityQuizProject.latestSurveyId;
const PROJECT_URL = `/v1/project/${PROJECT_ID}`;
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

const getAddresses = (): unknown[] =>
  adapter.mock.calls.map(([{ url }]) => url);

describe("getLatestSurvey()", () => {
  beforeEach(() => {
    adapter.mockReset();
    apiClient.defaults.adapter = adapter;
  });

  afterAll(() => {
    apiClient.defaults.adapter = defaultAdapter;
  });

  describe("when called", () => {
    it("asks for the project, then for its latest survey in the given language", async () => {
      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockImplementationOnce(createApiReply(200, surveyResponse));

      await getLatestSurvey(PROJECT_ID, "pl");

      expect(getRequests()).toEqual([
        {
          method: "get",
          baseURL: DEFAULT_API_URL,
          url: PROJECT_URL,
          params: undefined,
        },
        {
          method: "get",
          baseURL: DEFAULT_API_URL,
          url: SURVEY_URL,
          params: { lang: "pl" },
        },
      ]);
    });

    it("asks for the survey the project names, whichever it is", async () => {
      adapter
        .mockImplementationOnce(createApiReply(200, presidentialQuizProject))
        .mockImplementationOnce(createApiReply(200, surveyResponse))
        .mockImplementationOnce(
          createApiReply(200, {
            ...presidentialQuizProject,
            latestSurveyId: "a-newer-version",
          }),
        )
        .mockImplementationOnce(createApiReply(200, surveyResponse));

      await getLatestSurvey(presidentialQuizProject.id, "pl");
      await getLatestSurvey(presidentialQuizProject.id, "pl");

      expect(getAddresses()).toEqual([
        `/v1/project/${presidentialQuizProject.id}`,
        `/v1/survey/${presidentialQuizProject.latestSurveyId}`,
        `/v1/project/${presidentialQuizProject.id}`,
        "/v1/survey/a-newer-version",
      ]);
    });

    it("gives both requests the signal and the time limit of the caller", async () => {
      const { signal } = new AbortController();

      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockImplementationOnce(createApiReply(200, surveyResponse));

      await getLatestSurvey(PROJECT_ID, "pl", { signal, timeoutMs: 5000 });

      expect(
        adapter.mock.calls.map(([config]) => [config.signal, config.timeout]),
      ).toEqual([
        [signal, 5000],
        [signal, 5000],
      ]);
    });

    it("gives each request 30 seconds when the caller names no limit", async () => {
      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockImplementationOnce(createApiReply(200, surveyResponse));

      await getLatestSurvey(PROJECT_ID, "pl");

      expect(adapter.mock.calls.map(([{ timeout }]) => timeout)).toEqual([
        API_TIMEOUT_MS,
        API_TIMEOUT_MS,
      ]);
    });
  });

  describe("given a project with a latest survey", () => {
    it("resolves ready with that survey, under its own identifier", async () => {
      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockImplementationOnce(createApiReply(200, surveyResponse));

      const result = await getLatestSurvey(PROJECT_ID, "pl");

      expect(result).toEqual(readSurvey(surveyResponse, SURVEY_ID));
      expect(result).toMatchObject({
        status: SurveyLoadStatus.Ready,
        survey: {
          id: SURVEY_ID,
          name: "myPolitics Quiz Tożsamościowy",
          questions: [{ id: "q1", text: "Stwierdzenie." }],
        },
      });
    });

    it("resolves with what reading that survey by its identifier resolves with", async () => {
      const replies: AxiosAdapter[] = [
        createApiReply(200, surveyResponse),
        createApiReply(200, { ...surveyResponse, questions: [] }),
        createApiReply(200, "<html></html>"),
        createApiReply(404),
        createApiReply(500),
        createApiError(AxiosError.ERR_NETWORK),
        createApiError(AxiosError.ETIMEDOUT),
      ];

      for (const reply of replies) {
        adapter.mockReset();
        adapter.mockImplementationOnce(reply);

        const expected = await getSurvey(SURVEY_ID, "pl");

        adapter.mockReset();
        adapter
          .mockImplementationOnce(createApiReply(200, identityQuizProject))
          .mockImplementationOnce(reply);

        expect(await getLatestSurvey(PROJECT_ID, "pl")).toEqual(expected);
        expect(adapter).toHaveBeenCalledTimes(2);
      }
    });

    it("resolves not-found when the API does not have the survey", async () => {
      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockImplementationOnce(createApiReply(404));

      expect(await getLatestSurvey(PROJECT_ID, "pl")).toEqual({
        status: SurveyLoadStatus.NotFound,
      });
    });

    it("resolves failed when the survey cannot be read", async () => {
      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockImplementationOnce(createApiReply(500));

      expect(await getLatestSurvey(PROJECT_ID, "pl")).toEqual({
        status: SurveyLoadStatus.Failed,
      });
    });

    it("asks for the survey once more without a language when it is refused, and not for the project", async () => {
      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockImplementationOnce(createApiReply(400))
        .mockImplementationOnce(createApiReply(200, surveyResponse));

      expect(await getLatestSurvey(PROJECT_ID, "en")).toEqual(
        readSurvey(surveyResponse, SURVEY_ID),
      );
      expect(getRequests()).toEqual([
        {
          method: "get",
          baseURL: DEFAULT_API_URL,
          url: PROJECT_URL,
          params: undefined,
        },
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
  });

  describe("given a project with no survey to take", () => {
    it("resolves not-found, and asks for no survey", async () => {
      adapter.mockImplementationOnce(createApiReply(200, electionQuizProject));

      expect(await getLatestSurvey(electionQuizProject.id, "pl")).toEqual({
        status: SurveyLoadStatus.NotFound,
      });
      expect(getAddresses()).toEqual([`/v1/project/${electionQuizProject.id}`]);
    });
  });

  describe("given a project the API does not have", () => {
    it("resolves not-found, and asks for no survey", async () => {
      adapter.mockImplementationOnce(
        createApiReply(404, { message: "Project with given ID not found." }),
      );

      expect(await getLatestSurvey(PROJECT_ID, "pl")).toEqual({
        status: SurveyLoadStatus.NotFound,
      });
      expect(getAddresses()).toEqual([PROJECT_URL]);
    });
  });

  describe("given a project that cannot be read", () => {
    it.each([
      ["no connection", createApiError(AxiosError.ERR_NETWORK)],
      ["no reply in time", createApiError(AxiosError.ETIMEDOUT)],
      ["a refusal", createApiReply(400)],
      ["a 500", createApiReply(500)],
      ["a 503", createApiReply(503)],
      ["a reply that is not a project", createApiReply(200, "<html></html>")],
      ["a project without an identifier", createApiReply(200, {})],
      [
        "a latest survey that is not an identifier",
        createApiReply(200, { ...identityQuizProject, latestSurveyId: 7 }),
      ],
    ])("resolves failed for %s, and asks for no survey", async (_, reply) => {
      adapter.mockImplementationOnce(reply);

      expect(await getLatestSurvey(PROJECT_ID, "pl")).toEqual({
        status: SurveyLoadStatus.Failed,
      });
      expect(getAddresses()).toEqual([PROJECT_URL]);
    });
  });

  describe("when cancelled", () => {
    it("resolves failed without a request when it was cancelled before", async () => {
      await expect(
        getLatestSurvey(PROJECT_ID, "pl", { signal: AbortSignal.abort() }),
      ).resolves.toEqual({ status: SurveyLoadStatus.Failed });
      expect(adapter).not.toHaveBeenCalled();
    });

    it("does not ask for the survey when it was cancelled while the project was read", async () => {
      const controller = new AbortController();

      adapter.mockImplementationOnce((config) => {
        controller.abort();

        return createApiReply(200, identityQuizProject)(config);
      });

      await expect(
        getLatestSurvey(PROJECT_ID, "pl", { signal: controller.signal }),
      ).resolves.toEqual({ status: SurveyLoadStatus.Failed });
      expect(getAddresses()).toEqual([PROJECT_URL]);
    });

    it("does not ask for the survey when it was cancelled once the project had arrived", async () => {
      const controller = new AbortController();

      // Reading the reply is what cancels: the request for the project has
      // ended by then, and the one for the survey has not begun.
      adapter.mockImplementationOnce(
        createApiReply(200, {
          id: PROJECT_ID,
          get latestSurveyId() {
            controller.abort();

            return SURVEY_ID;
          },
        }),
      );

      await expect(
        getLatestSurvey(PROJECT_ID, "pl", { signal: controller.signal }),
      ).resolves.toEqual({ status: SurveyLoadStatus.Failed });
      expect(controller.signal.aborted).toBe(true);
      expect(getAddresses()).toEqual([PROJECT_URL]);
    });

    it("resolves failed when it was cancelled while the survey was read", async () => {
      const controller = new AbortController();

      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockImplementationOnce((config) => {
          controller.abort();

          return createApiReply(200, surveyResponse)(config);
        });

      await expect(
        getLatestSurvey(PROJECT_ID, "pl", { signal: controller.signal }),
      ).resolves.toEqual({ status: SurveyLoadStatus.Failed });
      expect(getAddresses()).toEqual([PROJECT_URL, SURVEY_URL]);
    });

    it("does not ask for the survey once more when it was cancelled after a refusal", async () => {
      const controller = new AbortController();

      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockImplementationOnce((config) => {
          controller.abort();

          return createApiReply(400)(config);
        });

      await expect(
        getLatestSurvey(PROJECT_ID, "en", { signal: controller.signal }),
      ).resolves.toEqual({ status: SurveyLoadStatus.Failed });
      expect(adapter).toHaveBeenCalledTimes(2);
    });
  });

  describe("given a request that throws something unexpected", () => {
    it("resolves failed without throwing, for either request", async () => {
      adapter.mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(getLatestSurvey(PROJECT_ID, "pl")).resolves.toEqual({
        status: SurveyLoadStatus.Failed,
      });

      adapter
        .mockImplementationOnce(createApiReply(200, identityQuizProject))
        .mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(getLatestSurvey(PROJECT_ID, "pl")).resolves.toEqual({
        status: SurveyLoadStatus.Failed,
      });
    });
  });

  describe("privacy", () => {
    it("writes nothing to the console, whatever the outcome", async () => {
      const methods = ["log", "info", "warn", "error", "debug"] as const;
      const spies = methods.map((method) =>
        vi.spyOn(console, method).mockImplementation(() => undefined),
      );

      const replies: AxiosAdapter[][] = [
        [
          createApiReply(200, identityQuizProject),
          createApiReply(200, surveyResponse),
        ],
        [createApiReply(200, identityQuizProject), createApiReply(404)],
        [createApiReply(200, electionQuizProject)],
        [createApiReply(404)],
        [createApiReply(500)],
        [createApiError(AxiosError.ERR_NETWORK)],
        [createApiReply(200, "<html></html>")],
      ];

      for (const [projectReply, surveyReply] of replies) {
        adapter.mockReset();
        adapter.mockImplementationOnce(projectReply);

        if (surveyReply) adapter.mockImplementationOnce(surveyReply);

        await getLatestSurvey(PROJECT_ID, "pl");
      }

      for (const spy of spies) {
        expect(spy).not.toHaveBeenCalled();
      }

      vi.restoreAllMocks();
    });
  });
});
