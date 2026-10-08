import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { withoutPropagation } from "@/utils/event/withoutPropagation";

import type { QuizCardTitleProps } from "./QuizCardTitle.types";

export const QuizCardTitle = ({ children, onClick }: QuizCardTitleProps) => (
  <h2 className="min-w-0 text-2xl leading-7.25 font-bold tracking-[-0.01em] wrap-break-word text-gi-light-primary">
    {onClick ? (
      <button
        type="button"
        className={`block max-w-full cursor-pointer rounded-sm text-left ${FOCUS_CLASS_NAME}`}
        onClick={withoutPropagation(onClick)}
      >
        {children}
      </button>
    ) : (
      children
    )}
  </h2>
);
