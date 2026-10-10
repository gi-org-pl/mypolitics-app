import type { AxiosAdapter } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RESULT_LINK_TIMEOUT_MS } from "@/constants/survey";
import type { ResultLinkInput, ResultLinkOutcome } from "@/types/survey";

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

// The statuses a reply cannot carry a body with.
const BODILESS_STATUSES = [204, 205, 304];

type Fetch = (request: Request, init?: RequestInit) => Promise<Response>;

// The request goes out through `fetch`, so the test stands in for the
// browser there: everything Axios does with a reply or a failure is real.
const fetchMock = vi.fn<Fetch>();

const toBody = (data: unknown): string | null => {
  if (data === undefined || data === null) return null;

  return typeof data === "string" ? data : JSON.stringify(data);
};

// The endpoint answers with this status and body.
const reply =
  (status: number, data?: unknown): Fetch =>
  async () =>
    new Response(BODILESS_STATUSES.includes(status) ? null : toBody(data), {
      status,
    });

// There is no connection: `fetch` fails the way a browser makes it fail.
const failToConnect: Fetch = async () => {
  throw new TypeError("Failed to fetch");
};

// The endpoint never answers. Like `fetch`, the request ends only when it is
// cancelled, with the reason it was cancelled for.
const neverAnswer: Fetch = (request) =>
  new Promise((_resolve, reject) => {
    request.signal.addEventListener("abort", () =>
      reject(request.signal.reason),
    );
  });

// Lets a call end: a reply is read at once, and a request that got none is
// given up on when its time limit is over.
const finish = async (
  call: Promise<ResultLinkOutcome>,
): Promise<ResultLinkOutcome> => {
  await vi.advanceTimersByTimeAsync(RESULT_LINK_TIMEOUT_MS);

  return call;
};

// What a call ended with, or nothing while it goes on.
const watch = (call: Promise<ResultLinkOutcome>) => {
  const seen: { outcome?: ResultLinkOutcome } = {};

  call.then((outcome) => {
    seen.outcome = outcome;
  });

  return seen;
};

const getRequests = (): Request[] =>
  fetchMock.mock.calls.map(([request]) => request);

const getSentBodies = (): Promise<unknown[]> =>
  Promise.all(getRequests().map((request) => request.clone().json()));

