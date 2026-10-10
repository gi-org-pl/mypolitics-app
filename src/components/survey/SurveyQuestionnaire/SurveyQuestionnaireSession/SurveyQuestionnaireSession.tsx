import { useSurveySession } from "@/utils/survey/session/useSurveySession";
import { SurveyQuestionnaireFrame } from "./SurveyQuestionnaireFrame/SurveyQuestionnaireFrame";
import {
  CONTENT_CHANGE_MS,
  SURVEY_PHASE_CONTENT,
} from "./SurveyQuestionnaireSession.constants";
import type { SurveyQuestionnaireSessionProps } from "./SurveyQuestionnaireSession.types";
import { SurveyQuestionnaireTransition } from "./SurveyQuestionnaireTransition/SurveyQuestionnaireTransition";
import { getSurveyFrame } from "./utils/getSurveyFrame";
import { useContentChange } from "./utils/useContentChange";
import { useLeave } from "./utils/useLeave";
import { usePhaseFocus } from "./utils/usePhaseFocus";
import { useScreenLock } from "./utils/useScreenLock";
import { useUndrawnPhase } from "./utils/useUndrawnPhase";

// A quiz and its session: the frame of the phase the session is in, and the
// content registered for that phase. The screen decides nothing about the
// session - every event is an action of the session, called here or by the
// content.
export const SurveyQuestionnaireSession = ({
  survey,
}: SurveyQuestionnaireSessionProps) => {
  const session = useSurveySession(survey);
  const { contentKey, direction } = useContentChange(session.session);
  const { isLocked, lock } = useScreenLock(contentKey);
  const { topRef, contentRef } = usePhaseFocus(contentKey);
  const leave = useLeave(session);
  const Content = SURVEY_PHASE_CONTENT[session.session.phase];

  useUndrawnPhase(session, Content !== undefined);

  return (
    <SurveyQuestionnaireFrame
      quizName={survey.name ?? ""}
      frame={getSurveyFrame(survey, session.session)}
      isLocked={isLocked}
      topRef={topRef}
      onPrevious={session.back}
      onReset={session.reset}
    >
      <SurveyQuestionnaireTransition
        contentKey={contentKey}
        direction={direction}
        durationMs={CONTENT_CHANGE_MS}
        contentRef={contentRef}
      >
        {Content && (
          <Content
            survey={survey}
            session={session}
            lock={lock}
            onLeave={leave}
          />
        )}
      </SurveyQuestionnaireTransition>
    </SurveyQuestionnaireFrame>
  );
};
