import { useState } from "react";
import { Trans } from "@lingui/react/macro"; 
import { Button, Modal } from "@gi/athena";
import arrowBackIcon from "@/assets/icons/left-arrow.svg";
import cardQuestionIcon from "@/assets/icons/card-question.svg";
import resetIcon from "@/assets/icons/reset.svg";

import { NUMBER_ANIMATION_MS } from "./SurveyControls.constants";
import type { SurveyControlsProps } from "./SurveyContorls.types";
import { useAnimatedNumber } from "./utils/useAnimatedNumber";

function useBreakpoint(px: number): boolean {
  const mql = window.matchMedia(`(min-width: ${px + 1}px)`);
  const [isAbove, setIsAbove] = useState(() => mql.matches);
 
  useState(() => {
    const handler = (e: MediaQueryListEvent) => setIsAbove(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  });
 
  return isAbove;
}
export default function SurveyControls({
  title,
  phase,
  categoryName,
  questionsLeftnCategory,
  answersCount,
  onPrevious,
  onReset,
}: SurveyControlsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isLargeScreen = useBreakpoint(400);
  const isAnimating = useAnimatedNumber(questionsLeftnCategory);

  const isPrimitive = phase === "CATEGORY_SELECT" || phase === "FINISH";
  const backDisabled = isPrimitive || answersCount === 0;
  const resetDisabled = isPrimitive;

  function renderPill() {
    if (phase === "CATEGORY_SELECT") {
      return (
        <span className="text-sm font-medium truncate max-w-[8rem] text-gi-secondary text-ellipsis overflow-hidden whitespace-nowrap" data-testid="pill-title">
          {title}
        </span>
      );
    }

    if (phase === "FINISH") {
      return (
        <span className="text-sm font-medium text-gi-secondary" data-testid="pill-finish">
          <Trans>Prawie koniec!</Trans>
        </span>
      );
    }

    return (
      <span className="flex items-center gap-3 text-sm font-medium" data-testid="pill-question-answer">
        {isLargeScreen && (
          <>
            <span className="truncate max-w-[8rem] text-gi-secondary" data-testid="pill-category-name">
              {categoryName}
            </span>
            <span className="w-px h-[1em] bg-current opacity-25" data-testid="pill-divider" />
          </>
        )}
        <span className="flex items-center gap-1" data-testid="pill-question-count">
          <img src={cardQuestionIcon} alt="" aria-hidden="true" className="w-4 h-4" />
          <span
            className={`transition-all duration-[${NUMBER_ANIMATION_MS}ms] ${isAnimating ? "opacity-0 scale-90 text-gi-secondary" : "opacity-100 scale-100 text-gi-secondary"}` }
            data-testid="pill-count-number"
          >
            {questionsLeftnCategory}
          </span>
        </span>
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center  gap-1.5" data-testid="survey-controls">

        <Button
          type="outlined"
          variant="secondary"
          isIconButton
          disabled={backDisabled}
          onClick={onPrevious}
          aria-label="Previous question"
          data-testid="back-button"
        >
          <img src={arrowBackIcon} alt="back" aria-hidden="true" />
        </Button>

        <div
          className="flex items-center gap-3  rounded-full border border-gi-dark-ash bg-gi-ash px-4 py-2 ml-3 mr-3 min-w-0"
          data-testid="center-pill"
        >
          {renderPill()}
        </div>

        
        <Button
          type="outlined"
          variant="secondary"
          isIconButton
          disabled={resetDisabled}
          onClick={() => setModalOpen(true)}
          aria-label="Reset"
          data-testid="reset-button"
        >
          <img src={resetIcon} alt="reset" aria-hidden="true" />
        </Button>

      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Rozpocząć od nowa?"
        description={
          <Trans>
            Czy na pewno chcesz rozpocząć quiz <strong>{title}</strong> od nowa?{" "}
            Twoje odpowiedzi nie zostaną zapisane.
          </Trans>
        }
        actions={
          <Button
            type="primary"
            variant="danger"
            onClick={() => { onReset(); setModalOpen(false); }}
            data-testid="reset-confirm-button"
          >
           <Trans> Resetuj quiz </Trans>
          </Button>
        }
        dataTestId="reset-modal"
      />
    </>
  );
}