import type { Orientation } from "@/types/orientation";

import type { AnswerProps } from "./Answer/Answer.types";

// One answer of a side: what it chose, and how that stands to the answer of
// the taker.
export interface SideAnswer extends Pick<AnswerProps, "agreement"> {
  id: string;
  text: string;
}

export interface SideProps {
  who: Pick<Orientation, "name" | "imageUrl" | "color">; // who the side is: the name it goes by, and its mark
  answers: SideAnswer[]; // what the side chose. None = the side has no answer
  isTaker?: boolean; // the side of the taker: drawn from the end of the row
}
