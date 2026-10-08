import { describe, expect, it } from "vitest";

import type { Survey, SurveyTimeSample } from "@/types/survey";
import { createDoneQuestions } from "@/utils/vitest/createDoneQuestions";
import { createScoredQuestion } from "@/utils/vitest/createScoredQuestion";

import { getRunningTiming } from "./getRunningTiming";

type TimedQuiz = Pick<Survey, "questions" | "averageFinishTime">;

const createQuiz = (averageFinishTime?: number): TimedQuiz => ({
  averageFinishTime,
  questions: Array.from({ length: 102 }, (_, index) =>
    createScoredQuestion(`q${index + 1}`, [[1, []]]),
  ),
});

// The timing after the first `done` questions were skipped, the first ones of
// them with a time sample each, in order.
const getTiming = (
  done: number,
  seconds: number[],
  quiz: TimedQuiz = createQuiz(),
) =>
  getRunningTiming(
    quiz,
    createDoneQuestions(
      quiz,
      Array.from({ length: done }, () => undefined),
    ),
    seconds.map((value, index) => ({
      questionId: `q${index + 1}`,
      seconds: value,
    })),
  );

const repeat = (seconds: number, times: number): number[] =>
  Array.from({ length: times }, () => seconds);

describe("getRunningTiming()", () => {
  describe("given 5 or more timed questions", () => {
    it("gives 8 minutes for 51 left at 9.2 seconds", () => {
      const timing = getTiming(51, repeat(9.2, 40));

      expect(timing.timedQuestions).toBe(40);
      expect(timing.averagePace).toBeCloseTo(9.2, 10);
      expect(timing.minutesLeft).toBe(8);
    });

    it("gives 7 minutes for 51 left at 8.2 seconds", () => {
      expect(getTiming(51, repeat(8.2, 40)).minutesLeft).toBe(7);
    });

    it("gives 1 minute for 4 left at 6 seconds", () => {
      expect(getTiming(98, repeat(6, 5))).toEqual({
        timedQuestions: 5,
        averagePace: 6,
        minutesLeft: 1,
      });
    });

    it("uses the taker's pace and not the survey average", () => {
      expect(getTiming(51, repeat(9.2, 5), createQuiz(60)).minutesLeft).toBe(8);
    });
  });

  describe("given fewer than 5 timed questions", () => {
    it("gives 8 minutes for 51 of 102 left with a survey average of 15", () => {
      expect(getTiming(51, repeat(2, 3), createQuiz(15))).toEqual({
        timedQuestions: 3,
        averagePace: 2,
        minutesLeft: 8,
      });
    });

    it.each([
      ["missing", undefined],
      ["zero", 0],
      ["negative", -15],
      ["not a number", Number.NaN],
    ])("gives nothing when the survey average is %s", (_name, averageFinishTime) => {
      const timing = getTiming(
        51,
        repeat(9.2, 4),
        createQuiz(averageFinishTime),
      );

      expect(timing.timedQuestions).toBe(4);
      expect(timing.minutesLeft).toBeUndefined();
    });

    it("has no pace with no sample", () => {
      expect(getTiming(51, [], createQuiz(15))).toEqual({
        timedQuestions: 0,
        averagePace: undefined,
        minutesLeft: 8,
      });
    });
  });

  describe("samples", () => {
    it("counts a sample of 600 seconds as 60", () => {
      expect(getTiming(51, [600]).averagePace).toBe(60);
      expect(getTiming(51, [600, 20]).averagePace).toBe(40);
    });

    it("counts a sample of no time at all", () => {
      expect(getTiming(51, [0, 10])).toMatchObject({
        timedQuestions: 2,
        averagePace: 5,
      });
    });

    it("drops a sample that is negative or not a number", () => {
      const timing = getTiming(51, [
        -1,
        Number.NaN,
        "7" as unknown as number,
        undefined as unknown as number,
        12,
      ]);

      expect(timing).toMatchObject({ timedQuestions: 1, averagePace: 12 });
    });

    it("does not count a sample for a question that is not done", () => {
      expect(getTiming(2, [10, 20, 600, 600])).toMatchObject({
        timedQuestions: 2,
        averagePace: 15,
      });
    });

    it("takes the later of two samples for one question", () => {
      const quiz = createQuiz();
      const samples: SurveyTimeSample[] = [
        { questionId: "q1", seconds: 50 },
        { questionId: "q2", seconds: 10 },
        { questionId: "q1", seconds: 30 },
      ];

      expect(
        getRunningTiming(
          quiz,
          createDoneQuestions(quiz, [undefined, undefined]),
          samples,
        ),
      ).toMatchObject({ timedQuestions: 2, averagePace: 20 });
    });
  });
});
