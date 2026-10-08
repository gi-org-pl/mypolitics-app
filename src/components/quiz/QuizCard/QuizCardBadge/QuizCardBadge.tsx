import { twMerge } from "tailwind-merge";

import {
  BADGE_PLACEMENT_CLASS_NAMES,
  HIGHLIGHTED_BADGE_CLASS_NAME,
} from "./QuizCardBadge.constants";
import type { QuizCardBadgeProps } from "./QuizCardBadge.types";

export const QuizCardBadge = ({
  text,
  placement,
  isHighlighted,
}: QuizCardBadgeProps) => (
  <p
    className={twMerge(
      "w-fit max-w-full rounded-br-2xl bg-gi-primary text-sm leading-4.5 font-bold wrap-break-word text-white",
      BADGE_PLACEMENT_CLASS_NAMES[placement],
      isHighlighted && HIGHLIGHTED_BADGE_CLASS_NAME,
    )}
  >
    {text}
  </p>
);
