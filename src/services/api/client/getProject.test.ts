import { type AxiosAdapter, AxiosError } from "axios";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { API_TIMEOUT_MS, DEFAULT_API_URL } from "@/constants/api";
import { readProject } from "@/services/api/utils/project/readProject";
import {
  electionQuizProject,
  identityQuizProject,
} from "@/services/api/utils/project/readProject.fixtures";
import { SurveyLoadStatus } from "@/types/survey";
import { createApiError } from "@/utils/vitest/api/createApiError";
import { createApiReply } from "@/utils/vitest/api/createApiReply";

import { apiClient } from "./apiClient";
import { getProject } from "./getProject";

const PROJECT_ID = identityQuizProject.id;
const SURVEY_ID = identityQuizProject.latestSurveyId;
const PROJECT_URL = `/v1/project/${PROJECT_ID}`;

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = apiClient.defaults.adapter;

describe("getProject()", () => {
  beforeEach(() => {
    adapter.mockReset();
    apiClient.defaults.adapter = adapter;
  });

  afterAll(() => {
    apiClient.defaults.adapter = defaultAdapter;
  });

  describe("when called", () => {
    it("asks for the project by its identifier, without a language", async () => {
      adapter.mockImplementationOnce(createApiReply(200, identityQuizProject));

      await getProject(PROJECT_ID);

      expect(adapter).toHaveBeenCalledTimes(1);
      expect(adapter.mock.calls[0][0]).toMatchObject({
        method: "get",
        baseURL: DEFAULT_API_URL,
        url: PROJECT_URL,
      });
      expect(adapter.mock.calls[0][0].params).toBeUndefined();
    });

    it("keeps an identifier from changing the address", async () => {
      adapter.mockImplementationOnce(createApiReply(404));

      await getProject("../survey/a b?lang=en");

      expect(adapter.mock.calls[0][0].url).toBe(
        "/v1/project/..%2Fsurvey%2Fa%20b%3Flang%3Den",
      );
    });

    it("gives the request 30 seconds, or the shorter limit of the caller", async () => {
      adapter.mockImplementation(createApiReply(200, identityQuizProject));

      await getProject(PROJECT_ID);
      await getProject(PROJECT_ID, { timeoutMs: 5000 });

      expect(adapter.mock.calls.map(([{ timeout }]) => timeout)).toEqual([
        API_TIMEOUT_MS,
        5000,
      ]);
    });

    it("never gives the request more than 30 seconds", async () => {
      adapter.mockImplementation(createApiReply(200, identityQuizProject));

      await getProject(PROJECT_ID, { timeoutMs: 60_000 });
      await getProject(PROJECT_ID, { timeoutMs: 0 });

      expect(adapter.mock.calls.map(([{ timeout }]) => timeout)).toEqual([
        API_TIMEOUT_MS,
        1,
      ]);
    });

    it("gives the request the signal of the caller", async () => {
      const { signal } = new AbortController();

      adapter.mockImplementationOnce(createApiReply(200, identityQuizProject));

      await getProject(PROJECT_ID, { signal });

      expect(adapter.mock.calls[0][0].signal).toBe(signal);
    });
  });

  describe("given a project", () => {
    it("resolves ready with the project as read", async () => {
      adapter.mockImplementationOnce(createApiReply(200, identityQuizProject));

      const result = await getProject(PROJECT_ID);

      expect(result).toEqual(readProject(identityQuizProject, PROJECT_ID));
      expect(result).toEqual({
        status: SurveyLoadStatus.Ready,
        project: { id: PROJECT_ID, latestSurveyId: SURVEY_ID },
      });
    });

    it("resolves ready without a latest survey when the project names none", async () => {
      adapter.mockImplementationOnce(createApiReply(200, electionQuizProject));

      expect(await getProject(electionQuizProject.id)).toEqual({
        status: SurveyLoadStatus.Ready,
        project: { id: electionQuizProject.id },
      });
    });

    it("uses the identifier it was asked for by, not the one of the reply", async () => {
      adapter.mockImplementationOnce(
        createApiReply(200, {
          ...identityQuizProject,
          id: "another-identifier",
        }),
      );

      expect(await getProject(PROJECT_ID)).toMatchObject({
        project: { id: PROJECT_ID },
      });
    });

    it("does not ask again", async () => {
      adapter.mockImplementationOnce(createApiReply(200, identityQuizProject));

      await getProject(PROJECT_ID);

      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a 404", () => {
    it("resolves not-found", async () => {
      adapter.mockImplementationOnce(
        createApiReply(404, {
          error: "Not Found",
          statusCode: 404,
          message: "Project with given ID not found.",
        }),
      );

      expect(await getProject(PROJECT_ID)).toEqual({
        status: SurveyLoadStatus.NotFound,
      });
    });

    it("does not ask again", async () => {
      adapter.mockImplementation(createApiReply(404));

      await getProject(PROJECT_ID);

      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a refusal, no connection, no reply in time or a server error", () => {
    const replies: [string, AxiosAdapter][] = [
      [
        "a 400",
        createApiReply(400, {
          message: "Validation failed (uuid v 4 is expected)",
        }),
      ],
      ["a 403", createApiReply(403)],
      ["no connection", createApiError(AxiosError.ERR_NETWORK)],
      ["no reply in time", createApiError(AxiosError.ETIMEDOUT)],
      ["a 500", createApiReply(500)],
      ["a 503", createApiReply(503)],
    ];

    it.each(replies)("resolves failed for %s", async (_, reply) => {
      adapter.mockImplementation(reply);

      expect(await getProject(PROJECT_ID)).toEqual({
        status: SurveyLoadStatus.Failed,
      });
    });

    it.each(replies)("does not ask again after %s", async (_, reply) => {
      adapter.mockImplementation(reply);

      await getProject(PROJECT_ID);

      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a reply that is not a project", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["<html><body>Sign in to the network</body></html>"],
      [[]],
      [{}],
      [{ latestSurveyId: SURVEY_ID }],
      [{ id: PROJECT_ID }],
      [{ id: PROJECT_ID, latestSurveyId: 7 }],
    ])("resolves failed for %j", async (data) => {
      adapter.mockImplementationOnce(createApiReply(200, data));

      expect(await getProject(PROJECT_ID)).toEqual({
        status: SurveyLoadStatus.Failed,
      });
      expect(adapter).toHaveBeenCalledTimes(1);
    });
  });

  describe("when cancelled", () => {
    it("resolves failed without throwing", async () => {
      const controller = new AbortController();

      adapter.mockImplementationOnce((config) => {
        controller.abort();

        return createApiReply(200, identityQuizProject)(config);
      });

      await expect(
        getProject(PROJECT_ID, { signal: controller.signal }),
      ).resolves.toEqual({ status: SurveyLoadStatus.Failed });
    });

    it("resolves failed without a request when it was cancelled before", async () => {
      await expect(
        getProject(PROJECT_ID, { signal: AbortSignal.abort() }),
      ).resolves.toEqual({ status: SurveyLoadStatus.Failed });
      expect(adapter).not.toHaveBeenCalled();
    });
  });

  describe("given a request that throws something unexpected", () => {
    it("resolves failed without throwing", async () => {
      adapter.mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(getProject(PROJECT_ID)).resolves.toEqual({
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

      const replies = [
        createApiReply(200, identityQuizProject),
        createApiReply(404),
        createApiReply(500),
        createApiError(AxiosError.ERR_NETWORK),
        createApiReply(200, "<html></html>"),
      ];

      for (const reply of replies) {
        adapter.mockImplementationOnce(reply);

        await getProject(PROJECT_ID);
      }

      expect(adapter).toHaveBeenCalledTimes(replies.length);

      for (const spy of spies) {
        expect(spy).not.toHaveBeenCalled();
      }

      vi.restoreAllMocks();
    });
  });
});
