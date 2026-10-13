import type { ComparedQuestion } from "@/types/comparison";
import type { Orientation } from "@/types/orientation";

export interface QuestionListProps {
  questions: ComparedQuestion[]; // the questions to list, in the order they are listed
  other: Orientation; // who the other side is
  openIds: string[]; // the questions whose row is open
  onToggle: (questionId: string) => void; // a row was pressed
}
