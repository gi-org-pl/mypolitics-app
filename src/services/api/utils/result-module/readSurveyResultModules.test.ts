import { describe, expect, it } from "vitest";

import { OWN_RESULT_MODULES } from "@/constants/result-modules";
import {
  IDENTITY_SURVEY_ID,
  LIVE_QUIZ_IDS,
  OWN_RECORD_IDS,
  PRESIDENTIAL_SURVEY_ID,
} from "@/constants/result-modules.fixtures";
import { getOwnResultModules } from "./getOwnResultModules";
import { readResultModules } from "./readResultModules";
import { readSurveyResultModules } from "./readSurveyResultModules";

const OTHER_SURVEY_ID = "96032c50-f243-4d2c-86a5-9088dd077417";

const toKnown = (surveyId: string) => ({
  orientationIds: new Set(LIVE_QUIZ_IDS[surveyId].orientationIds),
  axisIds: new Set(LIVE_QUIZ_IDS[surveyId].axisIds),
});

const known = toKnown(IDENTITY_SURVEY_ID);

// The first orientation the header of the identity quiz is about.
const [header] = OWN_RESULT_MODULES[IDENTITY_SURVEY_ID];
const [identity] = header.orientationIds ?? [];

const apiList = [
  { id: "api-traits", type: "traits", position: 1, orientationIds: [identity] },
  { id: "api-header", type: "header", position: 0, orientationIds: [identity] },
];

describe("readSurveyResultModules()", () => {
  describe("given a survey the app keeps a list for, and no list from the API", () => {
    it.each([
      [IDENTITY_SURVEY_ID, 5],
      [PRESIDENTIAL_SURVEY_ID, 4],
    ])("holds the app's own list of %s, read with readResultModules", (surveyId, count) => {
      const modules = readSurveyResultModules(
        undefined,
        { id: surveyId, language: "pl" },
        toKnown(surveyId),
      );

      expect(modules).toHaveLength(count);
      expect(modules).toEqual(
        readResultModules(
          getOwnResultModules(surveyId, "pl"),
          toKnown(surveyId),
        ),
      );
    });

    it.each([
      ["pl", ["Ideologie", "Tożsamość", "Partie"]],
      ["en", ["Ideologies", "Identity", "Parties"]],
      ["de", ["Ideologie", "Tożsamość", "Partie"]],
    ])("holds its texts in the language asked for, or in Polish: %s", (language, titles) => {
      expect(
        readSurveyResultModules(
          undefined,
          { id: IDENTITY_SURVEY_ID, language },
          known,
        ).flatMap(({ values }) => values.title ?? []),
      ).toEqual(titles);
    });

    it.each([
      [null],
      [[]],
      [""],
      ["resultModules"],
      [7],
      [{}],
    ])("holds the app's own list when the API's is %j", (response) => {
      expect(
        readSurveyResultModules(
          response,
          { id: IDENTITY_SURVEY_ID, language: "pl" },
          known,
        ).map(({ id }) => id),
      ).toEqual([
        OWN_RECORD_IDS.identityHeader,
        OWN_RECORD_IDS.identityIdeologies,
        OWN_RECORD_IDS.identityArchetype,
        OWN_RECORD_IDS.identityCompass,
        OWN_RECORD_IDS.identityParties,
      ]);
    });

    it("holds the app's own list when no record of the API's can be placed", () => {
      expect(
        readSurveyResultModules(
          [null, { id: "radar", type: "radar", position: 0 }, { id: "traits" }],
          { id: IDENTITY_SURVEY_ID, language: "pl" },
          known,
        ),
      ).toHaveLength(5);
    });

    it("keeps only the orientations and axes the quiz has", () => {
      const modules = readSurveyResultModules(
        undefined,
        { id: IDENTITY_SURVEY_ID, language: "pl" },
        { orientationIds: new Set([identity]), axisIds: new Set() },
      );

      expect(modules).toHaveLength(5);
      // The header, the axes, the identity card, the map and the parties.
      expect(modules.map(({ orientationIds }) => orientationIds)).toEqual([
        [identity],
        [],
        [identity],
        [],
        [],
      ]);
      expect(modules.flatMap(({ axisIds }) => axisIds)).toEqual([]);
    });
  });

  describe("given a survey the app keeps a list for, and a list from the API", () => {
    it("holds the API's list, and nothing of the app's own", () => {
      const modules = readSurveyResultModules(
        apiList,
        { id: IDENTITY_SURVEY_ID, language: "pl" },
        known,
      );

      expect(modules).toEqual(readResultModules(apiList, known));
      expect(modules.map(({ id }) => id)).toEqual(["api-header", "api-traits"]);
    });

    it("holds the API's list as soon as one of its records can be placed", () => {
      expect(
        readSurveyResultModules(
          [null, { id: "radar", type: "radar", position: 0 }, apiList[0]],
          { id: IDENTITY_SURVEY_ID, language: "pl" },
          known,
        ).map(({ id }) => id),
      ).toEqual(["api-traits"]);
    });
  });

  describe("given any other survey", () => {
    it("holds the API's list", () => {
      expect(
        readSurveyResultModules(
          apiList,
          { id: OTHER_SURVEY_ID, language: "pl" },
          known,
        ),
      ).toEqual(readResultModules(apiList, known));
    });

    it.each([
      [undefined],
      [null],
      [[]],
      [{}],
    ])("holds an empty list when the API's is %j", (response) => {
      expect(
        readSurveyResultModules(
          response,
          { id: OTHER_SURVEY_ID, language: "pl" },
          known,
        ),
      ).toEqual([]);
    });
  });
});