describe("requestResultLink()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    build.resultLinkUrl = ENDPOINT;
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("when called", () => {
    it("posts to the configured address, with nothing added to it", async () => {
      fetchMock.mockImplementationOnce(reply(202));

      await finish(requestResultLink(inputWithConsent));

      const [request] = getRequests();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(request.method).toBe("POST");
      expect(request.url).toBe(ENDPOINT);
      expect(request.headers.get("content-type")).toBe("application/json");
    });

    it("keeps the request alive, so that a reload or a leave of the page does not end it", async () => {
      fetchMock.mockImplementationOnce(reply(202));

      await finish(requestResultLink(inputWithConsent));

      const [[request, init]] = fetchMock.mock.calls;

      expect(request.keepalive).toBe(true);
      expect(init).toEqual({ keepalive: true });
    });

    it("goes out through fetch, not through the adapter of the client", async () => {
      const clientAdapter = vi.fn<AxiosAdapter>();
      const defaultAdapter = apiClient.defaults.adapter;

      apiClient.defaults.adapter = clientAdapter;
      fetchMock.mockImplementationOnce(reply(202));

      const outcome = await finish(requestResultLink(input));

      apiClient.defaults.adapter = defaultAdapter;

      expect(outcome).toBe("accepted");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(clientAdapter).not.toHaveBeenCalled();
    });

    it("sends email, resultId, marketingConsent and language", async () => {
      fetchMock.mockImplementation(reply(202));

      await finish(requestResultLink(input));
      await finish(requestResultLink({ ...input, language: "en" }));

      expect(await getSentBodies()).toEqual([
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
      fetchMock.mockImplementationOnce(reply(202));

      await finish(
        requestResultLink({ ...input, email: "  Biuro@myPolitics.pl\n" }),
      );

      expect(await getSentBodies()).toEqual([
        { ...input, email: "Biuro@myPolitics.pl" },
      ]);
    });

    it("adds the consent wording with consent, and leaves the key out without it", async () => {
      fetchMock.mockImplementation(reply(202));

      await finish(requestResultLink(inputWithConsent));
      await finish(requestResultLink(input));

      const bodies = await getSentBodies();

      expect(bodies).toEqual([
        { ...inputWithConsent, consentWording: "marketing-v1" },
        input,
      ]);
      expect(bodies[1]).not.toHaveProperty("consentWording");
    });

    it("sends nothing else", async () => {
      fetchMock.mockImplementationOnce(reply(202));

      await finish(
        requestResultLink({
          ...inputWithConsent,
          surveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
          answers: [{ questionId: "q1", answerId: "q1-a1" }],
          demographics: { age: 34 },
          message: "Kliknij tutaj",
          consentWording: "another-wording",
        } as ResultLinkInput),
      );

      const bodies = await getSentBodies();

      expect(Object.keys(bodies[0] as object)).toEqual([
        "email",
        "resultId",
        "marketingConsent",
        "consentWording",
        "language",
      ]);
      expect(bodies).toEqual([
        { ...inputWithConsent, consentWording: "marketing-v1" },
      ]);
    });

    it("does not change the input", async () => {
      const sentInput = { ...inputWithConsent, email: " biuro@mypolitics.pl " };

      fetchMock.mockImplementationOnce(reply(202));

      await finish(requestResultLink(sentInput));

      expect(sentInput).toEqual({
        ...inputWithConsent,
        email: " biuro@mypolitics.pl ",
      });
    });
  });

  describe("given a reply", () => {
    it("resolves accepted on 202", async () => {
      fetchMock.mockImplementationOnce(reply(202));

      expect(await finish(requestResultLink(input))).toBe("accepted");
    });

    it("resolves invalid on 400 and limited on 429", async () => {
      fetchMock
        .mockImplementationOnce(reply(400))
        .mockImplementationOnce(reply(429));

      expect(await finish(requestResultLink(input))).toBe("invalid");
      expect(await finish(requestResultLink(input))).toBe("limited");
    });

    it.each([
      200, 201, 204, 301, 401, 403, 404, 409, 422, 500, 502, 503, 504,
    ])("resolves unavailable on 503 and on any other status, 200 and 204 included: %i", async (status) => {
      fetchMock.mockImplementationOnce(reply(status));

      expect(await finish(requestResultLink(input))).toBe("unavailable");
    });

    it.each([
      [202, { outcome: "invalid" }, ResultLinkOutcome.Accepted],
      [202, "<html></html>", ResultLinkOutcome.Accepted],
      [400, { outcome: "accepted" }, ResultLinkOutcome.Invalid],
      [429, null, ResultLinkOutcome.Limited],
      [200, { outcome: "accepted" }, ResultLinkOutcome.Unavailable],
    ])("reads the status and never the body: %i %j", async (status, data, outcome) => {
      fetchMock.mockImplementationOnce(reply(status, data));

      expect(await finish(requestResultLink(input))).toBe(outcome);
    });
  });

  describe("given no reply", () => {
    it("resolves unavailable with no connection, without throwing", async () => {
      fetchMock.mockImplementationOnce(failToConnect);

      await expect(finish(requestResultLink(input))).resolves.toBe(
        "unavailable",
      );
    });

    it("resolves unavailable when cancelled, and cancels the request", async () => {
      const controller = new AbortController();

      fetchMock.mockImplementationOnce(neverAnswer);

      const seen = watch(
        requestResultLink(input, { signal: controller.signal }),
      );

      await vi.advanceTimersByTimeAsync(0);

      const [request] = getRequests();

      expect(seen.outcome).toBeUndefined();
      expect(request.signal.aborted).toBe(false);

      controller.abort();
      await vi.advanceTimersByTimeAsync(0);

      expect(request.signal.aborted).toBe(true);
      expect(seen.outcome).toBe("unavailable");
      expect(vi.getTimerCount()).toBe(0);
    });

    it("resolves unavailable without a request when it was cancelled before", async () => {
      await expect(
        finish(requestResultLink(input, { signal: AbortSignal.abort() })),
      ).resolves.toBe("unavailable");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("resolves unavailable with no reply in time, and cancels the request", async () => {
      fetchMock.mockImplementationOnce(neverAnswer);

      await expect(finish(requestResultLink(input))).resolves.toBe(
        "unavailable",
      );
      expect(getRequests()[0].signal.aborted).toBe(true);
    });

    it("resolves unavailable when the request throws something unexpected", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("Unexpected"));

      await expect(finish(requestResultLink(input))).resolves.toBe(
        "unavailable",
      );
    });

    it("resolves unavailable when a reply cannot be read", async () => {
      fetchMock.mockImplementationOnce(async () => {
        const response = new Response("{}", { status: 202 });

        vi.spyOn(response, "text").mockRejectedValue(new TypeError("Lost"));

        return response;
      });

      await expect(finish(requestResultLink(input))).resolves.toBe(
        "unavailable",
      );
    });
  });

  describe("given a time limit", () => {
    it.each([
      ["no options", undefined, RESULT_LINK_TIMEOUT_MS],
      ["empty options", {}, RESULT_LINK_TIMEOUT_MS],
      ["no limit", { timeoutMs: undefined }, RESULT_LINK_TIMEOUT_MS],
      [
        "a limit that is no number",
        { timeoutMs: Number.NaN },
        RESULT_LINK_TIMEOUT_MS,
      ],
      ["a limit of the caller", { timeoutMs: 2500 }, 2500],
    ])("gives up after RESULT_LINK_TIMEOUT_MS, and honours a time limit passed by the caller: %s", async (_, options, limit) => {
      fetchMock.mockImplementationOnce(neverAnswer);

      const seen = watch(requestResultLink(input, options));

      await vi.advanceTimersByTimeAsync(limit - 1);

      expect(seen.outcome).toBeUndefined();

      await vi.advanceTimersByTimeAsync(1);

      expect(RESULT_LINK_TIMEOUT_MS).toBe(10_000);
      expect(seen.outcome).toBe("unavailable");
      expect(vi.getTimerCount()).toBe(0);
    });

    it("leaves no timer running after a reply", async () => {
      fetchMock.mockImplementationOnce(reply(202));

      await requestResultLink(input);

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("given no endpoint configured", () => {
    it("makes no request and resolves unavailable when no endpoint is configured", async () => {
      build.resultLinkUrl = undefined;

      await expect(finish(requestResultLink(inputWithConsent))).resolves.toBe(
        "unavailable",
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("whatever the outcome", () => {
    const replies: [string, Fetch][] = [
      ["202", reply(202)],
      ["400", reply(400)],
      ["429", reply(429)],
      ["503", reply(503)],
      ["500", reply(500)],
      ["no connection", failToConnect],
      ["no reply in time", neverAnswer],
    ];

    it.each(
      replies,
    )("never sends a second request by itself: %s", async (_, answer) => {
      fetchMock.mockImplementation(answer);

      await finish(requestResultLink(inputWithConsent));
      await vi.advanceTimersByTimeAsync(RESULT_LINK_TIMEOUT_MS);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("sends a second request when the same input is sent again", async () => {
      fetchMock.mockImplementation(reply(202));

      await finish(requestResultLink(inputWithConsent));
      await finish(requestResultLink(inputWithConsent));

      const bodies = await getSentBodies();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(bodies[1]).toEqual(bodies[0]);
    });

    it("writes nothing to the console", async () => {
      const methods = ["log", "info", "warn", "error", "debug"] as const;
      const spies = methods.map((method) =>
        vi.spyOn(console, method).mockImplementation(() => undefined),
      );

      for (const [, answer] of replies) {
        fetchMock.mockImplementationOnce(answer);

        await finish(requestResultLink(inputWithConsent));
      }

      build.resultLinkUrl = undefined;
      await finish(requestResultLink(inputWithConsent));

      expect(fetchMock).toHaveBeenCalledTimes(replies.length);

      for (const spy of spies) {
        expect(spy).not.toHaveBeenCalled();
      }

      vi.restoreAllMocks();
    });
  });
});
