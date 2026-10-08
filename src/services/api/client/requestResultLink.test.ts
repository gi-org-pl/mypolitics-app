import { type AxiosAdapter, AxiosError } from "axios";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { RESULT_LINK_TIMEOUT_MS } from "@/constants/survey";
import type { ResultLinkInput } from "@/types/survey";
import { createApiError } from "@/utils/vitest/createApiError";
import { createApiReply } from "@/utils/vitest/createApiReply";

import { apiClient } from "./apiClient";
import { requestResultLink } from "./requestResultLink";

const ENDPOINT = "https://link.mypolitics.test/v1/result-link";

// The address of the endpoint is a value of the build, read when the module
// loads: the test stands in for the build.
const build = vi.hoisted(() => ({
  resultLinkUrl: undefined as string | undefined,
}));

vi.mock("@/constants/survey", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/constants/survey")>()),
  get RESULT_LINK_URL() {
    return build.resultLinkUrl;
  },
}));

const input: ResultLinkInput = {
  email: "biuro@mypolitics.pl",
  resultId: "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11",
  marketingConsent: false,
  language: "pl",
};

const inputWithConsent: ResultLinkInput = { ...input, marketingConsent: true };

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = apiClient.defaults.adapter;

const getSentBodies = (): unknown[] =>
  adapter.mock.calls.map(([{ data }]) => JSON.parse(String(data)) as unknown);

