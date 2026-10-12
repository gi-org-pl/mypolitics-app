import { describe, expect, it } from "vitest";

import { QUIZ_PROJECT_IDS } from "@/constants/survey";
import type { Project } from "@/types/project";
import { SurveyLoadStatus } from "@/types/survey";

import { readProject } from "./readProject";
import {
  electionQuizProject,
  identityQuizProject,
  presidentialQuizProject,
} from "./readProject.fixtures";

const PROJECT_ID = "5ab50822-e95e-4c7c-a1d6-14aceb68f108";
const SURVEY_ID = "60beb898-a4e4-4160-88c4-07a9931ab499";

const read = (response: Record<string, unknown>): Project => {
  const result = readProject(response, PROJECT_ID);

  if (result.status !== SurveyLoadStatus.Ready) {
    throw new Error(`The project was read as ${result.status}`);
  }

  return result.project;
};

describe("readProject()", () => {
  describe("given something that is not a project", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["<html></html>"],
      [7],
      [true],
      [[]],
      [[{ id: PROJECT_ID, latestSurveyId: SURVEY_ID }]],
      [{}],
      [{ name: "myPolitics Quiz Tożsamościowy" }],
      [{ latestSurveyId: SURVEY_ID }],
      [{ id: "", latestSurveyId: SURVEY_ID }],
      [{ message: "Project with given ID not found.", statusCode: 404 }],
    ])("returns failed for %j", (response) => {
      expect(readProject(response, PROJECT_ID)).toEqual({
        status: SurveyLoadStatus.Failed,
      });
    });
  });

  describe("given a project whose latest survey is neither an identifier nor null", () => {
    it.each([
      [{ id: PROJECT_ID }],
      [{ id: PROJECT_ID, latestSurveyId: "" }],
      [{ id: PROJECT_ID, latestSurveyId: 7 }],
      [{ id: PROJECT_ID, latestSurveyId: { id: SURVEY_ID } }],
    ])("returns failed for %j", (response) => {
      expect(readProject(response, PROJECT_ID)).toEqual({
        status: SurveyLoadStatus.Failed,
      });
    });
  });

  describe("given a project with a latest survey", () => {
    it("returns ready with the identifier of that survey", () => {
      expect(
        readProject({ id: PROJECT_ID, latestSurveyId: SURVEY_ID }, PROJECT_ID),
      ).toEqual({
        status: SurveyLoadStatus.Ready,
        project: { id: PROJECT_ID, latestSurveyId: SURVEY_ID },
      });
    });

    it("uses the identifier it was asked for by, not the one of the reply", () => {
      expect(
        read({ id: "another-identifier", latestSurveyId: SURVEY_ID }).id,
      ).toBe(PROJECT_ID);
    });

    it("carries nothing else of the reply", () => {
      expect(
        Object.keys(
          read({
            id: PROJECT_ID,
            name: "myPolitics Quiz Tożsamościowy",
            latestSurveyId: SURVEY_ID,
            createdAt: "2025-04-28T19:12:01.889Z",
            totalSolvedSurveys: 375_639,
            surveys: [{ id: SURVEY_ID, version: "mp-qt-1" }],
            defaultLanguage: "pl",
            supportedLanguages: ["pl"],
          }),
        ).sort(),
      ).toEqual(["id", "latestSurveyId"]);
    });
  });

  describe("given a project with no survey to take", () => {
    it("returns ready without a latest survey", () => {
      const result = readProject(
        { id: PROJECT_ID, latestSurveyId: null },
        PROJECT_ID,
      );

      expect(result).toEqual({
        status: SurveyLoadStatus.Ready,
        project: { id: PROJECT_ID },
      });
      expect(
        read({ id: PROJECT_ID, latestSurveyId: null }).latestSurveyId,
      ).toBeUndefined();
    });
  });

  describe("given the live shapes", () => {
    it("reads the project of the identity quiz", () => {
      expect(
        readProject(identityQuizProject, QUIZ_PROJECT_IDS.mypolitics),
      ).toEqual({
        status: SurveyLoadStatus.Ready,
        project: {
          id: "5ab50822-e95e-4c7c-a1d6-14aceb68f108",
          latestSurveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
        },
      });
    });

    it("reads the project of the presidential quiz", () => {
      expect(
        readProject(presidentialQuizProject, QUIZ_PROJECT_IDS.prezydencki2025),
      ).toEqual({
        status: SurveyLoadStatus.Ready,
        project: {
          id: "69ef6c38-7292-4096-a9ef-a58e682dbfde",
          latestSurveyId: "270f6c12-6551-4661-bfcf-52635a703928",
        },
      });
    });

    it("reads a project that names no latest survey", () => {
      expect(readProject(electionQuizProject, electionQuizProject.id)).toEqual({
        status: SurveyLoadStatus.Ready,
        project: { id: "044a0a2b-8fce-4308-927e-7f4a4c29be84" },
      });
    });

    it("has a fixture for every project of the map", () => {
      expect(
        [identityQuizProject, presidentialQuizProject].map(({ id }) => id),
      ).toEqual(Object.values(QUIZ_PROJECT_IDS));
    });
  });
});
