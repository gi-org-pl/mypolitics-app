import { describe, expect, it } from "vitest";

import { createSurveyQuestion } from "./createSurveyQuestion";

describe("createSurveyQuestion()", () => {
  it("builds a scale question with one answer per text, in the order given", () => {
    expect(createSurveyQuestion("q1", ["Za", "Przeciw"])).toEqual({
      id: "q1",
      text: "Stwierdzenie q1.",
      answerType: "agree-or-disagree",
      possibleAnswers: [
        { id: "q1-a1", text: "Za", weight: 1, orientationIds: [] },
        { id: "q1-a2", text: "Przeciw", weight: 1, orientationIds: [] },
      ],
    });
  });

  it("lets the overrides replace the defaults", () => {
    const question = createSurveyQuestion("q1", ["Tak"], {
      answerType: "one-of-many",
      categoryId: "economy",
    });

    expect(question.answerType).toBe("one-of-many");
    expect(question.categoryId).toBe("economy");
    expect(question.possibleAnswers).toHaveLength(1);
  });
});
