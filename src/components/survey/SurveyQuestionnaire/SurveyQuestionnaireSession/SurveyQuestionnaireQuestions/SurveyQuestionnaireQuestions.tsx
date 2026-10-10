import { AnimatedHeight } from "@/components/shared/AnimatedHeight/AnimatedHeight";
import type { SurveyPhaseContentProps } from "@/types/survey";
import { getCurrentQuestion } from "@/utils/survey/questions/getCurrentQuestion";

import { SurveyQuestionnaireAnswers } from "./SurveyQuestionnaireAnswers/SurveyQuestionnaireAnswers";
import { SurveyQuestionSlide } from "./SurveyQuestionSlide/SurveyQuestionSlide";
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

  // The phase stays mounted from one question to the next: the bubble of
  // the question slides, and the answers change in place, with the height of
  // their list moving to the new one.
  return (
    <>
      <SurveyQuestionSlide
        question={question}
        position={session.session.entries.length}
      />
      <AnimatedHeight>
        <SurveyQuestionnaireAnswers
          question={question}
          onPress={lock}
          onAnswer={answer}
          onSkip={skip}
        />
      </AnimatedHeight>
    </>
  );
};
