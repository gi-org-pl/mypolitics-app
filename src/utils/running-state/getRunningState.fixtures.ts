import type { Survey } from "@/types/survey";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createScoredQuestion } from "@/utils/vitest/createScoredQuestion";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyAxis } from "@/utils/vitest/createSurveyAxis";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";
import { createSurveyQuestion } from "@/utils/vitest/createSurveyQuestion";

// The worked examples of the event model spec, "What one question adds" and
// "Adding questions up".
//
//   q1  views    A1 2 X,Y   A2 1 X   A3 2 Z   A4 4 Z   (q1-a1 ... q1-a4)
//   q2  economy  B1 3 X     B2 1 Z                     (q2-a1, q2-a2)
//   q3  views    C1 2 Y     C2 2 Z                     (q3-a1, q3-a2)
//
// Both categories weigh 1.25, and no question feeds the orientation "u".
export const workedQuiz: Survey = createSurvey({
  orientations: ["x", "y", "z", "u"].map((id) =>
    createOrientation(id, id.toUpperCase()),
  ),
  categories: [
    createSurveyCategory("views", { weight: 1.25 }),
    createSurveyCategory("economy", { weight: 1.25 }),
  ],
  questions: [
    createScoredQuestion(
      "q1",
      [
        [2, ["x", "y"]],
        [1, ["x"]],
        [2, ["z"]],
        [4, ["z"]],
      ],
      { categoryId: "views" },
    ),
    createScoredQuestion(
      "q2",
      [
        [3, ["x"]],
        [1, ["z"]],
      ],
      { categoryId: "economy" },
    ),
    createScoredQuestion(
      "q3",
      [
        [2, ["y"]],
        [2, ["z"]],
      ],
      { categoryId: "views" },
    ),
  ],
});

// "Adding questions up": q1 answered A2, q2 answered B1 in a prioritised
// category, q3 skipped.
export const workedAnswerIds = ["q1-a2", "q2-a1", undefined];
export const workedPrioritizedCategoryIds = ["economy"];

// A quiz with a compass, whose every question moves the taker towards one
// corner: each answer gives its weight to one side of either axis.
//
//   a1  top right   (hp, vp)      a3  bottom right  (hp, vn)
//   a2  top left    (hn, vp)      a4  bottom left   (hn, vn)
export const compassQuiz: Survey = createSurvey({
  orientations: ["hn", "hp", "vn", "vp"].map((id) =>
    createOrientation(id, id.toUpperCase()),
  ),
  categories: [],
  axes: [
    createSurveyAxis("x", ["hn"], ["hp"], { type: "compass_x_axis" }),
    createSurveyAxis("y", ["vn"], ["vp"], { type: "compass_y_axis" }),
  ],
  questions: ["q1", "q2", "q3", "q4", "q5"].map((id) =>
    createScoredQuestion(id, [
      [1, ["hp", "vp"]],
      [1, ["hn", "vp"]],
      [1, ["hp", "vn"]],
      [1, ["hn", "vn"]],
    ]),
  ),
});

// The four test cases of the calculator the back-end runs, algorithm
// `mp-qu-2025-1.0.1`: `src/service/calculator/calculator.service.spec.ts` of
// mypolitics-survey-consumer, as it stood on 2026-10-08. Inputs and expected
// `points` / `maxPossible` are taken over as they are; only the envelope
// (`surveyId`, `sessionId`, `algorithm`, `calculatedAt`) is left out.
interface CalculatorCase {
  name: string;
  userPrioritizedCategories: string[];
  answers: { questionId: string; answerId: string }[];
  questions: {
    id: string;
    categoryId: string;
    possibleAnswers: { id: string; orientationIds: string[]; weight: number }[];
  }[];
  categories: { id: string; weight: number }[];
  orientations: { id: string }[];
  expected: { id: string; points: number; maxPossible: number }[];
}

