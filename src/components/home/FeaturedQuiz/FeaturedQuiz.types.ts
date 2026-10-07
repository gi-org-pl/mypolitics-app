import type { HomeQuiz } from "@/types/home";

export interface FeaturedQuizProps {
  quiz: HomeQuiz;
  onStart: () => void;
}
