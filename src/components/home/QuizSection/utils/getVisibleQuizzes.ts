import type { HomeQuiz } from "@/types/home";

import type { QuizTab } from "../QuizSection.types";

// The quizzes a tab lists: every quiz on "all", the quizzes of the category
// on the others. The order of the list is kept.
export const getVisibleQuizzes = (
  quizzes: HomeQuiz[],
  tab: QuizTab,
): HomeQuiz[] =>
  tab === "all"
    ? quizzes
    : quizzes.filter((quiz) => quiz.categories.includes(tab));
