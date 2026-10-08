import { CONTENT_ARRIVAL_CLASS_NAME } from "./SurveyQuestionnaireTransition.constants";
import type { SurveyQuestionnaireTransitionProps } from "./SurveyQuestionnaireTransition.types";

// The movement between two contents. The old content leaves at once and the
// new one arrives from the side the taker is moving to, in one short CSS
// transition from its starting style; under reduced motion nothing moves. The
// content that is on screen when the screen appears has no direction, and
// does not move either.
//
// How long the movement lasts is the screen's to say, because the screen
// stays locked for as long. A class name cannot be built from a number, so
// the duration is a style.
//
// The element is the top of the content: it takes the focus when the content
// changes, and is not a stop for the Tab key.
export const SurveyQuestionnaireTransition = ({
  contentKey,
  direction,
  durationMs,
  contentRef,
  children,
}: SurveyQuestionnaireTransitionProps) => (
  <div
    key={contentKey}
    ref={contentRef}
    tabIndex={-1}
    data-direction={direction}
    style={{ transitionDuration: `${durationMs}ms` }}
    className={`flex w-full flex-col gap-4 outline-none transition-[opacity,translate] ease-out motion-reduce:transition-none ${
      direction ? CONTENT_ARRIVAL_CLASS_NAME[direction] : ""
    }`}
  >
    {children}
  </div>
);
