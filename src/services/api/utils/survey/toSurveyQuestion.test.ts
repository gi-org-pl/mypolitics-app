import { describe, expect, it } from "vitest";

import { questionResponseSchema } from "@/services/api/schemas/survey";

import { toSurveyQuestion } from "./toSurveyQuestion";

const quiz = {
  categoryIds: new Set(["world-view", "economy"]),
  orientationIds: new Set(["left", "right", "hidden"]),
};

const read = (
  response: Record<string, unknown>,
): ReturnType<typeof toSurveyQuestion> =>
  toSurveyQuestion(
    questionResponseSchema.parse({
      id: "q1",
      text: "Stwierdzenie.",
      possibleAnswers: [{ id: "a1", text: "Tak" }],
      ...response,
    }),
    quiz,
  );

describe("toSurveyQuestion()", () => {
  describe("given a question with every field", () => {
    it("maps the identifier, the category, the statement, the explanation and the answers", () => {
      expect(
        read({
          id: "30eb37ca",
          surveyId: "60beb898",
          categoryId: "world-view",
          text: "Rząd powinien promować postawy patriotyczne wśród obywateli.",
          explanation: "Na przykład w szkołach.",
          answerType: "AGREE_OR_DISAGREE",
          status: "LIVE",
          possibleAnswers: [
            {
              id: "c1646132",
              text: "Zdecydowanie za",
              weight: 2,
              questionId: "30eb37ca",
              orientationIds: ["right"],
            },
            {
              id: "94ce6676",
              text: "Zdecydowanie przeciw",
              weight: 4,
              questionId: "30eb37ca",
              orientationIds: ["left", "hidden"],
            },
          ],
        }),
      ).toEqual({
        id: "30eb37ca",
        categoryId: "world-view",
        text: "Rząd powinien promować postawy patriotyczne wśród obywateli.",
        explanation: "Na przykład w szkołach.",
        answerType: "agree-or-disagree",
        possibleAnswers: [
          {
            id: "c1646132",
            text: "Zdecydowanie za",
            weight: 2,
            orientationIds: ["right"],
          },
          {
            id: "94ce6676",
            text: "Zdecydowanie przeciw",
            weight: 4,
            orientationIds: ["left", "hidden"],
          },
        ],
      });
    });

    it("carries neither the survey, the status nor the question of an answer", () => {
      const question = read({
        surveyId: "60beb898",
        status: "LIVE",
        possibleAnswers: [{ id: "a1", text: "Tak", questionId: "q1" }],
      });

      expect(question).not.toHaveProperty("surveyId");
      expect(question).not.toHaveProperty("status");
      expect(question.possibleAnswers[0]).not.toHaveProperty("questionId");
    });
  });

  describe("given an answer type", () => {
    it("maps the two answer types, and anything else to other", () => {
      expect(read({ answerType: "AGREE_OR_DISAGREE" }).answerType).toBe(
        "agree-or-disagree",
      );
      expect(read({ answerType: "ONE_OF_MANY" }).answerType).toBe(
        "one-of-many",
      );
      expect(read({ answerType: "MANY_OF_MANY" }).answerType).toBe("other");
      expect(read({ answerType: 7 }).answerType).toBe("other");
      expect(read({ answerType: null }).answerType).toBe("other");
      expect(read({}).answerType).toBe("other");
    });
  });

  describe("given text with space or line breaks around it", () => {
    it("trims the statement and the explanation, and has no explanation when it is blank", () => {
      expect(
        read({ text: "\n Stwierdzenie. ", explanation: " Wyjaśnienie.\n" }),
      ).toMatchObject({ text: "Stwierdzenie.", explanation: "Wyjaśnienie." });
      expect(read({ explanation: " \n " }).explanation).toBeUndefined();
      expect(read({ explanation: "" }).explanation).toBeUndefined();
      expect(read({ explanation: null }).explanation).toBeUndefined();
      expect(read({}).explanation).toBeUndefined();
    });
  });

  describe("given a category", () => {
    it("keeps a category the quiz has", () => {
      expect(read({ categoryId: "economy" }).categoryId).toBe("economy");
    });

    it("has no category when the quiz does not have it, or none is named", () => {
      expect(read({ categoryId: "ecology" }).categoryId).toBeUndefined();
      expect(read({ categoryId: "" }).categoryId).toBeUndefined();
      expect(read({ categoryId: null }).categoryId).toBeUndefined();
      expect(read({}).categoryId).toBeUndefined();
    });
  });

  describe("given possible answers", () => {
    it("drops a possible answer without an identifier or without a text", () => {
      expect(
        read({
          possibleAnswers: [
            { id: "a1", text: "Tak" },
            { text: "Bez identyfikatora" },
            { id: "", text: "Pusty identyfikator" },
            { id: "a2" },
            { id: "a3", text: "" },
            { id: "a4", text: " \n " },
            { id: "a5", text: 7 },
            null,
            "Nie",
            { id: "a6", text: "Nie" },
          ],
        }).possibleAnswers.map(({ id, text }) => [id, text]),
      ).toEqual([
        ["a1", "Tak"],
        ["a6", "Nie"],
      ]);
    });

    it("keeps the first of two possible answers with the same identifier", () => {
      expect(
        read({
          possibleAnswers: [
            { id: "a1", text: "Pierwsza" },
            { id: "a2", text: "Inna" },
            { id: "a1", text: "Druga" },
          ],
        }).possibleAnswers.map(({ id, text }) => [id, text]),
      ).toEqual([
        ["a1", "Pierwsza"],
        ["a2", "Inna"],
      ]);
    });

    it("keeps two possible answers with the same text", () => {
      expect(
        read({
          possibleAnswers: [
            { id: "a1", text: "Tak" },
            { id: "a2", text: "Tak" },
          ],
        }).possibleAnswers.map(({ id, text }) => [id, text]),
      ).toEqual([
        ["a1", "Tak"],
        ["a2", "Tak"],
      ]);
    });

    it("reads a missing or non-numeric weight as 0", () => {
      expect(
        read({
          possibleAnswers: [
            { id: "a1", text: "Tak", weight: 2 },
            { id: "a2", text: "Raczej tak" },
            { id: "a3", text: "Raczej nie", weight: "4" },
            { id: "a4", text: "Nie", weight: null },
            { id: "a5", text: "Nie wiem", weight: Number.NaN },
            { id: "a6", text: "Bez wagi", weight: 0 },
            { id: "a7", text: "Ułamek", weight: 1.5 },
          ],
        }).possibleAnswers.map(({ weight }) => weight),
      ).toEqual([2, 0, 0, 0, 0, 0, 1.5]);
    });

    it("keeps the possible answers in the order of the API", () => {
      expect(
        read({
          possibleAnswers: [
            { id: "c", text: "Trzecia" },
            { id: "a", text: "Pierwsza" },
            { id: "b", text: "Druga" },
          ],
        }).possibleAnswers.map(({ id }) => id),
      ).toEqual(["c", "a", "b"]);
    });

    it("trims the text of a possible answer", () => {
      expect(
        read({ possibleAnswers: [{ id: "a1", text: " Tak\n" }] })
          .possibleAnswers[0].text,
      ).toBe("Tak");
    });

    it("keeps a single possible answer as it is", () => {
      expect(read({}).possibleAnswers).toEqual([
        { id: "a1", text: "Tak", weight: 0, orientationIds: [] },
      ]);
    });

    it("has no possible answers when none is left, or the list is missing", () => {
      expect(read({ possibleAnswers: [{ id: "a1" }] }).possibleAnswers).toEqual(
        [],
      );
      expect(read({ possibleAnswers: [] }).possibleAnswers).toEqual([]);
      expect(read({ possibleAnswers: null }).possibleAnswers).toEqual([]);
      expect(read({ possibleAnswers: "Tak" }).possibleAnswers).toEqual([]);
    });
  });

  describe("given the orientations of a possible answer", () => {
    it("keeps the orientations the quiz has, a hidden one included", () => {
      expect(
        read({
          possibleAnswers: [
            { id: "a1", text: "Tak", orientationIds: ["right", "hidden"] },
          ],
        }).possibleAnswers[0].orientationIds,
      ).toEqual(["right", "hidden"]);
    });

    it("drops an orientation the quiz does not have", () => {
      expect(
        read({
          possibleAnswers: [
            {
              id: "a1",
              text: "Tak",
              orientationIds: ["left", "centre", 7, null, "right"],
            },
          ],
        }).possibleAnswers[0].orientationIds,
      ).toEqual(["left", "right"]);
    });

    it("reads a missing list of orientations as empty", () => {
      expect(
        read({
          possibleAnswers: [
            { id: "a1", text: "Tak" },
            { id: "a2", text: "Nie", orientationIds: null },
            { id: "a3", text: "Nie wiem", orientationIds: "left" },
          ],
        }).possibleAnswers.map(({ orientationIds }) => orientationIds),
      ).toEqual([[], [], []]);
    });
  });
});
