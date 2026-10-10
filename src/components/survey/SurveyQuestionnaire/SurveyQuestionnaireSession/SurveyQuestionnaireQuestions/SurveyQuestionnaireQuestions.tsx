import { SurveyQuestion } from "@/components/survey/SurveyQuestion/SurveyQuestion";
import type { SurveyPhaseContentProps } from "@/types/survey";
import { getCurrentQuestion } from "@/utils/survey/questions/getCurrentQuestion";

import { SurveyQuestionnaireAnswers } from "./SurveyQuestionnaireAnswers/SurveyQuestionnaireAnswers";
import { useQuestionActions } from "./utils/useQuestionActions";

// The second phase: the current question and its answers. The screen is
// locked at the press of an answer, because the answer itself is recorded
// only when its acknowledgement has played.
export const SurveyQuestionnaireQuestions = ({
  survey,
  session,
  lock,
}: SurveyPhaseContentProps) => {
  const { answer, skip } = useQuestionActions(session);
  const question = getCurrentQuestion(survey, session.session);

  if (!question) return null;

  return (
    <>
      <SurveyQuestion
        question={question.text}
        explanation={question.explanation}
      />
      <SurveyQuestionnaireAnswers
        question={question}
        onPress={lock}
        onAnswer={answer}
        onSkip={skip}
      />
    </>
  );
};
