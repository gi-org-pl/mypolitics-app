import { describe, expect, it } from "vitest";

import type { Survey, SurveyQuestion } from "@/types/survey";
import {
  compassQuiz,
  workedQuiz,
} from "@/utils/running-state/getRunningState.fixtures";
import { createDoneQuestions } from "@/utils/vitest/survey/createDoneQuestions";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";
import { getRunningCompass } from "./getRunningCompass";

const TOP_RIGHT = "a1";
const TOP_LEFT = "a2";
const BOTTOM_RIGHT = "a3";
const BOTTOM_LEFT = "a4";

// The compass after the first questions of the quiz were answered towards the
// corners given, in order. `undefined` is a skip.
const getCompass = (
  corners: (string | undefined)[],
  quiz: Survey = compassQuiz,
) =>
  getRunningCompass(
    quiz,
    createDoneQuestions(
      quiz,
      corners.map(
        (corner, index) => corner && `${quiz.questions[index].id}-${corner}`,
      ),
    ),
    [],
  );

const withQuestions = (questions: SurveyQuestion[]): Survey => ({
  ...compassQuiz,
  questions,
});

describe("getRunningCompass()", () => {
  describe("given a quiz without a compass", () => {
    it("returns null", () => {
      expect(
        getRunningCompass(
          workedQuiz,
          createDoneQuestions(workedQuiz, ["q1-a1"]),
          [],
        ),
      ).toBeNull();
      expect(
        getRunningCompass(
          { ...compassQuiz, axes: [compassQuiz.axes[0]] },
          [],
          [],
        ),
      ).toBeNull();
    });
  });

  describe("given horizontal 60 and 20, vertical 20 and 60", () => {
    // The answer gives 3 to all four sides: 3 of 5 to the positive side of the
    // horizontal axis and to the negative side of the vertical one, 3 of 15 to
    // the other two.
    const quiz = withQuestions([
      createScoredQuestion("q1", [
        [3, ["hp", "hn", "vp", "vn"]],
        [5, ["hp", "vn"]],
        [15, ["hn", "vp"]],
      ]),
    ]);
    const compass = getCompass(["a1"], quiz);

    it("puts the point at 0.40, -0.40, moderate, bottom right", () => {
      expect(compass?.trail).toHaveLength(1);
      expect(compass?.trail[0].x).toBeCloseTo(0.4, 10);
      expect(compass?.trail[0].y).toBeCloseTo(-0.4, 10);
      expect(compass?.trail[0]).toMatchObject({
        level: "moderate",
        quadrant: "bottomRight",
        done: 1,
      });
    });

    it("counts the quadrant as visited", () => {
      expect(compass?.quadrantsVisited).toEqual(["bottomRight"]);
    });
  });

  describe("given a point at 0.04, -0.02", () => {
    // 27 of 50 and of 54 on the horizontal axis, 27 of 56.25 and of 54 on the
    // vertical one: values 54 and 50, 48 and 50.
    const quiz = withQuestions([
      createScoredQuestion("q1", [
        [27, ["hp", "hn", "vp", "vn"]],
        [50, ["hp"]],
        [54, ["hn", "vn"]],
        [56.25, ["vp"]],
      ]),
    ]);
    const compass = getCompass(["a1"], quiz);

    it("keeps it on the trail at the centre level", () => {
      expect(compass?.trail).toHaveLength(1);
      expect(compass?.trail[0].x).toBeCloseTo(0.04, 10);
      expect(compass?.trail[0].y).toBeCloseTo(-0.02, 10);
      expect(compass?.trail[0].level).toBe("centre");
    });

    it("visits no quadrant", () => {
      expect(compass?.quadrantsVisited).toEqual([]);
    });
  });

  describe("given one of the four sides has no value yet", () => {
    // Nothing feeds the positive side of the vertical axis before q2.
    const quiz = withQuestions([
      createScoredQuestion("q1", [[1, ["hp", "hn", "vn"]]]),
      createScoredQuestion("q2", [[1, ["vp", "hp"]]]),
    ]);

    it("adds no point for that answer", () => {
      expect(getCompass(["a1"], quiz)).toEqual({
        trail: [],
        quadrantsVisited: [],
      });
    });

    it("starts the trail at the first answer that has a position", () => {
      const compass = getCompass(["a1", "a1"], quiz);

      expect(compass?.trail).toHaveLength(1);
      expect(compass?.trail[0].done).toBe(2);
    });
  });

  describe("given a skipped question", () => {
    it("adds no point", () => {
      expect(getCompass([undefined])?.trail).toEqual([]);
      expect(
        getCompass([TOP_RIGHT, undefined, TOP_RIGHT])?.trail.map(
          ({ done }) => done,
        ),
      ).toEqual([1, 3]);
    });

    it("still counts its maximum in the points that follow", () => {
      const compass = getCompass([TOP_RIGHT, undefined, TOP_RIGHT]);

      expect(compass?.trail[1].x).toBeCloseTo(2 / 3, 10);
      expect(compass?.trail[1].y).toBeCloseTo(2 / 3, 10);
    });
  });

  describe("given the position returns to a visited quadrant", () => {
    it("grows the trail and not the quadrants visited", () => {
      const once = getCompass([TOP_RIGHT]);
      const twice = getCompass([TOP_RIGHT, TOP_RIGHT]);

      expect(once?.trail).toHaveLength(1);
      expect(twice?.trail).toHaveLength(2);
      expect(once?.quadrantsVisited).toEqual(["topRight"]);
      expect(twice?.quadrantsVisited).toEqual(["topRight"]);
    });
  });

  describe("when the last entry is removed", () => {
    const answers = [TOP_LEFT, BOTTOM_RIGHT, BOTTOM_RIGHT];
    const before = getCompass(answers);
    const after = getCompass(answers.slice(0, -1));

    it("drops its point from the trail", () => {
      expect(before?.trail).toHaveLength(3);
      expect(after?.trail).toEqual(before?.trail.slice(0, -1));
    });

    it("drops a quadrant only that point was in", () => {
      expect(before?.quadrantsVisited).toEqual(["topLeft", "bottomRight"]);
      expect(after?.quadrantsVisited).toEqual(["topLeft"]);
    });
  });

  describe("given a prioritised category", () => {
    it("weighs its questions by the weight of the category", () => {
      const quiz: Survey = {
        ...compassQuiz,
        categories: [createSurveyCategory("views", { weight: 3 })],
        questions: [
          { ...compassQuiz.questions[0], categoryId: "views" },
          compassQuiz.questions[1],
        ],
      };
      const doneQuestions = createDoneQuestions(quiz, ["q1-a1", "q2-a4"]);
      const plain = getRunningCompass(quiz, doneQuestions, []);
      const prioritised = getRunningCompass(quiz, doneQuestions, ["views"]);

      expect(plain?.trail[1]).toMatchObject({ x: 0, y: 0, level: "centre" });
      expect(prioritised?.trail[1].x).toBeCloseTo(0.5, 10);
      expect(prioritised?.trail[1].y).toBeCloseTo(0.5, 10);
      expect(prioritised?.trail[1]).toMatchObject({
        level: "moderate",
        quadrant: "topRight",
      });
    });
  });

  it("gives every point the boundary it was reached at", () => {
    expect(
      getCompass([
        TOP_RIGHT,
        BOTTOM_LEFT,
        undefined,
        BOTTOM_LEFT,
        TOP_LEFT,
      ])?.trail.map(({ done }) => done),
    ).toEqual([1, 2, 4, 5]);
  });

  it("lists the quadrants in the order they were first visited", () => {
    expect(
      getCompass([TOP_LEFT, BOTTOM_RIGHT, BOTTOM_RIGHT])?.quadrantsVisited,
    ).toEqual(["topLeft", "bottomRight"]);
    expect(
      getCompass([BOTTOM_LEFT, TOP_RIGHT, TOP_RIGHT])?.quadrantsVisited,
    ).toEqual(["bottomLeft", "topRight"]);
  });

  it("has an empty trail before the first question", () => {
    expect(getCompass([])).toEqual({ trail: [], quadrantsVisited: [] });
  });
});
