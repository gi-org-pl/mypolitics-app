import { describe, expect, it } from "vitest";

import { createScoredQuestion } from "./createScoredQuestion";

describe("createScoredQuestion()", () => {
  it("builds a question with one answer per weight and list of orientations, in the order given", () => {
    expect(
      createScoredQuestion("q1", [
        [2, ["x", "y"]],
        [1, []],
      ]),
    ).toEqual({
      id: "q1",
      text: "Stwierdzenie q1.",
      answerType: "agree-or-disagree",
      possibleAnswers: [
        {
          id: "q1-a1",
          text: "Odpowiedź 1",
          weight: 2,
          orientationIds: ["x", "y"],
        },
        { id: "q1-a2", text: "Odpowiedź 2", weight: 1, orientationIds: [] },
      ],
    });
  });

  it("lets the overrides replace the defaults", () => {
    const question = createScoredQuestion("q1", [[1, ["x"]]], {
      categoryId: "economy",
      possibleAnswers: [],
    });

    expect(question.categoryId).toBe("economy");
    expect(question.possibleAnswers).toEqual([]);
  });
});
