import type { SurveyQuestionnaireTransitionProps } from "../../SurveyQuestionnaire.types";
import {
  CONTENT_ARRIVAL_CLASS_NAME,
  CONTENT_CHANGE_STYLE,
} from "../SurveyQuestionnaireSession.constants";

// The movement between two contents. The old content leaves at once and the
// new one arrives from the side the taker is moving to, in one short CSS
// transition from its starting style; under reduced motion nothing moves. The
// content that is on screen when the screen appears has no direction, and
// does not move either.
//
// The element is the top of the content: it takes the focus when the content
// changes, and is not a stop for the Tab key.
export const SurveyQuestionnaireTransition = ({
  contentKey,
  direction,
  contentRef,
  children,
}: SurveyQuestionnaireTransitionProps) => (
  <div
    key={contentKey}
    ref={contentRef}
    tabIndex={-1}
    data-direction={direction}
    style={CONTENT_CHANGE_STYLE}
    className={`flex w-full flex-col gap-4 outline-none transition-[opacity,translate] ease-out motion-reduce:transition-none ${
      direction ? CONTENT_ARRIVAL_CLASS_NAME[direction] : ""
    }`}
  >
    {children}
  </div>
);
