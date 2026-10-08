import { toSingleLine } from "@/utils/text/toSingleLine";

import {
  FOCUS_TARGET_PROPS,
  LEAD_IN_END,
} from "./SurveyCheckpointText.constants";
import type { SurveyCheckpointTextProps } from "./SurveyCheckpointText.types";
import { splitByQuote } from "./utils/splitByQuote";

// The text of a card: one centred paragraph - the lead-in in the quiet
// colour, a long dash, then the statement in bold - read as one sentence,
// lead-in first. It wraps as text does and is never cut. Line breaks and
// doubled spaces are collapsed, and the text is shown as written: names and
// theses are author-supplied and are never read as markup.
//
// A quoted thesis is marked up as a quotation and set in italics. Its
// quotation marks are the line's own, so the element adds none.
//
// The quiet colour is the main one at three quarters: the half the frame is
// drawn with does not reach the contrast minimum for text of this size.
//
// The paragraph takes the focus when the card appears or changes, and only
// that way: it is not a stop for the Tab key.
export const SurveyCheckpointText = ({
  leadIn,
  statement,
  quote,
  textRef,
}: SurveyCheckpointTextProps) => {
  const leadInText = toSingleLine(leadIn);
  const { before, quoted, after } = splitByQuote(
    toSingleLine(statement),
    toSingleLine(quote),
  );

  return (
    <p
      ref={textRef}
      tabIndex={-1}
      {...FOCUS_TARGET_PROPS}
      className="w-full text-center text-base leading-[1.2] font-bold wrap-break-word text-gi-primary outline-none"
    >
      {leadInText !== "" && (
        <span className="text-gi-primary/75">{`${leadInText}${LEAD_IN_END}`}</span>
      )}
      {before}
      {quoted !== "" && <q className="italic [quotes:none]">{quoted}</q>}
      {after}
    </p>
  );
};
