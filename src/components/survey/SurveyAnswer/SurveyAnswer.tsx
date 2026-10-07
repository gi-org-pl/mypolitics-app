import { twMerge } from "tailwind-merge";

import {
  ANSWER_TYPE_CONFIG,
  CLICK_ANIMATION_MS,
} from "./SurveyAnswer.constants";
import type { SurveyAnswerProps } from "./SurveyAnswer.types";
import { useClickAnimation } from "./utils/useClickAnimation";

export function SurveyAnswer({
  title,
  type,
  onClick,
  isDisabled = false,
  isSelected = false,
}: SurveyAnswerProps) {
  const {
    buttonRef,
    iconRef,
    style,
    triggerAnimation,
    animationPhase,
    handleRippleTransitionEnd,
  } = useClickAnimation([title, type, isSelected]);

  const configKey =
    type === "custom-selectable"
      ? isSelected
        ? "custom-selectable-selected"
        : "custom-selectable-unselected"
      : type;

  const { bgClass, textClass, iconName, rippleColor } =
    ANSWER_TYPE_CONFIG[configKey];

  const handleClick = () => {
    if (isDisabled || animationPhase) return;
    if (rippleColor) {
      triggerAnimation();
      setTimeout(() => {
        onClick?.();
      }, CLICK_ANIMATION_MS);
    } else {
      onClick?.();
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={isDisabled}
      aria-pressed={type === "custom-selectable" ? isSelected : undefined}
      onClick={handleClick}
      style={style}
      className={twMerge(
        "relative flex min-h-14 w-full items-center gap-3 overflow-hidden rounded-3xl border p-[15px] text-left transition-colors hover:bg-gi-ash",
        "font-roboto text-base font-bold",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-primary",
        bgClass,
        textClass,
        isSelected ? "border-gi-dark-gray" : "border-gi-dark-ash",
        (isDisabled || animationPhase) &&
          "pointer-events-none cursor-not-allowed",
      )}
    >
      {rippleColor && (
        <span
          aria-hidden="true"
          data-testid="survey-answer-ripple"
          className="absolute inset-0"
          onTransitionEnd={handleRippleTransitionEnd}
          style={{
            backgroundColor: rippleColor,
            clipPath:
              animationPhase === "expanding"
                ? "circle(var(--size) at var(--cx) var(--cy))"
                : "circle(0px at var(--cx) var(--cy))",
            transition:
              animationPhase === "expanding"
                ? `clip-path ${CLICK_ANIMATION_MS}ms ease-out`
                : animationPhase === "fading"
                  ? `clip-path ${CLICK_ANIMATION_MS}ms ease-in`
                  : "none",
          }}
        />
      )}

      <span
        ref={iconRef}
        className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center"
      >
        <img
          src={iconName}
          alt=""
          className={twMerge("h-6 w-6", isDisabled && "opacity-50 saturate-0")}
        />
      </span>
      <span
        className={twMerge(
          "relative z-10 min-w-0 grow wrap-break-word leading-[19px]",
          isDisabled && "opacity-50",
        )}
      >
        {title}
      </span>
    </button>
  );
}
