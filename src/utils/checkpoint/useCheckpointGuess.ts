import { useCallback, useRef, useState } from "react";

import type {
  CheckpointCard,
  CheckpointCardProps,
  CheckpointLine,
  CheckpointOutcome,
} from "@/types/checkpoint";
import { safely } from "@/utils/function/safely";

export type CheckpointGuessState = "ask" | CheckpointOutcome;

export interface CheckpointGuess {
  state: CheckpointGuessState;
  line: CheckpointLine; // the card's own line while asking, the reveal line after the guess
  guess: (outcome: CheckpointOutcome) => void; // acts once; every later call does nothing
}

interface CheckpointReveal {
  outcome: CheckpointOutcome;
  line: CheckpointLine;
}

// The three states of a puzzle and the one move between them. A puzzle asks
// until the taker guesses; the guess asks for its reveal line once, and with
// that line the puzzle is a hit or a miss for as long as it is on screen.
// With no line to show there is nothing to reveal, so the card is left
// instead, and it stays as it was. The guess lives here and nowhere else: a
// card that is mounted again asks again.
export const useCheckpointGuess = (
  card: CheckpointCard,
  onReveal: CheckpointCardProps["onReveal"],
  onContinue: () => void,
): CheckpointGuess => {
  const [reveal, setReveal] = useState<CheckpointReveal>();
  const hasGuessed = useRef(false);

  const guess = useCallback(
    (outcome: CheckpointOutcome) => {
      if (hasGuessed.current) return;

      hasGuessed.current = true;

      const line = safely(() => onReveal(outcome), undefined);

      if (line) {
        setReveal({ outcome, line });
      } else {
        onContinue();
      }
    },
    [onReveal, onContinue],
  );

  return {
    state: reveal?.outcome ?? "ask",
    line: reveal?.line ?? card.line,
    guess,
  };
};
