import type { SurveyQuestion } from "@/types/survey";

export interface SurveyQuestionnaireAnswersProps {
  question: SurveyQuestion;
  onPress: () => void; // an answer was pressed: its acknowledgement starts
  onAnswer: (answerId: string) => void; // the acknowledgement has played
  onSkip: () => void;
}
