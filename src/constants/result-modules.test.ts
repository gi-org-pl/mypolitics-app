import { describe, expect, it } from "vitest";

import { getOwnResultModules } from "@/services/api/utils/result-module/getOwnResultModules";
import { readResultModules } from "@/services/api/utils/result-module/readResultModules";
import { getModuleParams } from "@/utils/result-modules/params/getModuleParams";
import { resolveResult } from "@/utils/result-modules/resolveResult";

import { OWN_RESULT_MODULES } from "./result-modules";
import {
  IDENTITY_SURVEY_ID,
  LIVE_QUIZ_IDS,
  PRESIDENTIAL_SURVEY_ID,
} from "./result-modules.fixtures";
import { OWN_LIST_RESULTS } from "./result-modules-resolved.fixtures";

const SURVEYS = [
  ["the identity quiz", IDENTITY_SURVEY_ID],
  ["the presidential quiz", PRESIDENTIAL_SURVEY_ID],
] as const;

// The settings a record held as fields before they became parameters.
const SETTINGS = ["selection", "groupBy", "marker", "visibleRows"];

// The same value with every orientation written as its identifier, and every
// field that has no value left out: the form the values resolved before this
// change are kept in.
const withOrientationIds = (resolved: unknown): unknown =>
  JSON.parse(
    JSON.stringify(resolved, (key, value) =>
      key === "orientation" ? value.id : value,
    ),
  );

