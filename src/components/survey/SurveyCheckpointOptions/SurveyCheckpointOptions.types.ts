import type { Orientation } from "@/types/orientation";

export interface SurveyCheckpointOptionsProps {
  label: string; // the name of the group: the statement the options answer, translated
  options: Orientation[]; // one row each, in this order. Never reordered here
  onSelect: (orientation: Orientation) => void; // called for the first activation only
}
