import { describe, expect, it } from "vitest";

import { createSurveyQuestion } from "@/utils/vitest/survey/createSurveyQuestion";

import { getAnswerSide } from "./getAnswerSide";

const question = createSurveyQuestion("q", [
  "Zdecydowanie za",
  "Częściowo za",
  "Częściowo przeciw",
  "Zdecydowanie przeciw",
  "Nie mam zdania",
]);

describe("getAnswerSide()", () => {
  it("puts an agreeing answer on the side for the thesis", () => {
    expect(getAnswerSide(question, question.possibleAnswers[0])).toBe("for");
    expect(getAnswerSide(question, question.possibleAnswers[1])).toBe("for");
  });

  it("puts a disagreeing answer on the side against the thesis", () => {
    expect(getAnswerSide(question, question.possibleAnswers[2])).toBe(
      "against",
    );
    expect(getAnswerSide(question, question.possibleAnswers[3])).toBe(
      "against",
    );
  });

  it("gives an answer off the agreement scale no side", () => {
    expect(
      getAnswerSide(question, question.possibleAnswers[4]),
    ).toBeUndefined();
  });

  it("gives no answer of a question that is not a scale a side", () => {
    const choice = { ...question, answerType: "one-of-many" as const };

    expect(getAnswerSide(choice, choice.possibleAnswers[0])).toBeUndefined();
  });
});
