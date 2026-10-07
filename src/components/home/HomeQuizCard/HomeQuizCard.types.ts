import type { HomeQuiz } from "@/types/home";

export interface HomeQuizCardProps {
  quiz: HomeQuiz;
  isFeatured?: boolean;
  onStart: () => void;
}
