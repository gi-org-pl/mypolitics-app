import type { Page, Route } from "@playwright/test";

import { SURVEY_ID, surveyFixture } from "./survey.fixture";

const API_ADDRESS = "https://api.mypolitics.pl/**";
const PROJECT_ADDRESS = "**/v1/project/**";
const SURVEY_ADDRESS = "**/v1/survey/**";
const RESULT_ADDRESS = "**/v1/result";
const RESULTS_PAGE_ADDRESS = "https://mypolitics.pl/results/**";

// The app and the API live at different addresses, so the browser asks
// before it posts and reads the reply only when the API allows it.
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "*",
};

export interface SurveyApiMock {
  projectRequests: string[]; // the addresses the project of the quiz was asked for at
  results: unknown[]; // the bodies of the results that were created, oldest first
  surveyRequests: string[]; // the addresses the quiz was asked for at
  setReachable: (isReachable: boolean) => void; // false: the API does not answer
}

const allowRequest = (route: Route) =>
  route.fulfill({ status: 204, headers: CORS_HEADERS });

// Stands in for the API and for the results page: no test ever reaches a
// live address. The quiz is the fixture, a result is created with 201, the
// results page is a stub, and every other request to the API is aborted.
// Routes registered later are asked first, so the catch-all comes first.
export const mockSurveyApi = async (page: Page): Promise<SurveyApiMock> => {
  let isApiReachable = true;
  const mock: SurveyApiMock = {
    projectRequests: [],
    results: [],
    surveyRequests: [],
    setReachable: (isReachable) => {
      isApiReachable = isReachable;
    },
  };

  await page.route(API_ADDRESS, (route) => route.abort());

  // The quiz is found through its project: every project names the survey
  // of the fixture as its latest.
  await page.route(PROJECT_ADDRESS, (route) => {
    const request = route.request();

    if (request.method() === "OPTIONS") return allowRequest(route);
    if (request.method() !== "GET" || !isApiReachable) return route.abort();

    mock.projectRequests.push(request.url());

    const projectId = new URL(request.url()).pathname.split("/").at(-1);

    return route.fulfill({
      json: { id: projectId, latestSurveyId: SURVEY_ID },
      headers: CORS_HEADERS,
    });
  });

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

    mock.results.push(request.postDataJSON());

    return route.fulfill({
      status: 201,
      json: {},
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
