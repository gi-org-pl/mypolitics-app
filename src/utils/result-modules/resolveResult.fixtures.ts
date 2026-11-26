import type { QuizResult, ResolutionContext } from "@/types/results";
import type { Survey } from "@/types/survey";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createResultModule } from "@/utils/vitest/results/createResultModule";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

// A quiz with one record of every module type, and a result of it.
//
//   q1  economy  a1 2: left, socialist, brave, anarchist   a2 2: right, liberal
//   q2  economy  a1 1: left, socialist, brave, anarchist   a2 1: right, liberal
//   q3  society  a1 1: progress, socialist, green          a2 1: tradition, liberal
//   q4  society  a1 1: progress, liberal                   a2 1: tradition
//   q5  control  a1 1: calm, secret                        a2 1: nothing
//
// "anarchist" and "secret" are hidden orientations, and "control" is a hidden
// category. No question feeds a party.
//
// Beside the axes its records list, the quiz has three that only single
// cases point at: "mixed" has a hidden orientation first on its start side,
// "one-sided" has only a hidden orientation on its end side, and "loose"
// names a category the quiz does not have.
export const moduleQuiz: Survey = createSurvey({
  orientations: [
    {
      id: "socialist",
      type: "identity",
      nameForms: { masculine: "Socjalista", feminine: "Socjalistka" },
      slogan: "Razem",
      linkedOrientationIds: ["party-green", "party-left"],
    },
    createOrientation("liberal", "Liberał", {
      type: "identity",
      linkedOrientationIds: ["party-right"],
    }),
    createOrientation("anarchist", "Anarchista", {
      type: "identity",
      isHidden: true,
    }),
    createOrientation("party-left", "Lewica", {
      type: "party",
      isOfficial: true,
    }),
    createOrientation("party-right", "Prawica", { type: "party" }),
    createOrientation("party-green", "Zieloni", { type: "party" }),
    createOrientation("left", "Interwencjonizm"),
    createOrientation("right", "Wolny rynek"),
    createOrientation("progress", "Postęp"),
    createOrientation("tradition", "Tradycja"),
    createOrientation("green", "Ekologia"),
    createOrientation("secret", "Ukryta", { isHidden: true }),
    createOrientation("brave", "Odwaga"),
    createOrientation("calm", "Spokój"),
  ],
  categories: [
    createSurveyCategory("economy", { name: "Gospodarka" }),
    createSurveyCategory("society", { name: "Społeczeństwo" }),
    createSurveyCategory("control", { name: "Kontrolne", isHidden: true }),
  ],
  axes: [
    createSurveyAxis("economy-axis", ["left"], ["right"], {
      name: "Gospodarka",
      categoryName: "Gospodarka",
    }),
    createSurveyAxis("society-axis", ["progress"], ["tradition"], {
      name: "Społeczeństwo",
      categoryName: "Społeczeństwo",
    }),
    createSurveyAxis("compass-x", ["left"], ["right"], {
      name: "gospodarczo",
      type: "compass_x_axis",
    }),
    createSurveyAxis("compass-y", ["progress"], ["tradition"], {
      name: "światopoglądowo",
      type: "compass_y_axis",
    }),
    createSurveyAxis("mixed", ["secret", "left", "green"], ["right"], {
      categoryName: "Gospodarka",
    }),
    createSurveyAxis("one-sided", ["left"], ["secret"], {
      categoryName: "Gospodarka",
    }),
    createSurveyAxis("loose", ["green"], ["tradition"], {
      categoryName: "Ekologia",
    }),
  ],
  questions: [
    createScoredQuestion(
      "q1",
      [
        [2, ["left", "socialist", "brave", "anarchist"]],
        [2, ["right", "liberal"]],
      ],
      { categoryId: "economy" },
    ),
    createScoredQuestion(
      "q2",
      [
        [1, ["left", "socialist", "brave", "anarchist"]],
        [1, ["right", "liberal"]],
      ],
      { categoryId: "economy" },
    ),
    createScoredQuestion(
      "q3",
      [
        [1, ["progress", "socialist", "green"]],
        [1, ["tradition", "liberal"]],
      ],
      { categoryId: "society" },
    ),
    createScoredQuestion(
      "q4",
      [
        [1, ["progress", "liberal"]],
        [1, ["tradition"]],
      ],
      { categoryId: "society" },
    ),
    createScoredQuestion(
      "q5",
      [
        [1, ["calm", "secret"]],
        [1, []],
      ],
      { categoryId: "control" },
    ),
  ],
  resultModules: [
    createResultModule("header", "header", {
      orientationIds: ["liberal", "socialist", "anarchist"],
      labels: { link: "Zobacz stronę" },
    }),
    createResultModule("identity", "archetype", {
      position: 1,
      column: "end",
      title: "Tożsamość",
      orientationIds: ["liberal", "socialist", "anarchist"],
    }),
    createResultModule("ecology", "single_axis", {
      position: 2,
      orientationIds: ["green"],
      params: { marker: 60 },
    }),
    createResultModule("economy", "double_axis", {
      position: 3,
      column: "end",
      description: "Jak blisko ci do każdej ze stron osi.",
      axisIds: ["economy-axis"],
      params: { marker: null },
    }),
    createResultModule("ideologies", "multi_axis", {
      position: 4,
      title: "Ideologie",
      axisIds: ["society-axis", "economy-axis"],
      params: { groupBy: "category" },
    }),
    createResultModule("parties", "horizontal_bar", {
      position: 5,
      title: "Partie",
      orientationIds: ["party-left", "party-right", "party-green"],
      params: { selection: "linked_to_leader", visibleRows: 2 },
    }),
    createResultModule("compass", "nolan_chart", {
      position: 6,
      column: "end",
      axisIds: ["compass-x", "compass-y"],
      labels: { centre: "Centrum" },
      colors: { topLeft: "#ff0000" },
    }),
    createResultModule("traits", "traits", {
      position: 7,
      title: "Cechy",
      orientationIds: ["brave", "calm"],
    }),
  ],
});

// The result of a taker who chose the first answer of q1-q4 and left q5, with
// the points and the maximum the back-end counts for those answers over the
// whole quiz. A party has no score, or one with no maximum.
export const moduleQuizResult: QuizResult = {
  scores: {
    socialist: { points: 4, maximum: 4 },
    liberal: { points: 1, maximum: 5 },
    anarchist: { points: 3, maximum: 3 },
    left: { points: 3, maximum: 3 },
    right: { points: 0, maximum: 3 },
    progress: { points: 2, maximum: 2 },
    tradition: { points: 0, maximum: 2 },
    green: { points: 1, maximum: 1 },
    secret: { points: 0, maximum: 1 },
    brave: { points: 3, maximum: 3 },
    calm: { points: 0, maximum: 1 },
    "party-left": { points: 0, maximum: 0 },
  },
  answers: [
    { questionId: "q1", answerId: "q1-a1" },
    { questionId: "q2", answerId: "q2-a1" },
    { questionId: "q3", answerId: "q3-a1" },
    { questionId: "q4", answerId: "q4-a1" },
  ],
};

export const moduleQuizContext: ResolutionContext = {
  survey: moduleQuiz,
  result: moduleQuizResult,
};
