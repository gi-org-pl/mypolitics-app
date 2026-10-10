import { useLingui } from "@lingui/react";

import { AnimatedHeight } from "@/components/shared/AnimatedHeight/AnimatedHeight";
import { SurveyControls } from "@/components/survey/SurveyControls/SurveyControls";
import { SurveySaturatedProgressBar } from "@/components/survey/SurveySaturatedProgressBar/SurveySaturatedProgressBar";
import { cancelEvent } from "@/utils/event/cancelEvent";

import type { SurveyQuestionnaireFrameProps } from "./SurveyQuestionnaireFrame.types";

// The frame of the screen: the bar and the controls bar, which stay mounted
// whatever the content does, and the content under them. While locked, nothing
// in the frame takes a press or a key, and nothing looks any different: no
// control is drawn disabled.
//
// The place of the bar - the bar and the space under it - closes and opens
// smoothly where a phase has no bar, so the controls do not jump either.
export const SurveyQuestionnaireFrame = ({
  quizName,
  frame,
  isLocked,
  topRef,
  onPrevious,
  onReset,
  children,
}: SurveyQuestionnaireFrameProps) => {
  const { i18n } = useLingui();
  const label = frame.label && i18n._(frame.label);

  return (
    <div
      data-locked={isLocked}
      onClickCapture={isLocked ? cancelEvent : undefined}
      onKeyDownCapture={isLocked ? cancelEvent : undefined}
      className="flex w-full flex-col gap-4 data-[locked=true]:pointer-events-none"
    >
      <div ref={topRef} className="flex w-full scroll-mt-10 flex-col">
        <AnimatedHeight>
          {frame.progress && (
            <div className="w-full pb-4">
              <SurveySaturatedProgressBar
                value={frame.progress.done}
                maxValue={frame.progress.all}
              />
            </div>
          )}
        </AnimatedHeight>
        <SurveyControls
          quizName={quizName}
          label={label}
          categoryName={frame.categoryName}
          questionsLeft={frame.questionsLeft}
          isPreviousDisabled={!frame.canStepBack}
          isResetDisabled={!frame.canReset}
          previousLabel={frame.previousLabel && i18n._(frame.previousLabel)}
          onPrevious={onPrevious}
          onReset={onReset}
        />
      </div>
      {/* The end announces itself: the label of the pill is read once, when
          it appears or changes. */}
      <p role="status" className="sr-only">
        {label}
      </p>
      {children}
    </div>
  );
};
