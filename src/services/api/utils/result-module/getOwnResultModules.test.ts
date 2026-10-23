import { describe, expect, it } from "vitest";

import { OWN_RESULT_MODULES } from "@/constants/result-modules";
import {
  IDENTITY_SURVEY_ID,
  PRESIDENTIAL_SURVEY_ID,
} from "@/constants/result-modules.fixtures";

import { getOwnResultModules } from "./getOwnResultModules";
import { toSingleLanguageModule } from "./toSingleLanguageModule";

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
      expect(
        getOwnResultModules(IDENTITY_SURVEY_ID, "pl").map(({ title }) => title),
      ).toEqual([undefined, "Tożsamość", "Ideologie", undefined, "Partie"]);
      expect(
        getOwnResultModules(IDENTITY_SURVEY_ID, "en").map(({ title }) => title),
      ).toEqual([undefined, "Identity", "Ideologies", undefined, "Parties"]);
    });

    it("holds the label of the link of the presidential quiz in Polish and in English", () => {
      expect(
        getOwnResultModules(PRESIDENTIAL_SURVEY_ID, "pl")[0].labels,
      ).toEqual({ link: "Program" });
      expect(
        getOwnResultModules(PRESIDENTIAL_SURVEY_ID, "en")[0].labels,
      ).toEqual({ link: "Programme" });
    });

    it("falls back to Polish for a language the list is not written in", () => {
      expect(getOwnResultModules(IDENTITY_SURVEY_ID, "de")).toEqual(
        getOwnResultModules(IDENTITY_SURVEY_ID, "pl"),
      );
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
