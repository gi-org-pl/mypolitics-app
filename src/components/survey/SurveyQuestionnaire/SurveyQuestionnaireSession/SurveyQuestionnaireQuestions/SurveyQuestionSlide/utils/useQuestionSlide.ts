import { useEffect, useState } from "react";

import type { SurveyQuestion } from "@/types/survey";
import { prefersReducedMotion } from "@/utils/motion/prefersReducedMotion";

import type {
  QuestionSlide,
  QuestionSlideDirection,
} from "../SurveyQuestionSlide.types";

interface SlideState {
  question: SurveyQuestion; // the question on screen
  position: number;
  direction?: QuestionSlideDirection;
  leaving?: SurveyQuestion;
}

// The question on screen, the way it arrived and - for as long as the slide
// lasts - the question it took the place of. All of it is worked out in the
// render that shows the new question, so the two are on screen from the same
// frame on. Forwards is any change that does not lead to an earlier place in
// the session.
//
// There are never more than two: a question that arrives while another is
// still leaving takes the place of the one that was arriving, and the one
// that was leaving is gone at once. Under reduced motion nothing leaves and
// nothing has a direction: the new question is simply there.
export const useQuestionSlide = (
  question: SurveyQuestion,
  position: number,
  durationMs: number,
): QuestionSlide => {
  const [state, setState] = useState<SlideState>({ question, position });
  let shown = state;

  if (state.question.id !== question.id) {
    shown = prefersReducedMotion()
      ? { question, position }
      : {
          question,
          position,
          direction: position < state.position ? "backwards" : "forwards",
          leaving: state.question,
        };
    setState(shown);
  }

  const leavingId = shown.leaving?.id;

  useEffect(() => {
    if (leavingId === undefined) return;

    // The timer is ended as soon as another question leaves, so the one that
    // runs out always belongs to the question that is leaving now.
    const timeout = setTimeout(
      () => setState((current) => ({ ...current, leaving: undefined })),
      durationMs,
    );

    return () => clearTimeout(timeout);
  }, [leavingId, durationMs]);

  // The question itself is the one handed in: the same question read again,
  // in another language, is shown as it is now.
  return {
    current: question,
    direction: shown.direction,
    leaving: shown.leaving,
  };
};