describe("OWN_RESULT_MODULES", () => {
  it("keeps a list for the identity quiz and the presidential quiz, and for no other", () => {
    expect(Object.keys(OWN_RESULT_MODULES)).toEqual([
      IDENTITY_SURVEY_ID,
      PRESIDENTIAL_SURVEY_ID,
    ]);
  });

  describe("given the list of the identity quiz", () => {
    it("is the header, then per column the modules of the old identity result", () => {
      expect(
        OWN_RESULT_MODULES[IDENTITY_SURVEY_ID].map(
          ({ type, column, title }) => [type, column, title?.pl],
        ),
      ).toEqual([
        ["header", undefined, undefined],
        ["archetype", "end", "Tożsamość"],
        ["multi_axis", "start", "Ideologie"],
        ["nolan_chart", "end", undefined],
        ["horizontal_bar", "start", "Partie"],
      ]);
    });
  });

  describe("given the map of the identity quiz", () => {
    const labels =
      OWN_RESULT_MODULES[IDENTITY_SURVEY_ID].find(
        ({ type }) => type === "nolan_chart",
      )?.labels ?? {};

    it.each([
      ["bottomLeft", "Lewicowy", "Left-wing"],
      ["topRight", "Prawicowy", "Right-wing"],
      ["topLeft", "Mieszany", "Mixed"],
      ["bottomRight", "Mieszany", "Mixed"],
    ])("names the %s corner, the same at both levels and in both languages", (corner, pl, en) => {
      expect(labels[`${corner}Moderate`]).toEqual({ pl, en });
      expect(labels[`${corner}Extreme`]).toEqual({ pl, en });
    });

    it("names the middle, and gives no corner a shorter form", () => {
      expect(labels.centre).toEqual({ pl: "Centrowy", en: "Centrist" });
      expect(
        Object.keys(labels).filter((slot) => slot.endsWith("Short")),
      ).toEqual([]);
    });
  });

  describe("given the list of the presidential quiz", () => {
    it("is the header, then per column the modules of the old presidential result", () => {
      expect(
        OWN_RESULT_MODULES[PRESIDENTIAL_SURVEY_ID].map(
          ({ type, column, title }) => [type, column, title?.pl],
        ),
      ).toEqual([
        ["header", undefined, undefined],
        ["horizontal_bar", "start", "Kandydaci"],
        ["archetype", "end", "Prezydent"],
        ["horizontal_bar", "end", "Kategorie"],
      ]);
    });
  });

  // A list is written in parameters: a setting that differs from its default
  // is a name in `params`, and one equal to its default is left out.
  describe.each(
    SURVEYS,
  )("given the parameters of the list of %s", (_, surveyId) => {
    const records = readResultModules(getOwnResultModules(surveyId, "pl"), {
      orientationIds: new Set(LIVE_QUIZ_IDS[surveyId].orientationIds),
      axisIds: new Set(LIVE_QUIZ_IDS[surveyId].axisIds),
    });

    it("writes every record with its parameters, and none of the four settings as a field", () => {
      for (const record of OWN_RESULT_MODULES[surveyId]) {
        expect(record).toHaveProperty("params");
        expect(
          Object.keys(record).filter((key) => SETTINGS.includes(key)),
        ).toEqual([]);
      }
    });

    it("sets only names the type of the record reads", () => {
      for (const record of records) {
        expect(Object.keys(getModuleParams(record))).toEqual(
          expect.arrayContaining(Object.keys(record.params)),
        );
      }
    });

    it("leaves out every setting equal to its default: each one it sets is read as something else", () => {
      for (const record of records) {
        const set: Record<string, unknown> = getModuleParams(record);
        const defaults: Record<string, unknown> = getModuleParams({
          ...record,
          params: {},
        });

        for (const name of Object.keys(record.params)) {
          expect(set[name]).not.toBe(defaults[name]);
        }
      }
    });
  });

  it("sets the parameters the old result pages had in code, and no other", () => {
    expect(
      Object.values(OWN_RESULT_MODULES).flatMap((records) =>
        records.flatMap(({ id, params = {} }) =>
          Object.keys(params).length > 0 ? [[id, params]] : [],
        ),
      ),
    ).toEqual([
      ["identity-ideologies", { groupBy: "category" }],
      ["identity-parties", { selection: "linked_to_leader" }],
      ["presidential-candidates", { visibleRows: 13 }],
      ["presidential-categories", { groupBy: "category" }],
    ]);
  });

  // Nothing a taker sees depends on the shape a record is saved in: the lists
  // resolve to what they resolved to while the settings were fields.
  describe.each(
    OWN_LIST_RESULTS,
  )("given the list of %s and a result of that quiz", (_, survey, result, resolvedBefore) => {
    const resolved = resolveResult(survey, result);

    it("resolves the app's own list, with every record of it", () => {
      expect(survey.resultModules.map(({ id }) => id)).toEqual(
        OWN_RESULT_MODULES[survey.id].map(({ id }) => id),
      );
    });

    it("gives the header and every module what they were given before the settings became parameters", () => {
      expect(withOrientationIds(resolved)).toEqual(resolvedBefore);
    });
  });

  // The lists match their quizzes: read against every orientation and every
  // axis the live quiz has, a list loses nothing.
  describe.each(
    SURVEYS,
  )("given the list of %s and the identifiers of that quiz", (_, surveyId) => {
    const records = OWN_RESULT_MODULES[surveyId];
    const known = {
      orientationIds: new Set(LIVE_QUIZ_IDS[surveyId].orientationIds),
      axisIds: new Set(LIVE_QUIZ_IDS[surveyId].axisIds),
    };

    describe.each(["pl", "en"])("when it is read in %s", (language) => {
      const modules = readResultModules(
        getOwnResultModules(surveyId, language),
        known,
      );

      it("drops no record and keeps the order it is written in", () => {
        expect(modules.map(({ id }) => id)).toEqual(
          records.map(({ id }) => id),
        );
      });

      it("drops no orientation and no axis", () => {
        expect(
          modules.map(({ orientationIds, axisIds }) => ({
            orientationIds,
            axisIds,
          })),
        ).toEqual(
          records.map(({ orientationIds = [], axisIds = [] }) => ({
            orientationIds,
            axisIds,
          })),
        );
      });

      it("holds every title, description and label in that language", () => {
        expect(
          modules.map(({ title, description, labels }) => ({
            title,
            description,
            labels,
          })),
        ).toEqual(
          records.map(({ title, description, labels = {} }) => ({
            title: title?.[language],
            description: description?.[language],
            labels: Object.fromEntries(
              Object.entries(labels).map(([slot, text]) => [
                slot,
                text[language],
              ]),
            ),
          })),
        );
      });
    });
  });
});
