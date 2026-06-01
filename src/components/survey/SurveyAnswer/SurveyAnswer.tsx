import { ANSWER_TYPE_CONFIG } from "./SurveyAnswer.constants";
import type { SurveyAnswerProps } from "./SurveyAnswer.types";
import { useClickAnimation } from "./utils/useClickAnimation";

export function SurveyAnswer({
  title,
  type,
  onClick,
  isDisabled = false,
  isSelected = false,
}: SurveyAnswerProps) {
  const { buttonRef, iconRef, style, triggerAnimation, isAnimating } =
    useClickAnimation([title, type, isSelected]);

  const configKey =
    type === "custom-selectable"
      ? isSelected
        ? "custom-selectable-selected"
        : "custom-selectable-unselected"
      : type;

  const { bgClass, textClass, Icon, rippleColor } =
    ANSWER_TYPE_CONFIG[configKey];

  const handleClick = () => {
    if (!isDisabled) {
      triggerAnimation();
      onClick?.();
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      style={style}
      className={[
        "relative w-full h-14 flex items-center gap-3 rounded-[24px] px-4 text-left border border-gi-dark-ash overflow-hidden",
        "font-roboto font-bold text-base",
        bgClass,
        textClass,
        isDisabled
          ? "cursor-not-allowed saturate-0 opacity-50 pointer-events-none"
          : "",
      ].join(" ")}
    >
      <span
        className={[
          rippleColor,
          "absolute inset-0 transition-[clip-path] duration-150 ease-out opacity-50 rounded-full",
          isAnimating
            ? "[clip-path:circle(var(--size)_at_var(--cx)_var(--cy))]"
            : "[clip-path:circle(0%_at_var(--cx)_var(--cy))]",
        ].join(" ")}
      />

      <span
        ref={iconRef}
        className="shrink-0 flex items-center justify-center w-6 h-6 relative z-10"
      >
        <Icon className="w-6 h-6" />
      </span>
      <span className="grow relative z-10">{title}</span>
    </button>
  );
}
