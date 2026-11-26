import type { Agreement } from "@/types/comparison";

export interface AnswerProps {
  text?: string; // what the side chose. Absent = the side has no answer to the question
  agreement?: Agreement; // how it stands to the answer of the taker: a tick, a cross, or no mark
  isTaker?: boolean; // an answer of the taker: written from the end of its line
}

// How an answer is drawn: its chip, and the mark beside it when it has one.
export interface AnswerLook {
  chipClassName: string;
  markUrl?: string;
}
