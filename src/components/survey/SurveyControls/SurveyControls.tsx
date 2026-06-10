import { Button, Modal } from "@gi/athena";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useEffect, useState } from "react";
import cardQuestionIcon from "@/assets/icons/card-question.svg";
import arrowBackIcon from "@/assets/icons/left-arrow.svg";
import resetIcon from "@/assets/icons/reset.svg";
import type { SurveyControlsProps } from "./SurveyContorls.types";
import { NUMBER_ANIMATION_MS,SURVEY_PHASE } from "./SurveyControls.constants";
import { useAnimatedNumber } from "./utils/useAnimatedNumber";

function useBreakpoint(px: number): boolean {
  const query = `(min-width: ${px + 1}px)`;

  const [isAbove, setIsAbove] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsAbove(event.matches);
    };

    setIsAbove(mql.matches);

    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, [query]);

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

  const isPrimitive = phase === SURVEY_PHASE.CATEGORY_SELECT || phase === SURVEY_PHASE.FINISH;
  const backDisabled = isPrimitive || answersCount === 0;
  const resetDisabled = isPrimitive;

  function renderPill() {
    if (phase === SURVEY_PHASE.CATEGORY_SELECT) {
      return (
        <span
          className="flex items-center h-8 font-bold truncate text-ellipsis overflow-hidden whitespace-nowrap text-gi-primary"
          data-testid="pill-title"
        >
          {title}
        </span>
      );
    }

    if (phase === SURVEY_PHASE.FINISH) {
      return (
        <span
          className="font-bold flex items-center h-8 text-gi-primary"
          data-testid="pill-finish"
        >
          <Trans>Prawie koniec!</Trans>
        </span>
      );
    }

    return (
      <span
        className="flex items-center gap-3 h-8 font-bold text-gi-primary"
        data-testid="pill-question-answer"
      >
        {isLargeScreen && (
          <>
            <span
              className="truncate text-ellipsis overflow-hidden whitespace-nowrap"
              data-testid="pill-category-name"
            >
              {categoryName}
            </span>
            <span
              className="w-px h-[1em] bg-current opacity-25"
              data-testid="pill-divider"
            />
          </>
        )}
        <span
          className="flex items-center gap-1"
          data-testid="pill-question-count"
        >
          <img
            src={cardQuestionIcon}
            alt=""
            aria-hidden="true"
            className="w-5 h-5"
          />
          <span
            className={`transition-all duration-[${NUMBER_ANIMATION_MS}ms] ${isAnimating ? "opacity-0 scale-90 text-gi-primary" : "opacity-100 scale-100 text-gi-primary"}`}
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
      <div className="flex items-center justify-between gap-1.5 w-full" data-testid="survey-controls">
        <Button
          type="outlined"
          variant="primary"
          isIconButton
          disabled={backDisabled}
          onClick={onPrevious}
          aria-label={t`Previous question`}
          data-testid="back-button"
          className="h-12 w-12 shrink-0"
        >
          <img src={arrowBackIcon} alt="back" aria-hidden="true" />
        </Button>

        <div
          className="flex items-center justify-center gap-3 rounded-full bg-gi-dark-ash px-4 py-2 mx-3 min-w-0 overflow-hidden"
          data-testid="center-pill"
        >
          {renderPill()}
        </div>

        <Button
          type="outlined"
          variant="primary"
          isIconButton
          disabled={resetDisabled}
          onClick={() => setModalOpen(true)}
          aria-label={t`Reset`}
          data-testid="reset-button"
          className="h-12 w-12 shrink-0"
        >
          <img src={resetIcon} alt="reset" aria-hidden="true" />
        </Button>
      </div>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={<Trans>Rozpocząć od nowa?</Trans>}
          description={
            <Trans>
              Czy na pewno chcesz rozpocząć quiz <strong>{title}</strong> od
              nowa? Twoje odpowiedzi nie zostaną zapisane.
            </Trans>
          }
          actions={
            <Button
              type="primary"
              variant="danger"
              onClick={() => {
                onReset();
                setModalOpen(false);
              }}
              data-testid="reset-confirm-button"
            >
              <Trans>Resetuj quiz</Trans>
            </Button>
          }
          dataTestId="reset-modal"
        />
      )}
    </>
  );
}
