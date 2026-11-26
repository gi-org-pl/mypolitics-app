import { useLingui } from "@lingui/react/macro";

import type { QuestionListProps } from "./QuestionList.types";
import { QuestionRow } from "./QuestionRow/QuestionRow";

// The questions of a comparison, one row under another, as a list: a screen
// reader says how many there are and where in them it is. When nothing is
// left to list, a line says so in place of the list. The line is a status
// that is always there, so it is read out when it gets its sentence.
//
// A long quiz has more than a hundred rows. Each is laid out by the browser
// alone, and a closed row is one control, so the list needs no measuring.
export const QuestionList = ({
  questions,
  other,
  openIds,
  onToggle,
}: QuestionListProps) => {
  const { t } = useLingui();
  const isEmpty = questions.length === 0;

  return (
    <div className="w-full min-w-0">
      <p
        role="status"
        className="text-base leading-[1.2] wrap-break-word text-gi-primary empty:hidden"
      >
        {isEmpty ? t`Brak pytań do pokazania.` : null}
      </p>
      {!isEmpty && (
        <ul aria-label={t`Pytania`} className="flex min-w-0 flex-col gap-2">
          {questions.map((compared) => (
            <li key={compared.question.id} className="flex min-w-0">
              <QuestionRow
                compared={compared}
                other={other}
                isOpen={openIds.includes(compared.question.id)}
                onToggle={onToggle}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
