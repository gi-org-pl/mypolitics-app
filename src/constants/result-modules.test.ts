import { describe, expect, it } from "vitest";

import { getOwnResultModules } from "@/services/api/utils/result-module/getOwnResultModules";
import { readResultModules } from "@/services/api/utils/result-module/readResultModules";
import type { OwnResultModule } from "@/types/results";
import { resolveResult } from "@/utils/result-modules/resolveResult";
import { getModuleValues } from "@/utils/result-modules/values/getModuleValues";

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

// What a record held as fields of its own before everything about a module
// became a pair of a key and a value.
const FIELDS_BEFORE = [
  "title",
  "description",
  "params",
  "labels",
  "colors",
  "selection",
  "groupBy",
  "marker",
  "visibleRows",
];

// The keys that are settings: the ones the old result pages had in code.
const SETTINGS = ["selection", "groupBy", "marker", "visibleRows"];

// What a record of a list holds under a key.
const findValue = (record: OwnResultModule, key: string) =>
  record.values.find((pair) => pair.key === key)?.value;

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
        OWN_RESULT_MODULES[IDENTITY_SURVEY_ID].map((record) => [
          record.type,
          record.column,
          findValue(record, "title"),
        ]),
      ).toEqual([
        ["header", undefined, undefined],
        ["archetype", "end", { pl: "Tożsamość", en: "Identity" }],
        ["multi_axis", "start", { pl: "Ideologie", en: "Ideologies" }],
        ["nolan_chart", "end", undefined],
        ["horizontal_bar", "start", { pl: "Partie", en: "Parties" }],
      ]);
    });
  });

  describe("given the map of the identity quiz", () => {
    const [map] = OWN_RESULT_MODULES[IDENTITY_SURVEY_ID].filter(
      ({ type }) => type === "nolan_chart",
    );

    it.each([
      ["bottomLeft", "Lewicowy", "Left-wing"],
      ["topRight", "Prawicowy", "Right-wing"],
      ["topLeft", "Mieszany", "Mixed"],
      ["bottomRight", "Mieszany", "Mixed"],
    ])("names the %s corner, the same at both levels and in both languages", (corner, pl, en) => {
      expect(findValue(map, `label.${corner}Moderate`)).toEqual({ pl, en });
      expect(findValue(map, `label.${corner}Extreme`)).toEqual({ pl, en });
    });

    it("names the middle, and gives no corner a shorter form or a colour", () => {
      expect(findValue(map, "label.centre")).toEqual({
        pl: "Centrowy",
        en: "Centrist",
      });
      expect(
        map.values.filter(
          ({ key }) => key.endsWith("Short") || key.startsWith("color."),
        ),
      ).toEqual([]);
    });
  });

  describe("given the list of the presidential quiz", () => {
    it("is the header, then per column the modules of the old presidential result", () => {
      expect(
        OWN_RESULT_MODULES[PRESIDENTIAL_SURVEY_ID].map((record) => [
          record.type,
          record.column,
          findValue(record, "title"),
        ]),
      ).toEqual([
        ["header", undefined, undefined],
        ["horizontal_bar", "start", { pl: "Kandydaci", en: "Candidates" }],
        ["archetype", "end", { pl: "Prezydent", en: "President" }],
        ["horizontal_bar", "end", { pl: "Kategorie", en: "Categories" }],
      ]);
    });

    it("names the link of the header in both languages", () => {
      const [header] = OWN_RESULT_MODULES[PRESIDENTIAL_SURVEY_ID];

      expect(header.values).toEqual([
        { key: "label.link", value: { pl: "Program", en: "Programme" } },
      ]);
    });
  });

  // A list is written in pairs: everything about a module beyond what it is,
  // where it stands and what it points at is a key, and a key equal to its
  // default is left out.
  describe.each(
    SURVEYS,
  )("given the values of the list of %s", (_, surveyId) => {
    const records = readResultModules(getOwnResultModules(surveyId, "pl"), {
      orientationIds: new Set(LIVE_QUIZ_IDS[surveyId].orientationIds),
      axisIds: new Set(LIVE_QUIZ_IDS[surveyId].axisIds),
    });

    it("writes every record with a list of pairs, and none of what a record held as a field before", () => {
      for (const record of OWN_RESULT_MODULES[surveyId]) {
        expect(Array.isArray(record.values)).toBe(true);
        expect(
          Object.keys(record).filter((field) => FIELDS_BEFORE.includes(field)),
        ).toEqual([]);
      }
    });

    it("holds a key once in a record", () => {
      for (const { values } of OWN_RESULT_MODULES[surveyId]) {
        const keys = values.map(({ key }) => key);

        expect(new Set(keys).size).toBe(keys.length);
      }
    });

    it("sets only keys the type of the record reads", () => {
      for (const record of records) {
        expect(Object.keys(getModuleValues(record))).toEqual(
          expect.arrayContaining(Object.keys(record.values)),
        );
      }
    });

    it("leaves out every key equal to its default: each one it sets is read as something else", () => {
      for (const record of records) {
        const set: Record<string, unknown> = getModuleValues(record);
        const defaults: Record<string, unknown> = getModuleValues({
          ...record,
          values: {},
        });

        for (const key of Object.keys(record.values)) {
          expect([key, set[key]]).not.toEqual([key, defaults[key]]);
        }
      }
    });
  });

  it("sets the settings the old result pages had in code, and no other", () => {
    expect(
      Object.values(OWN_RESULT_MODULES).flatMap((records) =>
        records.flatMap(({ id, values }) =>
          values
            .filter(({ key }) => SETTINGS.includes(key))
            .map(({ key, value }) => [id, key, value]),
        ),
      ),
    ).toEqual([
      ["identity-ideologies", "groupBy", "category"],
      ["identity-parties", "selection", "linked_to_leader"],
      ["presidential-candidates", "visibleRows", 13],
      ["presidential-categories", "groupBy", "category"],
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

      it("holds every pair by its key: a text in that language, a plain value as it is", () => {
        expect(modules.map(({ values }) => values)).toEqual(
          records.map(({ values }) =>
            Object.fromEntries(
              values.map(({ key, value }) => [
                key,
                typeof value === "object" && value !== null
                  ? value[language]
                  : value,
              ]),
            ),
          ),
        );
      });
    });
  });
});
