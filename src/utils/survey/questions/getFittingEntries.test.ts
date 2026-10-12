import { describe, expect, it } from "vitest";

import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { getFittingEntries } from "./getFittingEntries";

describe("getFittingEntries()", () => {
  const survey = createSurvey();

  describe("given entries that fit the quiz", () => {
    it("keeps answers and skips of the first questions, in order", () => {
      const entries = [
        { questionId: "q1", answerId: "q1-agree" },
        { questionId: "q2" },
        { questionId: "q3", answerId: "q3-strongly-disagree" },
      ];

      expect(getFittingEntries(survey, entries)).toEqual(entries);
    });

    it("keeps an entry for every question of the quiz", () => {
      const entries = survey.questions.map(({ id }) => ({ questionId: id }));

      expect(getFittingEntries(survey, entries)).toEqual(entries);
    });

    it("returns an empty list for no entries", () => {
      expect(getFittingEntries(survey, [])).toEqual([]);
    });
  });

  describe("given an entry that does not fit", () => {
    it("ends the list at a question that is not at its place", () => {
      expect(
        getFittingEntries(survey, [
          { questionId: "q1" },
          { questionId: "q3" },
          { questionId: "q2" },
        ]),
      ).toEqual([{ questionId: "q1" }]);
    });

    it("ends the list at a question the quiz does not have", () => {
      expect(
        getFittingEntries(survey, [
          { questionId: "gone" },
          { questionId: "q2" },
        ]),
      ).toEqual([]);
    });

    it("ends the list at an answer the question does not have", () => {
      expect(
        getFittingEntries(survey, [
          { questionId: "q1", answerId: "q1-agree" },
          { questionId: "q2", answerId: "q1-agree" },
          { questionId: "q3", answerId: "q3-agree" },
        ]),
      ).toEqual([{ questionId: "q1", answerId: "q1-agree" }]);
    });

    it("ends the list at an entry that could not be read", () => {
      expect(
        getFittingEntries(survey, [
          { questionId: "q1" },
          undefined,
          { questionId: "q3" },
        ]),
      ).toEqual([{ questionId: "q1" }]);
    });

    it("ends the list at a question that is done twice", () => {
      expect(
        getFittingEntries(survey, [{ questionId: "q1" }, { questionId: "q1" }]),
      ).toEqual([{ questionId: "q1" }]);
    });

    it("ends the list where the quiz has no more questions", () => {
      const entries = [
        ...survey.questions.map(({ id }) => ({ questionId: id })),
        { questionId: "q6" },
      ];

      expect(getFittingEntries(survey, entries)).toHaveLength(5);
    });
  });

  describe("given a quiz that changed since the entries were stored", () => {
    it("keeps the entries up to the first question that moved", () => {
      const shorter = createSurvey({
        questions: survey.questions.filter(({ id }) => id !== "q3"),
      });

      expect(
        getFittingEntries(
          shorter,
          survey.questions.map(({ id }) => ({ questionId: id })),
        ),
      ).toEqual([{ questionId: "q1" }, { questionId: "q2" }]);
    });
  });
});
