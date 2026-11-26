import type { Page } from "@playwright/test";

import { CORS_HEADERS } from "../survey/mockSurveyApi";
import {
  createFriendResultResponse,
  createLowMatchResultResponse,
  createResultResponse,
  FRIEND_RESULT_ID,
  LOW_MATCH_RESULT_ID,
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

// The results the mocked API of the result screen holds, by identifier: the
// taker's, the one of a friend who took the same quiz, and the one of a
// taker who is close to no identity.
const RESULT_RESPONSES: Record<string, () => unknown> = {
  [RESULT_ID]: () => createResultResponse(RESULT_ID),
  [FRIEND_RESULT_ID]: createFriendResultResponse,
  [LOW_MATCH_RESULT_ID]: createLowMatchResultResponse,
};

// Stands in for the read of a result: the calculated result it is told of
// for an identifier, and "no such result" for an identifier it is told
// nothing of. Routes registered later are asked first, so this one answers
// before the read of a result the questionnaire's mock registers.
export const mockResultRead = async (
  page: Page,
  readResult: (resultId: string) => unknown,
  mock: ResultsApiMock = { requests: [] },
): Promise<ResultsApiMock> => {
  await page.route(RESULT_READ_ADDRESS, (route) => {
    const request = route.request();

    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }

    if (request.method() !== "GET") return route.abort();

    mock.requests.push(request.url());

    const result = readResult(getLastPart(request.url()));

    return result === undefined
      ? route.fulfill({ status: 404, json: {}, headers: CORS_HEADERS })
      : route.fulfill({ json: result, headers: CORS_HEADERS });
  });

  return mock;
};

// Stands in for the API of the result screen: the result of the fixture, the
// result of a friend, the quiz both name, and nothing else - every other
// request to the API is aborted, so no test reaches a live address.
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

  return mockResultRead(
    page,
    (resultId) => RESULT_RESPONSES[resultId]?.(),
    mock,
  );
};
