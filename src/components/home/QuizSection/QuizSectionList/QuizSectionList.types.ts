import type { TabPanelIdentity } from "@/types/common";
import type { HomeQuiz } from "@/types/home";

export interface QuizSectionListProps {
  panel: TabPanelIdentity;
  quizzes: HomeQuiz[];
  onQuizStart: (quizId: string) => void;
}
