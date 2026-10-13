import { describe, expect, it } from "vitest";

import type { ComparedQuestion } from "@/types/comparison";

import {
  friendQuestions,
  orientationQuestions,
} from "../ComparisonQuestions.fixtures";
import type { QuestionsFilter } from "../ComparisonQuestions.types";
import { filterComparedQuestions } from "./filterComparedQuestions";

const EVERY_QUESTION = [
  "democracy",
  "future",
  "breadwinner",
  "housing",
  "rents",
  "prices",
  "vaccines",
  "army",
];

const listIds = (
  questions: ComparedQuestion[],
  filter: Partial<QuestionsFilter> = {},
) =>
  filterComparedQuestions(questions, {
    search: "",
    isOnlyDisagreement: false,
    ...filter,
  }).map(({ question }) => question.id);

describe("filterComparedQuestions()", () => {
  describe("given no search and the filter off", () => {
    it("lists every question, in the order given", () => {
      expect(listIds(orientationQuestions)).toEqual(EVERY_QUESTION);
      expect(listIds(friendQuestions)).toEqual(EVERY_QUESTION);
    });
  });

  describe("given a search", () => {
    it("lists the questions whose text contains it", () => {
      expect(listIds(orientationQuestions, { search: "Unii" })).toEqual([
        "future",
      ]);
    });

    it("ignores letter case", () => {
      expect(listIds(orientationQuestions, { search: "UNI" })).toEqual([
        "democracy",
        "future",
      ]);
      expect(listIds(orientationQuestions, { search: "unia" })).toEqual([
        "democracy",
      ]);
    });

    it("ignores the space around it", () => {
      expect(listIds(orientationQuestions, { search: "  czynsz " })).toEqual([
        "rents",
      ]);
    });

    it("keeps the order of the quiz", () => {
      expect(listIds(orientationQuestions, { search: "mieszka" })).toEqual([
        "housing",
        "prices",
      ]);
    });

    it("looks at the text of the question, not at its answers", () => {
      expect(listIds(orientationQuestions, { search: "Dopłaty" })).toEqual([]);
      expect(listIds(orientationQuestions, { search: "Zdecydowanie" })).toEqual(
        [],
      );
    });

    it("lists nothing when no text contains it", () => {
      expect(listIds(orientationQuestions, { search: "podatki" })).toEqual([]);
    });
  });

  describe("given only disagreement", () => {
    it("lists the questions the taker and an orientation disagree on", () => {
      expect(
        listIds(orientationQuestions, { isOnlyDisagreement: true }),
      ).toEqual(["breadwinner", "housing"]);
    });

    it("lists the questions the taker and a friend disagree on", () => {
      expect(listIds(friendQuestions, { isOnlyDisagreement: true })).toEqual([
        "future",
        "housing",
        "prices",
      ]);
    });

    it("leaves out a question one side has no answer to: it is no disagreement", () => {
      const listed = listIds(friendQuestions, { isOnlyDisagreement: true });

      expect(listed).not.toContain("rents");
      expect(listed).not.toContain("army");
    });
  });

  describe("given a search and only disagreement together", () => {
    it("lists the questions that pass both", () => {
      expect(
        listIds(orientationQuestions, {
          search: "mieszka",
          isOnlyDisagreement: true,
        }),
      ).toEqual(["housing"]);
    });

    it("lists nothing when none passes both", () => {
      expect(
        listIds(orientationQuestions, {
          search: "unia",
          isOnlyDisagreement: true,
        }),
      ).toEqual([]);
    });
  });

  describe("given no question", () => {
    it("lists nothing", () => {
      expect(listIds([])).toEqual([]);
      expect(listIds([], { search: "unia", isOnlyDisagreement: true })).toEqual(
        [],
      );
    });
  });

  describe("given any list", () => {
    it("leaves it as it is, and hands the questions on unchanged", () => {
      const before = [...orientationQuestions];
      const listed = filterComparedQuestions(orientationQuestions, {
        search: "unii",
        isOnlyDisagreement: false,
      });

      expect(orientationQuestions).toEqual(before);
      expect(listed[0]).toBe(orientationQuestions[1]);
    });
  });
});
