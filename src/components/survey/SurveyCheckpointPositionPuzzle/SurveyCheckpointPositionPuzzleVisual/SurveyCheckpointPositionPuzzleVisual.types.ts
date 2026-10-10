import type { AxisEntry } from "@/types/axis";

export interface SurveyCheckpointPositionPuzzleVisualProps {
  name?: string; // the archetype the bar is about. Blank = held back: the placeholder is drawn in its place
  entry: AxisEntry; // what the bar is drawn from: who, in which colour, and how close
  description: string; // the bar in words, translated
}
