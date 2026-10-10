import { describe, expect, it } from "vitest";

import { createDoneQuestions } from "./createDoneQuestions";
import { createSurvey } from "./createSurvey";

describe("createDoneQuestions()", () => {
  const survey = createSurvey();
  const [first, second] = survey.questions;

  it("makes the first questions of the quiz done, one per item", () => {
    expect(createDoneQuestions(survey, ["q1-agree", "q2-coal"])).toEqual([
      { question: first, answer: first.possibleAnswers[1] },
      { question: second, answer: second.possibleAnswers[0] },
    ]);
  });

  it("skips a question whose item is undefined", () => {
    expect(createDoneQuestions(survey, [undefined])).toEqual([
      { question: first, answer: undefined },
    ]);
  });

  it("returns an empty list for no items", () => {
    expect(createDoneQuestions(survey, [])).toEqual([]);
  });
});
