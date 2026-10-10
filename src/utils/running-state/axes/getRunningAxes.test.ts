import { describe, expect, it } from "vitest";

import type { RunningScore } from "@/types/checkpoint";
import type { Survey, SurveyAxis } from "@/types/survey";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createDoneQuestions } from "@/utils/vitest/survey/createDoneQuestions";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";

import { getRunningAxes } from "./getRunningAxes";

// q1 and q2 feed both "left" and "right"; q2 also feeds the other fed
// orientations, and q3 feeds none of the two. No question feeds "unfed".
const createQuiz = (axes: SurveyAxis[]): Survey =>
  createSurvey({
    orientations: [
      createOrientation("left", "Lewica"),
      createOrientation("right", "Prawica"),
      createOrientation("centre", "Centrum"),
      createOrientation("hidden", "Ukryta", { isHidden: true }),
      createOrientation("nameless"),
      createOrientation("unfed", "Bez pytań"),
      {
        id: "green",
        type: "identity",
        nameForms: { masculine: "Zielony", feminine: "Zielona" },
      },
    ],
    axes,
    questions: [
      createScoredQuestion("q1", [
        [1, ["left"]],
        [1, ["right"]],
      ]),
      createScoredQuestion("q2", [
        [1, ["left", "centre", "hidden", "nameless", "green"]],
        [1, ["right"]],
      ]),
      createScoredQuestion("q3", [[1, ["centre"]]]),
    ],
  });

const toScore = (points: number, maximum: number): RunningScore => ({
  points,
  maximum,
});

const NO_SCORES = {};

