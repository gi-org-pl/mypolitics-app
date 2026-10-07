import type { MessageDescriptor } from "@lingui/core";

import type { HomeQuiz, QuizCategory } from "@/types/home";

export type QuizTab = "all" | QuizCategory;

export interface QuizTabOption {
  value: QuizTab;
  label: MessageDescriptor;
}

export interface TabPanelIdentity {
  id: string;
  labelledBy: string;
}

export interface QuizSectionProps {
  quizzes: HomeQuiz[];
  onQuizStart: (quizId: string) => void;
  onShowMore: () => void;
  onCreate: () => void;
}
