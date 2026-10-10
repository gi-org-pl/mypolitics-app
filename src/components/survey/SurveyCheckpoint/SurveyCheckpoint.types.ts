import type { ReactNode } from "react";

export interface SurveyCheckpointProps {
  visual: ReactNode; // what the card shows: a chart, a pill, a number. Nothing to draw = the card is not drawn
  leadIn?: string; // the opener, translated. Blank = no lead-in and no dash
  statement: string; // the finding, translated, its slots filled. Blank = the card is not drawn
  quote?: string; // a part of the statement to mark as a quotation - the stats card passes the thesis
  options?: ReactNode; // the rows a puzzle offers, stacked by the frame. Nothing to draw = no options
  isContinueAvailable?: boolean; // default true. false = "Dalej" is not drawn at all. This is how a card withholds "Dalej"
  onContinue: () => void; // "Dalej" was pressed. Also how a card that cannot be drawn leaves
  onOptOut: () => void; // "Wyłącz checkpointy" was pressed
}

// The two requests a card can make, each let through once.
export interface CheckpointActions {
  requestContinue: () => void;
  requestOptOut: () => void;
}
