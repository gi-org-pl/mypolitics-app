import type { Page } from "@playwright/test";

import { CORS_HEADERS } from "../survey/mockSurveyApi";
import {
  createResultResponse,
  RESULT_ID,
  resultSurveyFixture,
} from "./result.fixture";

const API_ADDRESS = "https://api.mypolitics.pl/**";
const SURVEY_ADDRESS = "**/v1/survey/**";
const RESULT_READ_ADDRESS = "**/v1/result/**";

export interface ResultsApiMock {
  requests: string[]; // every address that was asked of the API, in the order they arrived
}

const getLastPart = (address: string): string =>
  decodeURIComponent(new URL(address).pathname.split("/").at(-1) ?? "");

// Stands in for the read of a result: the calculated result of the fixture
// for the identifiers it is told of, and "no such result" for any other.
// Routes registered later are asked first, so this one answers before the
// read of a result the questionnaire's mock registers.
export const mockResultRead = async (
  page: Page,
  isKnown: (resultId: string) => boolean,
  mock: ResultsApiMock = { requests: [] },
): Promise<ResultsApiMock> => {
  await page.route(RESULT_READ_ADDRESS, (route) => {
    const request = route.request();

    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }

    if (request.method() !== "GET") return route.abort();

    mock.requests.push(request.url());

    const resultId = getLastPart(request.url());

    return isKnown(resultId)
      ? route.fulfill({
          json: createResultResponse(resultId),
          headers: CORS_HEADERS,
        })
      : route.fulfill({ status: 404, json: {}, headers: CORS_HEADERS });
  });

  return mock;
};

// Stands in for the API of the result screen: the result of the fixture, the
// quiz it names, and nothing else - every other request to the API is
// aborted, so no test reaches a live address.
export const mockResultsApi = async (page: Page): Promise<ResultsApiMock> => {
  const mock: ResultsApiMock = { requests: [] };

  await page.route(API_ADDRESS, (route) => route.abort());

  await page.route(SURVEY_ADDRESS, (route) => {
    const request = route.request();

    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }

    if (request.method() !== "GET") return route.abort();

    mock.requests.push(request.url());

    return route.fulfill({ json: resultSurveyFixture, headers: CORS_HEADERS });
  });

  return mockResultRead(page, (resultId) => resultId === RESULT_ID, mock);
};
