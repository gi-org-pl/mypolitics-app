import { describe, expect, it } from "vitest";

import { getOwnResultModules } from "@/services/api/utils/result-module/getOwnResultModules";
import { readResultModules } from "@/services/api/utils/result-module/readResultModules";

import { OWN_RESULT_MODULES } from "./result-modules";
import {
  IDENTITY_SURVEY_ID,
  LIVE_QUIZ_IDS,
  PRESIDENTIAL_SURVEY_ID,
} from "./result-modules.fixtures";

const SURVEYS = [
  ["the identity quiz", IDENTITY_SURVEY_ID],
  ["the presidential quiz", PRESIDENTIAL_SURVEY_ID],
] as const;

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
      [
        "topLeft",
        "Lewicowy gospodarczo, prawicowy światopoglądowo",
        "Economically left-wing, socially right-wing",
      ],
      [
        "bottomRight",
        "Prawicowy gospodarczo, lewicowy światopoglądowo",
        "Economically right-wing, socially left-wing",
      ],
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
