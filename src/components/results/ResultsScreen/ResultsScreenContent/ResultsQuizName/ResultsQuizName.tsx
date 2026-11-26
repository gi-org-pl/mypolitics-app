import quizIcon from "@/assets/icons/quiz.svg";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { ResultsQuizNameProps } from "./ResultsQuizName.types";

// The name of the quiz the result belongs to, under the modules. A quiz with
// no name has no row. The name is written by the quiz author, so it wraps
// instead of being cut.
export const ResultsQuizName = ({ name: rawName }: ResultsQuizNameProps) => {
  const name = toSingleLine(rawName);

  if (name === "") return null;

  return (
    <p className="flex items-center justify-center gap-2 border-t border-gi-ash px-6 py-4 text-base leading-[19px] font-bold text-gi-primary">
      <span
        aria-hidden="true"
        className="block h-3.5 w-[18.73px] shrink-0 bg-current mask-contain mask-center mask-no-repeat forced-colors:bg-[color:CanvasText]"
        style={getIconMaskStyle(quizIcon)}
      />
      <span className="min-w-0 wrap-break-word">{name}</span>
    </p>
  );
};
