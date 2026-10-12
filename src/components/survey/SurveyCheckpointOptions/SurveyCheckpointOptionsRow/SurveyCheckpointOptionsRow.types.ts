import type { Orientation } from "@/types/orientation";

export interface SurveyCheckpointOptionsRowProps {
  orientation: Orientation; // what the row offers: its image, colour and name
  onSelect: (orientation: Orientation) => void; // the row was activated
}
