import { describe, expect, it } from "vitest";

import type { Survey } from "@/types/survey";
import { createDoneQuestions } from "@/utils/vitest/createDoneQuestions";
import { createScoredQuestion } from "@/utils/vitest/createScoredQuestion";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { getRunningProgress } from "./getRunningProgress";

const createQuiz = (length: number): Pick<Survey, "questions"> => ({
  questions: Array.from({ length }, (_, index) =>
    createScoredQuestion(`q${index + 1}`, [[1, []]]),
  ),
});

describe("getRunningProgress()", () => {
  it("counts all, done, answered, skipped and left", () => {
    const survey = createSurvey();

    expect(
      getRunningProgress(
        survey,
        createDoneQuestions(survey, ["q1-agree", undefined, "q3-agree"]),
      ),
    ).toEqual({
      all: 5,
      done: 3,
      answered: 2,
      skipped: 1,
      left: 2,
      share: 0.6,
      midpointBoundary: 3,
    });
  });

  it("starts with nothing done", () => {
    expect(getRunningProgress(createQuiz(4), [])).toEqual({
      all: 4,
      done: 0,
      answered: 0,
      skipped: 0,
      left: 4,
      share: 0,
      midpointBoundary: 2,
    });
  });

  it("puts the midpoint boundary at 51 of 102 and at 5 of 9", () => {
    const long = createQuiz(102);
    const half = getRunningProgress(
      long,
      createDoneQuestions(
        long,
        Array.from({ length: 51 }, () => undefined),
      ),
    );

    expect(half.share).toBe(0.5);
    expect(half.midpointBoundary).toBe(51);
    expect(getRunningProgress(createQuiz(9), []).midpointBoundary).toBe(5);
    expect(getRunningProgress(createQuiz(1), []).midpointBoundary).toBe(1);
  });

  it("reaches a share of 1 when every question is done", () => {
    const quiz = createQuiz(3);

    expect(
      getRunningProgress(
        quiz,
        createDoneQuestions(quiz, ["q1-a1", undefined, "q3-a1"]),
      ),
    ).toMatchObject({ done: 3, left: 0, share: 1 });
  });

  it("counts a question with no possible answers as a question", () => {
    const quiz = {
      questions: [
        createScoredQuestion("q1", []),
        createScoredQuestion("q2", [[1, []]]),
      ],
    };

    expect(
      getRunningProgress(quiz, createDoneQuestions(quiz, [undefined])),
    ).toMatchObject({ all: 2, done: 1, skipped: 1, left: 1 });
  });

  it("has a share of 0 for a quiz with no questions", () => {
    expect(getRunningProgress({ questions: [] }, [])).toMatchObject({
      all: 0,
      share: 0,
      midpointBoundary: 0,
    });
  });
});