export const calculatorCases: CalculatorCase[] = [
  {
    name: "valid calculation without prioritized categories",
    userPrioritizedCategories: [],
    answers: [
      { questionId: "questionId1", answerId: "answerId1" },
      { questionId: "questionId2", answerId: "answerId2" },
    ],
    questions: [
      {
        id: "questionId1",
        categoryId: "categoryId",
        possibleAnswers: [
          { id: "answerId1", orientationIds: ["orientationId1"], weight: 1 },
          { id: "answerId2", orientationIds: ["orientationId2"], weight: 1 },
        ],
      },
      {
        id: "questionId2",
        categoryId: "categoryId",
        possibleAnswers: [
          { id: "answerId1", orientationIds: ["orientationId1"], weight: 2 },
          { id: "answerId2", orientationIds: ["orientationId2"], weight: 2 },
        ],
      },
    ],
    categories: [{ id: "categoryId", weight: 1 }],
    orientations: [{ id: "orientationId1" }, { id: "orientationId2" }],
    expected: [
      { id: "orientationId1", points: 1, maxPossible: 3 },
      { id: "orientationId2", points: 2, maxPossible: 3 },
    ],
  },
  {
    name: "valid calculation with prioritized categories",
    userPrioritizedCategories: ["categoryId1"],
    answers: [
      { questionId: "questionId1", answerId: "answerId1" },
      { questionId: "questionId2", answerId: "answerId2" },
    ],
    questions: [
      {
        id: "questionId1",
        categoryId: "categoryId1",
        possibleAnswers: [
          { id: "answerId1", orientationIds: ["orientationId1"], weight: 1 },
          { id: "answerId2", orientationIds: ["orientationId2"], weight: 1 },
        ],
      },
      {
        id: "questionId2",
        categoryId: "categoryId2",
        possibleAnswers: [
          { id: "answerId1", orientationIds: ["orientationId1"], weight: 2 },
          { id: "answerId2", orientationIds: ["orientationId2"], weight: 2 },
        ],
      },
    ],
    categories: [
      { id: "categoryId1", weight: 2 },
      { id: "categoryId2", weight: 1 },
    ],
    orientations: [{ id: "orientationId1" }, { id: "orientationId2" }],
    expected: [
      { id: "orientationId1", points: 2, maxPossible: 4 },
      { id: "orientationId2", points: 2, maxPossible: 4 },
    ],
  },
  {
    name: "valid calculation without prioritized categories for multiple same orientations",
    userPrioritizedCategories: [],
    answers: [{ questionId: "questionId1", answerId: "answerId3" }],
    questions: [
      {
        id: "questionId1",
        categoryId: "categoryId",
        possibleAnswers: [
          { id: "answerId1", orientationIds: ["orientationId1"], weight: 3 },
          { id: "answerId2", orientationIds: ["orientationId1"], weight: 1 },
          { id: "answerId3", orientationIds: ["orientationId2"], weight: 1 },
          { id: "answerId4", orientationIds: ["orientationId1"], weight: 2 },
        ],
      },
    ],
    categories: [{ id: "categoryId", weight: 1 }],
    orientations: [{ id: "orientationId1" }, { id: "orientationId2" }],
    expected: [
      { id: "orientationId1", points: 0, maxPossible: 3 },
      { id: "orientationId2", points: 1, maxPossible: 1 },
    ],
  },
  {
    name: "valid calculation with prioritized categories for multiple same orientations",
    userPrioritizedCategories: ["categoryId"],
    answers: [{ questionId: "questionId1", answerId: "answerId4" }],
    questions: [
      {
        id: "questionId1",
        categoryId: "categoryId",
        possibleAnswers: [
          { id: "answerId1", orientationIds: ["orientationId1"], weight: 3 },
          { id: "answerId2", orientationIds: ["orientationId1"], weight: 1 },
          { id: "answerId3", orientationIds: ["orientationId2"], weight: 1 },
          { id: "answerId4", orientationIds: ["orientationId1"], weight: 2 },
        ],
      },
    ],
    categories: [{ id: "categoryId", weight: 3 }],
    orientations: [{ id: "orientationId1" }, { id: "orientationId2" }],
    expected: [
      { id: "orientationId1", points: 6, maxPossible: 9 },
      { id: "orientationId2", points: 0, maxPossible: 3 },
    ],
  },
];

// The quiz of a calculator case, as the running state reads one. Its
// `answers` are entries already.
export const toCalculatorQuiz = (calculatorCase: CalculatorCase): Survey =>
  createSurvey({
    orientations: calculatorCase.orientations.map(({ id }) =>
      createOrientation(id, id),
    ),
    categories: calculatorCase.categories.map(({ id, weight }) =>
      createSurveyCategory(id, { weight }),
    ),
    questions: calculatorCase.questions.map(
      ({ id, categoryId, possibleAnswers }) =>
        createSurveyQuestion(id, [], {
          categoryId,
          possibleAnswers: possibleAnswers.map((possibleAnswer) => ({
            ...possibleAnswer,
            text: possibleAnswer.id,
          })),
        }),
    ),
  });
