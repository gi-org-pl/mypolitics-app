import { useLingui } from "@lingui/react/macro";
import { useId } from "react";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import { AGREEMENT_LABELS } from "@/constants/comparison";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";

import {
  ROW_SIDES_CLASS_NAME,
  ROW_TINT_CLASS_NAMES,
} from "./QuestionRow.constants";
import type { QuestionRowProps } from "./QuestionRow.types";
import { Side } from "./Side/Side";
import { toRowSides } from "./utils/toRowSides";

// One question of a comparison: a row with its text, tinted by how the two
// sides stand on it, that opens into what each side chose. The row is a
// disclosure - one control, named by the question, that says whether it is
// open - and whether it is open is up to whoever draws it.
//
// The tint is a colour, so the row also says in a word how the two sides
// stand. The word is part of the name of the control, and is written out
// where colours are forced and the tint is gone.
//
// Opened, the two sides stand next to each other from the width the design
// draws its narrow frame at, and one under the other on anything narrower.
// The row is a container, so that width is its own. Its padding is the 16 px
// of the design less its 1 px border, which the design draws inside the row.
export const QuestionRow = ({
  compared,
  other,
  isOpen,
  onToggle,
}: QuestionRowProps) => {
  const { i18n, t } = useLingui();
  const answersId = useId();
  const { question, agreement } = compared;

  return (
    <div className="@container w-full min-w-0 rounded-2xl border border-gi-dark-ash">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? answersId : undefined}
        className={`flex w-full min-w-0 cursor-pointer items-center gap-3 p-3.75 text-left ${isOpen ? "rounded-t-[0.9375rem]" : "rounded-[0.9375rem]"} ${ROW_TINT_CLASS_NAMES[agreement]} ${FOCUS_CLASS_NAME}`}
        onClick={() => onToggle(question.id)}
      >
        <span className="min-w-0 grow text-base leading-4.75 font-bold wrap-break-word text-gi-light-primary">
          {question.text}{" "}
          <span className="sr-only forced-colors:not-sr-only forced-colors:block forced-colors:text-xs">
            {i18n._(AGREEMENT_LABELS[agreement])}
          </span>
        </span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gi-dark-ash bg-white">
          <span
            className={`${BUTTON_ICON_MASK_CLASS_NAME} h-1.5 w-2.5 mask-contain ${isOpen ? "rotate-180" : ""}`}
            style={getIconMaskStyle(chevronDownIcon)}
          />
        </span>
      </button>
      {isOpen && (
        <div id={answersId} className="border-t border-gi-dark-ash p-3.75">
          <div
            className={`mx-auto grid w-full max-w-120 gap-x-2 gap-y-4 ${ROW_SIDES_CLASS_NAME}`}
          >
            {toRowSides(compared, other, t`Ty`).map(({ id, ...side }) => (
              <Side key={id} {...side} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
