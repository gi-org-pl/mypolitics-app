import type { SurveyQuestion } from "@/types/survey";

export interface SurveyQuestionSlideProps {
  question: SurveyQuestion; // the question that is asked now
  position: number; // how many questions are done: where the question stands in the session
}

// Which way the taker moved between two questions: on to the next one, or
// back to the one before.
export type QuestionSlideDirection = "forwards" | "backwards";

export interface QuestionSlide {
  current: SurveyQuestion;
  direction?: QuestionSlideDirection; // absent until a question has taken the place of another
  leaving?: SurveyQuestion; // the question that is on its way out, while it is
}
