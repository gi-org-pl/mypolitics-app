import type { QuestionSlideDirection } from "./SurveyQuestionSlide.types";

// How long a question takes to slide in and the one before it to slide out:
// the 0.3 s of the legacy questionnaire. The screen stays locked for as long.
export const QUESTION_SLIDE_MS = 300;

// A bubble on the move. The two move as one strip, a bubble's width and the
// 32 px between them in the design, eased in and out as in the legacy
// questionnaire. The duration is a style: a class name cannot be built from a
// number.
export const BUBBLE_CLASS_NAME =
  "w-full transition-[translate,opacity] ease-in-out motion-reduce:transition-none";

// Where the new question comes from: the side the taker is moving to.
export const ARRIVING_CLASS_NAME: Record<QuestionSlideDirection, string> = {
  forwards: "starting:translate-x-[calc(100%+2rem)]",
  backwards: "starting:-translate-x-[calc(100%+2rem)]",
};

// Where the question before goes, fading on its way: the other side. It is
// taken out of the flow, so the height is the new question's from the start.
export const LEAVING_CLASS_NAME: Record<QuestionSlideDirection, string> = {
  forwards:
    "pointer-events-none absolute top-0 left-0 -translate-x-[calc(100%+2rem)] opacity-0",
  backwards:
    "pointer-events-none absolute top-0 left-0 translate-x-[calc(100%+2rem)] opacity-0",
};
