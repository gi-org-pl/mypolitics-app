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

  const borderColor = isSelected ? "#324C52" : "#D3D9DA";

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      style={{ ...style, borderColor }}
      className={[
        "relative w-full h-14 flex items-center gap-3 rounded-3xl px-4 text-left border overflow-hidden transition-colors hover:bg-gi-ash",
        "font-roboto font-bold text-base",
        bgClass,
        textClass,
        isDisabled || animationPhase
          ? "cursor-not-allowed pointer-events-none"
          : "",
        isDisabled ? "saturate-0 opacity-50" : "",
      ].join(" ")}
    >
      {rippleColor && (
        <span
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
        className="shrink-0 flex items-center justify-center w-6 h-6 relative z-10"
      >
        <img src={iconName} alt="Ikona odpowiedzi" className="w-6 h-6" />
      </span>
      <span className="grow relative z-10">{title}</span>
    </button>
  );
}
