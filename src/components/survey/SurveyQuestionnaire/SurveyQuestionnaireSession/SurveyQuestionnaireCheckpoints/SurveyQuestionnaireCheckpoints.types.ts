import type {
  CheckpointCard,
  CheckpointLine,
  CheckpointOutcome,
} from "@/types/checkpoint";

export interface CheckpointCardControls {
  card: CheckpointCard | null; // the card that is up: the last of the cards shown, when it can be read and its type is registered
  reveal: (outcome: CheckpointOutcome) => CheckpointLine | undefined; // the reveal line of a puzzle, kept with its card
  close: () => void; // "Dalej": the session's closeCheckpoint
  optOut: () => void; // "Wyłącz checkpointy": the session's turnCheckpointsOff
}
