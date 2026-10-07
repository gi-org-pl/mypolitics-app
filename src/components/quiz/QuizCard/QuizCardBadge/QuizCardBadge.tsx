import type { QuizCardBadgeProps } from "./QuizCardBadge.types";

export const QuizCardBadge = ({
  text,
  isBelowImage,
  isHighlighted,
}: QuizCardBadgeProps) => (
  <p
    className={`w-fit max-w-full rounded-br-2xl bg-gi-primary text-sm leading-4.5 font-bold wrap-break-word text-white ${
      isBelowImage ? "px-3 py-1.5" : "px-4 py-2.5"
    } ${isHighlighted ? "md:px-6" : ""}`}
  >
    {text}
  </p>
);
