import type { ComparedQuestion } from "@/types/comparison";
import type { Orientation } from "@/types/orientation";

import type { SideProps } from "./Side/Side.types";

export interface QuestionRowProps {
  compared: ComparedQuestion; // the question, what each side answers it, and how the two stand on it
  other: Orientation; // who the other side is
  isOpen: boolean;
  onToggle: (questionId: string) => void;
}

// A side of an opened row, with what tells it from the other one.
export interface RowSide extends SideProps {
  id: "other" | "taker";
}
