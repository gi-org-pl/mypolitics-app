import type { HomeQuiz } from "@/types/home";

import type { TabPanelIdentity } from "../QuizSection.types";

export interface QuizSectionListProps {
  panel: TabPanelIdentity;
  quizzes: HomeQuiz[];
  onQuizStart: (quizId: string) => void;
}
