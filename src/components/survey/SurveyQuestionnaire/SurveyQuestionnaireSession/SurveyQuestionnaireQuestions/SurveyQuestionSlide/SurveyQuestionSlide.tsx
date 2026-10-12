import { AnimatedHeight } from "@/components/shared/AnimatedHeight/AnimatedHeight";
import { SurveyQuestion } from "@/components/survey/SurveyQuestion/SurveyQuestion";

import {
  ARRIVING_CLASS_NAME,
  BUBBLE_CLASS_NAME,
  LEAVING_CLASS_NAME,
  QUESTION_SLIDE_MS,
} from "./SurveyQuestionSlide.constants";
import type { SurveyQuestionSlideProps } from "./SurveyQuestionSlide.types";
import { useQuestionSlide } from "./utils/useQuestionSlide";

// The bubble of the current question, and the change from one question to
// the next: the bubble of the question before leaves to the side the taker
// came from, fading, while the new one comes in from the side they are moving
// to - both on screen at once, as one strip, cut off by whatever clips the
// screen around them. Nothing else moves sideways. The height of the place
// they share follows the new bubble smoothly, so what stands under it does
// not jump.
//
// A bubble is one element for as long as its question is on screen, keyed by
// the question: when its question leaves, the same element is restyled and
// CSS moves it out, with its explanation as open as it was. The bubble that
// leaves is out of reach of the pointer, the keyboard and a screen reader.
// The new bubble moves in from its starting style; under reduced motion the
// question is replaced at once.
export const SurveyQuestionSlide = ({
  question,
  position,
}: SurveyQuestionSlideProps) => {
  const { current, direction, leaving } = useQuestionSlide(
    question,
    position,
    QUESTION_SLIDE_MS,
  );
  const style = { transitionDuration: `${QUESTION_SLIDE_MS}ms` };

  return (
    <AnimatedHeight durationMs={QUESTION_SLIDE_MS}>
      <div className="relative w-full">
        {leaving && direction && (
          <div
            key={leaving.id}
            aria-hidden="true"
            inert
            data-leaving={direction}
            style={style}
            className={`${BUBBLE_CLASS_NAME} ${LEAVING_CLASS_NAME[direction]}`}
          >
            <SurveyQuestion
              question={leaving.text}
              explanation={leaving.explanation}
            />
          </div>
        )}
        <div
          key={current.id}
          data-arriving={direction}
          style={style}
          className={`${BUBBLE_CLASS_NAME} ${
            direction ? ARRIVING_CLASS_NAME[direction] : ""
          }`}
        >
          <SurveyQuestion
            question={current.text}
            explanation={current.explanation}
          />
        </div>
      </div>
    </AnimatedHeight>
  );
};
