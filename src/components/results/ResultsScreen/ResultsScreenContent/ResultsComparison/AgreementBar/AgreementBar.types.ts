import type { Orientation } from "@/types/orientation";

export interface AgreementBarProps {
  other: Orientation; // the other side: a friend as a person, or an orientation of the quiz
  score?: number; // the agreement score, 0-100. Absent = the bar is drawn without a value
  onEnd: () => void; // the control that ends the comparison
}
