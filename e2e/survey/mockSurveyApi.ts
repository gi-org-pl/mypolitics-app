import type { Page, Route } from "@playwright/test";

import { surveyFixture } from "./survey.fixture";

const API_ADDRESS = "https://api.mypolitics.pl/**";
const SURVEY_ADDRESS = "**/v1/survey/**";
const RESULT_ADDRESS = "**/v1/result";
const RESULT_READ_ADDRESS = "**/v1/result/**";
const RESULTS_PAGE_ADDRESS = "https://mypolitics.pl/results/**";

// Where the build the tests run against sends the request for the result
// link: `playwright.config.ts` gives it to the build. The `.test` domain is
// reserved, so no live address is ever behind it.
export const RESULT_LINK_ADDRESS =
  "https://link.mypolitics.test/v1/result-link";

// The app and the API live at different addresses, so the browser asks
// before it posts and reads the reply only when the API allows it.
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "*",
};

export type SurveyApiCall = "result" | "link";

export interface SurveyApiMock {
  results: unknown[]; // the bodies of the results that were created, oldest first
  repeatedResults: unknown[]; // the bodies of the results that were sent again and answered "already exists"
  surveyRequests: string[]; // the addresses the quiz was asked for at
  linkRequests: unknown[]; // the bodies of the requests for the result link, oldest first
  calls: SurveyApiCall[]; // every result that was sent and every link that was asked for, in the order they arrived
  setReachable: (isReachable: boolean) => void; // false: the API does not answer
  setResultRefused: (isRefused: boolean) => void; // true: the API refuses every result that is sent
  setResultCalculated: (isCalculated: boolean) => void; // false: a stored result stays not calculated; true: it is calculated at the next read
  setLinkAvailable: (isAvailable: boolean) => void; // false: the link endpoint answers "unavailable"
}

const allowRequest = (route: Route) =>
  route.fulfill({ status: 204, headers: CORS_HEADERS });

const getSessionId = (result: unknown): string =>
  (result as { sessionId: string }).sessionId;

// Stands in for the API, for the endpoint that sends the result link and for
// the results page: no test ever reaches a live address. The quiz is the
// fixture. A result is created with 201, and with 409 when one with its
// identifier exists already; it is read as not calculated the first time and
// as calculated from then on. A link is accepted with 202, the results page
// is a stub, and every other request to the API is aborted. Routes registered
// later are asked first, so the catch-all comes first.
export const mockSurveyApi = async (page: Page): Promise<SurveyApiMock> => {
  let isApiReachable = true;
  let isResultRefused = false;
  let isResultCalculated: boolean | undefined;
  let isLinkAvailable = true;
  const readResultIds = new Set<string>();
  const mock: SurveyApiMock = {
    results: [],
    repeatedResults: [],
    surveyRequests: [],
    linkRequests: [],
    calls: [],
    setReachable: (isReachable) => {
      isApiReachable = isReachable;
    },
    setResultRefused: (isRefused) => {
      isResultRefused = isRefused;
    },
    setResultCalculated: (isCalculated) => {
      isResultCalculated = isCalculated;
    },
    setLinkAvailable: (isAvailable) => {
      isLinkAvailable = isAvailable;
    },
  };

  await page.route(API_ADDRESS, (route) => route.abort());

  await page.route(SURVEY_ADDRESS, (route) => {
    const request = route.request();

    if (request.method() === "OPTIONS") return allowRequest(route);
    if (request.method() !== "GET" || !isApiReachable) return route.abort();

    mock.surveyRequests.push(request.url());

    return route.fulfill({ json: surveyFixture, headers: CORS_HEADERS });
  });

  await page.route(RESULT_ADDRESS, (route) => {
    const request = route.request();

    if (request.method() === "OPTIONS") return allowRequest(route);
    if (request.method() !== "POST" || !isApiReachable) return route.abort();

    const result: unknown = request.postDataJSON();

    mock.calls.push("result");

    if (isResultRefused) {
      return route.fulfill({ status: 400, json: {}, headers: CORS_HEADERS });
    }

    const isStored = mock.results.some(
      (storedResult) => getSessionId(storedResult) === getSessionId(result),
    );

    (isStored ? mock.repeatedResults : mock.results).push(result);

    return route.fulfill({
      status: isStored ? 409 : 201,
      json: {},
      headers: CORS_HEADERS,
    });
  });

  await page.route(RESULT_READ_ADDRESS, (route) => {
    const request = route.request();

    if (request.method() === "OPTIONS") return allowRequest(route);
    if (request.method() !== "GET" || !isApiReachable) return route.abort();

    const resultId = decodeURIComponent(
      new URL(request.url()).pathname.split("/").at(-1) ?? "",
    );
    const isStored = mock.results.some(
      (storedResult) => getSessionId(storedResult) === resultId,
    );

    if (!isStored) {
      return route.fulfill({ status: 404, json: {}, headers: CORS_HEADERS });
    }

    // Left to itself, the calculation takes one read.
    const isCalculated = isResultCalculated ?? readResultIds.has(resultId);

    readResultIds.add(resultId);

    return route.fulfill({
      json: {
        sessionId: resultId,
        results: isCalculated ? { orientations: [] } : null,
      },
      headers: CORS_HEADERS,
    });
  });

  await page.route(RESULT_LINK_ADDRESS, (route) => {
    const request = route.request();

    if (request.method() === "OPTIONS") return allowRequest(route);
    if (request.method() !== "POST") return route.abort();

    mock.linkRequests.push(request.postDataJSON());
    mock.calls.push("link");

    return route.fulfill({
      status: isLinkAvailable ? 202 : 503,
      headers: CORS_HEADERS,
    });
  });

  await page.route(RESULTS_PAGE_ADDRESS, (route) =>
    route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: "<!doctype html><title>Wyniki</title><h1>Wyniki</h1>",
    }),
  );

  return mock;
};
