import { describe, expect, it } from "vitest";

import { createSurvey } from "./createSurvey";

describe("createSurvey()", () => {
  it("builds a quiz with two visible categories and a hidden one", () => {
    const { categories } = createSurvey();

    expect(categories.map(({ id, isHidden }) => [id, isHidden])).toEqual([
      ["economy", false],
      ["ecology", false],
      ["hidden", true],
    ]);
  });

  it("mixes the categories in the order of the questions", () => {
    const { questions } = createSurvey();

    expect(questions.map(({ id, categoryId }) => [id, categoryId])).toEqual([
      ["q1", "economy"],
      ["q2", "ecology"],
      ["q3", "economy"],
      ["q4", "hidden"],
      ["q5", "ecology"],
    ]);
  });

  it("has scale questions and one-of-many questions, each with answers", () => {
    const { questions } = createSurvey();

    expect(questions.map(({ answerType }) => answerType)).toEqual([
      "agree-or-disagree",
      "one-of-many",
      "agree-or-disagree",
      "agree-or-disagree",
      "one-of-many",
    ]);
    expect(
      questions.map(({ possibleAnswers }) => possibleAnswers.length),
    ).toEqual([4, 3, 4, 2, 2]);
  });

  it("identifies every question and every answer once", () => {
    const { questions } = createSurvey();
    const answerIds = questions.flatMap(({ possibleAnswers }) =>
      possibleAnswers.map(({ id }) => id),
    );

    expect(new Set(questions.map(({ id }) => id)).size).toBe(questions.length);
    expect(new Set(answerIds).size).toBe(answerIds.length);
  });

  it("lets the overrides replace the defaults", () => {
    const survey = createSurvey({
      id: "other",
      name: undefined,
      questions: [],
    });

    expect(survey.id).toBe("other");
    expect(survey.name).toBeUndefined();
    expect(survey.questions).toEqual([]);
    expect(survey.categories).toHaveLength(3);
  });

  it("builds a new quiz at every call", () => {
    const first = createSurvey();
    const second = createSurvey();

    expect(first).toEqual(second);
    expect(first.questions).not.toBe(second.questions);
  });
});
