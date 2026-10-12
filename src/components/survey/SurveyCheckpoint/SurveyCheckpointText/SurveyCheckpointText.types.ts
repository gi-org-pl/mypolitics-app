import type { Ref } from "react";

export interface SurveyCheckpointTextProps {
  leadIn?: string; // blank = no lead-in and no dash
  statement: string;
  quote?: string; // the part of the statement to mark as a quotation
  textRef?: Ref<HTMLParagraphElement>; // the paragraph: the element of the card that takes the focus
}

// A statement cut at its quotation. Without one, `before` is the statement
// and the other two are empty.
export interface QuotedText {
  before: string;
  quoted: string;
  after: string;
}
