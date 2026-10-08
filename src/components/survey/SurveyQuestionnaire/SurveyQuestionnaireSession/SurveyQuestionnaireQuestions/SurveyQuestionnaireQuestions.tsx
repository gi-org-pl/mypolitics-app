import { SurveyQuestion } from "@/components/survey/SurveyQuestion/SurveyQuestion";
import type { SurveyPhaseContentProps } from "@/types/survey";
import { getCurrentQuestion } from "@/utils/survey/getCurrentQuestion";

import { SurveyQuestionnaireAnswers } from "./SurveyQuestionnaireAnswers/SurveyQuestionnaireAnswers";
import { useQuestionActions } from "./utils/useQuestionActions";

// The second phase: the current question and its answers. The screen is
// locked at the press of an answer, because the answer itself is recorded
// only when its acknowledgement has played. A done question is timed, and may
// be followed by a checkpoint card: both are the actions' to see to.
export const SurveyQuestionnaireQuestions = ({
  survey,
  session,
  lock,
}: SurveyPhaseContentProps) => {
  const { answer, skip } = useQuestionActions(survey, session);
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
