import { describe, expect, it } from "vitest";

import { getDoneQuestions } from "./getDoneQuestions";
import { workedQuiz } from "./getRunningState.fixtures";

describe("getDoneQuestions()", () => {
  const [q1, q2, q3] = workedQuiz.questions;

  it("keeps the order of the entries", () => {
    expect(
      getDoneQuestions(workedQuiz, [
        { questionId: "q1", answerId: "q1-a2" },
        { questionId: "q2", answerId: "q2-a1" },
        { questionId: "q3" },
      ]),
    ).toEqual([
      { question: q1, answer: q1.possibleAnswers[1] },
      { question: q2, answer: q2.possibleAnswers[0] },
      { question: q3, answer: undefined },
    ]);
  });

  it("ignores an entry for a question the quiz does not have", () => {
    expect(
      getDoneQuestions(workedQuiz, [
        { questionId: "ghost", answerId: "q1-a1" },
        { questionId: "q1", answerId: "q1-a1" },
      ]),
    ).toEqual([{ question: q1, answer: q1.possibleAnswers[0] }]);
  });

  it("keeps the later of two entries for one question", () => {
    expect(
      getDoneQuestions(workedQuiz, [
        { questionId: "q1", answerId: "q1-a1" },
        { questionId: "q2", answerId: "q2-a1" },
        { questionId: "q1", answerId: "q1-a4" },
      ]),
    ).toEqual([
      { question: q2, answer: q2.possibleAnswers[0] },
      { question: q1, answer: q1.possibleAnswers[3] },
    ]);
  });

  it("reads an answer the question does not have as a skip", () => {
    expect(
      getDoneQuestions(workedQuiz, [{ questionId: "q1", answerId: "q2-a1" }]),
    ).toEqual([{ question: q1, answer: undefined }]);
  });

  it("returns an empty list for no entries", () => {
    expect(getDoneQuestions(workedQuiz, [])).toEqual([]);
  });
});
