import { describe, expect, it } from "vitest";

import { OWN_RESULT_MODULES } from "@/constants/result-modules";
import {
  IDENTITY_SURVEY_ID,
  PRESIDENTIAL_SURVEY_ID,
} from "@/constants/result-modules.fixtures";

import { getOwnResultModules } from "./getOwnResultModules";
import { toSingleLanguageModule } from "./toSingleLanguageModule";

// The title each record of a list holds, read in one language.
const getTitles = (surveyId: string, language: string) =>
  getOwnResultModules(surveyId, language).map(
    ({ values }) => values.find(({ key }) => key === "title")?.value,
  );

describe("getOwnResultModules()", () => {
  describe("given a survey the app keeps a list for", () => {
    it.each([
      [IDENTITY_SURVEY_ID],
      [PRESIDENTIAL_SURVEY_ID],
    ])("returns every record of the list of %s, in its order, in the language asked for", (surveyId) => {
      expect(getOwnResultModules(surveyId, "en")).toEqual(
        OWN_RESULT_MODULES[surveyId].map((record) =>
          toSingleLanguageModule(record, "en"),
        ),
      );
    });

    it("holds the texts of the identity quiz in Polish and in English", () => {
      expect(getTitles(IDENTITY_SURVEY_ID, "pl")).toEqual([
        undefined,
        "Ideologie",
        "Tożsamość",
        undefined,
        "Partie",
      ]);
      expect(getTitles(IDENTITY_SURVEY_ID, "en")).toEqual([
        undefined,
        "Ideologies",
        "Identity",
        undefined,
        "Parties",
      ]);
    });

    it("holds the label of the link of the presidential quiz in Polish and in English", () => {
      expect(
        getOwnResultModules(PRESIDENTIAL_SURVEY_ID, "pl")[0].values,
      ).toEqual([{ key: "label.link", value: "Program" }]);
      expect(
        getOwnResultModules(PRESIDENTIAL_SURVEY_ID, "en")[0].values,
      ).toEqual([{ key: "label.link", value: "Programme" }]);
    });

    it("falls back to Polish for a language the list is not written in", () => {
      expect(getOwnResultModules(IDENTITY_SURVEY_ID, "de")).toEqual(
        getOwnResultModules(IDENTITY_SURVEY_ID, "pl"),
      );
    });

    it("leaves a plain value as it is in every language", () => {
      for (const language of ["pl", "en"]) {
        expect(
          getOwnResultModules(PRESIDENTIAL_SURVEY_ID, language)[1].values,
        ).toContainEqual({ key: "visibleRows", value: 13 });
        expect(
          getOwnResultModules(IDENTITY_SURVEY_ID, language)[4].values,
        ).toContainEqual({ key: "selection", value: "linked_to_leader" });
      }
    });

    it("leaves the list it keeps as it is", () => {
      const before = structuredClone(OWN_RESULT_MODULES);

      getOwnResultModules(IDENTITY_SURVEY_ID, "en");

      expect(OWN_RESULT_MODULES).toEqual(before);
    });
  });

  describe("given any other survey", () => {
    it.each([
      ["96032c50-f243-4d2c-86a5-9088dd077417"],
      [""],
      ["mypolitics"],
      ["constructor"],
      ["toString"],
      ["__proto__"],
    ])("returns an empty list for %j", (surveyId) => {
      expect(getOwnResultModules(surveyId, "pl")).toEqual([]);
    });
  });
});