describe("requestResultLink()", () => {
  beforeEach(() => {
    build.resultLinkUrl = ENDPOINT;
    adapter.mockReset();
    apiClient.defaults.adapter = adapter;
  });

  afterAll(() => {
    apiClient.defaults.adapter = defaultAdapter;
  });

  describe("when called", () => {
    it("posts to the configured address, with nothing added to it", async () => {
      adapter.mockImplementationOnce(createApiReply(202));

      await requestResultLink(inputWithConsent);

      const [[config]] = adapter.mock.calls;

      expect(config).toMatchObject({ method: "post", url: ENDPOINT });
      expect(config.params).toBeUndefined();
      expect(apiClient.getUri(config)).toBe(ENDPOINT);
      expect(config.headers.getContentType()).toBe("application/json");
    });

    it("sends email, resultId, marketingConsent and language", async () => {
      adapter.mockImplementation(createApiReply(202));

      await requestResultLink(input);
      await requestResultLink({ ...input, language: "en" });

      expect(getSentBodies()).toEqual([
        {
          email: "biuro@mypolitics.pl",
          resultId: "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11",
          marketingConsent: false,
          language: "pl",
        },
        {
          email: "biuro@mypolitics.pl",
          resultId: "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11",
          marketingConsent: false,
          language: "en",
        },
      ]);
    });

    it("trims the address", async () => {
      adapter.mockImplementationOnce(createApiReply(202));

      await requestResultLink({ ...input, email: "  Biuro@myPolitics.pl\n" });

      expect(getSentBodies()).toEqual([
        { ...input, email: "Biuro@myPolitics.pl" },
      ]);
    });

    it("adds the consent wording with consent, and leaves the key out without it", async () => {
      adapter.mockImplementation(createApiReply(202));

      await requestResultLink(inputWithConsent);
      await requestResultLink(input);

      expect(getSentBodies()).toEqual([
        { ...inputWithConsent, consentWording: "marketing-v1" },
        input,
      ]);
      expect(getSentBodies()[1]).not.toHaveProperty("consentWording");
    });

    it("sends nothing else", async () => {
      adapter.mockImplementationOnce(createApiReply(202));

      await requestResultLink({
        ...inputWithConsent,
        surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
        answers: [{ questionId: "q1", answerId: "q1-a1" }],
        demographics: { age: 34 },
        message: "Kliknij tutaj",
        consentWording: "another-wording",
      } as ResultLinkInput);

      expect(Object.keys(getSentBodies()[0] as object)).toEqual([
        "email",
        "resultId",
        "marketingConsent",
        "consentWording",
        "language",
      ]);
      expect(getSentBodies()).toEqual([
        { ...inputWithConsent, consentWording: "marketing-v1" },
      ]);
    });

    it("does not change the input", async () => {
      const sentInput = { ...inputWithConsent, email: " biuro@mypolitics.pl " };

      adapter.mockImplementationOnce(createApiReply(202));

      await requestResultLink(sentInput);

      expect(sentInput).toEqual({
        ...inputWithConsent,
        email: " biuro@mypolitics.pl ",
      });
    });
  });

  describe("given a reply", () => {
    it("resolves accepted on 202", async () => {
      adapter.mockImplementationOnce(createApiReply(202));

      expect(await requestResultLink(input)).toBe("accepted");
    });

    it("resolves invalid on 400 and limited on 429", async () => {
      adapter
        .mockImplementationOnce(createApiReply(400))
        .mockImplementationOnce(createApiReply(429));

      expect(await requestResultLink(input)).toBe("invalid");
      expect(await requestResultLink(input)).toBe("limited");
    });

    it.each([
      200, 201, 204, 301, 401, 403, 404, 409, 422, 500, 502, 503, 504,
    ])("resolves unavailable on 503 and on any other status, 200 and 204 included: %i", async (status) => {
      adapter.mockImplementationOnce(createApiReply(status));

      expect(await requestResultLink(input)).toBe("unavailable");
    });

    it.each([
      [202, { outcome: "invalid" }, "accepted"],
      [202, "<html></html>", "accepted"],
      [400, { outcome: "accepted" }, "invalid"],
      [429, null, "limited"],
      [200, { outcome: "accepted" }, "unavailable"],
    ])("reads the status and never the body: %i %j", async (status, data, outcome) => {
      adapter.mockImplementationOnce(createApiReply(status, data));

      expect(await requestResultLink(input)).toBe(outcome);
    });
  });

  describe("given no reply", () => {
    it("resolves unavailable with no connection and when cancelled, without throwing", async () => {
      const controller = new AbortController();

      adapter
        .mockImplementationOnce(createApiError(AxiosError.ERR_NETWORK))
        .mockImplementationOnce((config) => {
          controller.abort();

          return createApiReply(202)(config);
        });

      await expect(requestResultLink(input)).resolves.toBe("unavailable");
      await expect(
        requestResultLink(input, { signal: controller.signal }),
      ).resolves.toBe("unavailable");
    });

    it("resolves unavailable without a request when it was cancelled before", async () => {
      await expect(
        requestResultLink(input, { signal: AbortSignal.abort() }),
      ).resolves.toBe("unavailable");
      expect(adapter).not.toHaveBeenCalled();
    });

    it("resolves unavailable with no reply in time", async () => {
      adapter.mockImplementationOnce(createApiError(AxiosError.ETIMEDOUT));

      await expect(requestResultLink(input)).resolves.toBe("unavailable");
    });

    it("resolves unavailable when the request throws something unexpected", async () => {
      adapter.mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(requestResultLink(input)).resolves.toBe("unavailable");
    });
  });

  describe("given a time limit", () => {
    it("gives up after RESULT_LINK_TIMEOUT_MS, and honours a time limit passed by the caller", async () => {
      adapter.mockImplementation(createApiReply(202));

      await requestResultLink(input);
      await requestResultLink(input, {});
      await requestResultLink(input, { timeoutMs: undefined });
      await requestResultLink(input, { timeoutMs: Number.NaN });
      await requestResultLink(input, { timeoutMs: 2500 });

      expect(RESULT_LINK_TIMEOUT_MS).toBe(10_000);
      expect(adapter.mock.calls.map(([{ timeout }]) => timeout)).toEqual([
        10_000, 10_000, 10_000, 10_000, 2500,
      ]);
    });
  });

  describe("given no endpoint configured", () => {
    it("makes no request and resolves unavailable when no endpoint is configured", async () => {
      build.resultLinkUrl = undefined;

      await expect(requestResultLink(inputWithConsent)).resolves.toBe(
        "unavailable",
      );
      expect(adapter).not.toHaveBeenCalled();
    });
  });

  describe("whatever the outcome", () => {
    const replies: [string, AxiosAdapter][] = [
      ["202", createApiReply(202)],
      ["400", createApiReply(400)],
      ["429", createApiReply(429)],
      ["503", createApiReply(503)],
      ["500", createApiReply(500)],
      ["no connection", createApiError(AxiosError.ERR_NETWORK)],
      ["no reply in time", createApiError(AxiosError.ETIMEDOUT)],
    ];

    it.each(
      replies,
    )("never sends a second request by itself: %s", async (_, reply) => {
      adapter.mockImplementation(reply);

      await requestResultLink(inputWithConsent);

      expect(adapter).toHaveBeenCalledTimes(1);
    });

    it("sends a second request when the same input is sent again", async () => {
      adapter.mockImplementation(createApiReply(202));

      await requestResultLink(inputWithConsent);
      await requestResultLink(inputWithConsent);

      expect(adapter).toHaveBeenCalledTimes(2);
      expect(adapter.mock.calls[1][0].data).toBe(adapter.mock.calls[0][0].data);
    });

    it("writes nothing to the console", async () => {
      const methods = ["log", "info", "warn", "error", "debug"] as const;
      const spies = methods.map((method) =>
        vi.spyOn(console, method).mockImplementation(() => undefined),
      );

      for (const [, reply] of replies) {
        adapter.mockImplementationOnce(reply);

        await requestResultLink(inputWithConsent);
      }

      build.resultLinkUrl = undefined;
      await requestResultLink(inputWithConsent);

      expect(adapter).toHaveBeenCalledTimes(replies.length);

      for (const spy of spies) {
        expect(spy).not.toHaveBeenCalled();
      }

      vi.restoreAllMocks();
    });
  });
});
