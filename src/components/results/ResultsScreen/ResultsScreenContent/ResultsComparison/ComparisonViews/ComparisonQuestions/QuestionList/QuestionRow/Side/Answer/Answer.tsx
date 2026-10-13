import { useLingui } from "@lingui/react/macro";

import { AGREEMENT_LABELS } from "@/constants/comparison";
import { Agreement } from "@/types/comparison";

import { ANSWER_LOOKS, NO_ANSWER_LOOK } from "./Answer.constants";
import type { AnswerProps } from "./Answer.types";

// What one side chose for a question: the text of the answer in a chip. A
// side with nothing to show says so in the same place.
//
// An answer that can be held up against the answer of the taker has a mark
// beside it - a tick when it is the answer of the taker, a cross when it is
// not - and an outline in the colour of the mark. The mark is read out as a
// word, so it does not rest on its colour.
//
// The text is written in full, on as many lines as it takes.
export const Answer = ({
  text,
  agreement = Agreement.Neither,
  isTaker = false,
}: AnswerProps) => {
  const { i18n, t } = useLingui();
  const { chipClassName, markUrl } =
    text === undefined ? NO_ANSWER_LOOK : ANSWER_LOOKS[agreement];

  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <span
        data-testid="answer-chip"
        className={`min-w-0 grow rounded-2xl border px-2.75 py-1.75 text-xs leading-[1.2] font-bold wrap-break-word text-gi-primary ${isTaker ? "text-right" : ""} ${chipClassName}`}
      >
        {text ?? t`Brak odpowiedzi`}
      </span>
      {markUrl && (
        <img
          src={markUrl}
          alt={i18n._(AGREEMENT_LABELS[agreement])}
          className="size-6 shrink-0"
        />
      )}
    </div>
  );
};