describe("getRunningAxes()", () => {
  describe("which axes are kept", () => {
    it("keeps an axis of type axis with one fed orientation on each side as two-sided", () => {
      const quiz = createQuiz([createSurveyAxis("a", ["left"], ["right"])]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toMatchObject([
        {
          id: "a",
          kind: "two-sided",
          start: { orientation: { id: "left", name: "Lewica" } },
          end: { orientation: { id: "right", name: "Prawica" } },
        },
      ]);
    });

    it("reads an axis with one side empty as single", () => {
      const quiz = createQuiz([
        createSurveyAxis("a", ["left"], []),
        createSurveyAxis("b", [], ["right"]),
      ]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toMatchObject([
        { id: "a", kind: "single", entry: { orientation: { id: "left" } } },
        { id: "b", kind: "single", entry: { orientation: { id: "right" } } },
      ]);
    });

    it("reads an axis whose other side holds an orientation no question feeds as single", () => {
      const quiz = createQuiz([
        createSurveyAxis("a", ["left"], ["unfed"]),
        createSurveyAxis("b", ["unfed"], ["right"]),
      ]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toMatchObject([
        { id: "a", kind: "single", entry: { orientation: { id: "left" } } },
        { id: "b", kind: "single", entry: { orientation: { id: "right" } } },
      ]);
    });

    it("drops an axis with more than one orientation on a side", () => {
      const quiz = createQuiz([
        createSurveyAxis("a", ["left", "centre"], ["right"]),
        createSurveyAxis("b", ["left"], ["right", "unfed"]),
      ]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toEqual([]);
    });

    it("drops an axis with a hidden orientation on either side", () => {
      const quiz = createQuiz([
        createSurveyAxis("a", ["hidden"], ["right"]),
        createSurveyAxis("b", ["left"], ["hidden"]),
      ]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toEqual([]);
    });

    it("drops an axis with a nameless orientation on a side", () => {
      const quiz = createQuiz([createSurveyAxis("a", ["left"], ["nameless"])]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toEqual([]);
    });

    it("drops an axis with the same orientation on both sides", () => {
      const quiz = createQuiz([createSurveyAxis("a", ["left"], ["left"])]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toEqual([]);
    });

    it("drops an axis no question feeds", () => {
      const quiz = createQuiz([
        createSurveyAxis("a", ["unfed"], []),
        createSurveyAxis("b", [], []),
      ]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toEqual([]);
    });

    it("drops the two compass axes and an axis of an unknown type", () => {
      const quiz = createQuiz([
        createSurveyAxis("x", ["left"], ["right"], { type: "compass_x_axis" }),
        createSurveyAxis("y", ["left"], ["right"], { type: "compass_y_axis" }),
        createSurveyAxis("z", ["left"], ["right"], { type: "other" }),
      ]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toEqual([]);
    });

    it("drops a reference to an orientation the quiz does not have and reads the axis by what remains", () => {
      const quiz = createQuiz([
        createSurveyAxis("a", ["ghost", "left"], ["right"]),
        createSurveyAxis("b", ["left"], ["ghost"]),
        createSurveyAxis("c", ["ghost"], ["ghost"]),
      ]);

      expect(getRunningAxes(quiz, [], NO_SCORES)).toMatchObject([
        { id: "a", kind: "two-sided" },
        { id: "b", kind: "single", entry: { orientation: { id: "left" } } },
      ]);
    });

    it("keeps the order of the quiz", () => {
      const quiz = createQuiz([
        createSurveyAxis("c", ["centre"], []),
        createSurveyAxis("x", ["left"], ["right"], { type: "compass_x_axis" }),
        createSurveyAxis("a", ["left"], ["right"]),
        createSurveyAxis("b", ["right"], ["centre"]),
      ]);

      expect(getRunningAxes(quiz, [], NO_SCORES).map(({ id }) => id)).toEqual([
        "c",
        "a",
        "b",
      ]);
    });
  });

  describe("given a two-sided axis with 12 of 20 on the negative side and 3 of 15 on the positive side", () => {
    it("has values 60 and 20, a lean of 40 and the start side leading", () => {
      const quiz = createQuiz([createSurveyAxis("a", ["left"], ["right"])]);
      const [axis] = getRunningAxes(quiz, [], {
        left: toScore(12, 20),
        right: toScore(3, 15),
      });

      expect(axis).toMatchObject({
        kind: "two-sided",
        start: { value: 60 },
        end: { value: 20 },
        lean: 40,
        leadingSide: "start",
      });
    });
  });

  describe("given a two-sided axis at 47 and 47", () => {
    it("has a lean of 0 and no leading side", () => {
      const quiz = createQuiz([createSurveyAxis("a", ["left"], ["right"])]);
      const [axis] = getRunningAxes(quiz, [], {
        left: toScore(47, 100),
        right: toScore(47, 100),
      });

      expect(axis).toMatchObject({
        start: { value: 47 },
        end: { value: 47 },
        lean: 0,
        leadingSide: undefined,
      });
    });
  });

  describe("given a two-sided axis with a side whose maximum is 0", () => {
    it("has no value for that side, no lean and no leading side", () => {
      const quiz = createQuiz([createSurveyAxis("a", ["left"], ["right"])]);
      const [axis] = getRunningAxes(quiz, [], {
        left: toScore(12, 20),
        right: toScore(0, 0),
      });

      expect(axis).toMatchObject({
        kind: "two-sided",
        start: { value: 60 },
        end: { value: undefined },
        lean: undefined,
        leadingSide: undefined,
      });
    });
  });

  describe("given a single axis", () => {
    const quiz = createQuiz([createSurveyAxis("a", ["left"], ["unfed"])]);

    it("has a lean of 33 at a value of 83", () => {
      const [axis] = getRunningAxes(quiz, [], { left: toScore(83, 100) });

      expect(axis).toMatchObject({ kind: "single", entry: { value: 83 } });
      expect(axis.lean).toBe(33);
    });

    it("has a lean of -10 at a value of 40", () => {
      const [axis] = getRunningAxes(quiz, [], { left: toScore(40, 100) });

      expect(axis.lean).toBe(-10);
    });

    it("has no lean while its maximum is 0", () => {
      const [axis] = getRunningAxes(quiz, [], { left: toScore(0, 0) });

      expect(axis).toMatchObject({
        kind: "single",
        entry: { value: undefined },
        lean: undefined,
      });
    });
  });

  describe("answered", () => {
    const quiz = createQuiz([
      createSurveyAxis("a", ["left"], ["right"]),
      createSurveyAxis("b", ["centre"], []),
      createSurveyAxis("c", ["left"], ["unfed"]),
    ]);

    it("counts the answered questions that feed either side", () => {
      const doneQuestions = createDoneQuestions(quiz, [
        "q1-a1",
        "q2-a2",
        "q3-a1",
      ]);

      expect(
        getRunningAxes(quiz, doneQuestions, NO_SCORES).map(
          ({ id, answered }) => [id, answered],
        ),
      ).toEqual([
        ["a", 2],
        ["b", 2],
        ["c", 2],
      ]);
    });

    it("does not count a skipped question", () => {
      const doneQuestions = createDoneQuestions(quiz, [
        "q1-a1",
        undefined,
        "q3-a1",
      ]);

      expect(
        getRunningAxes(quiz, doneQuestions, NO_SCORES).map(
          ({ id, answered }) => [id, answered],
        ),
      ).toEqual([
        ["a", 1],
        ["b", 1],
        ["c", 1],
      ]);
    });

    it("is zero before the first question", () => {
      expect(
        getRunningAxes(quiz, [], NO_SCORES).map(({ answered }) => answered),
      ).toEqual([0, 0, 0]);
    });
  });

  it("shows a name with two forms in its masculine form", () => {
    const quiz = createQuiz([createSurveyAxis("a", ["green"], ["right"])]);
    const [axis] = getRunningAxes(quiz, [], NO_SCORES);

    expect(axis).toMatchObject({
      kind: "two-sided",
      start: { orientation: { id: "green", name: "Zielony" } },
    });
  });
});
