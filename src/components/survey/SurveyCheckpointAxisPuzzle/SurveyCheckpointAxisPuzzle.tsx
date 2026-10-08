import { useLingui } from "@lingui/react/macro";

import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import { SurveyCheckpoint } from "@/components/survey/SurveyCheckpoint/SurveyCheckpoint";
import { SurveyCheckpointOptions } from "@/components/survey/SurveyCheckpointOptions/SurveyCheckpointOptions";
import type { CheckpointCardProps } from "@/types/checkpoint";
import { getCheckpointText } from "@/utils/checkpoint/getCheckpointText";
import { useCheckpointGuess } from "@/utils/checkpoint/useCheckpointGuess";

import { getAxisPuzzleOptions } from "./utils/getAxisPuzzleOptions";
import { getAxisPuzzleOutcome } from "./utils/getAxisPuzzleOutcome";
import { useAxisPuzzleDescription } from "./utils/useAxisPuzzleDescription";

// The single axis puzzle: it hides the reading of one two-sided axis, asks
// the taker which of its two poles they are closer to, and shows the reading
// the moment they pick. It asks with the bar masked and the two poles as
// options, in the order of the bar, and without "Dalej": the guess is the way
// forward. After the guess the same bar is uncovered - the same for a hit and
// for a miss - the options are gone and the line of the outcome is shown.
//
// The guess is held here for as long as the card is on screen and goes
// nowhere else. Hit or miss is read from the card as it fired; nothing is
// counted again. The bar never carries a number, and while the card asks,
// nothing in it carries a value at all.
//
// A card with a pole without a name, or whose line cannot be finished, hands
// the frame nothing to draw, and the frame leaves by itself.
export const SurveyCheckpointAxisPuzzle = ({
  card,
  onReveal,
  onContinue,
  onOptOut,
}: CheckpointCardProps<"axis-puzzle">) => {
  const { i18n } = useLingui();
  const { state, line, guess } = useCheckpointGuess(card, onReveal, onContinue);
  const description = useAxisPuzzleDescription(card, state);
  const options = getAxisPuzzleOptions(card);
  const text = getCheckpointText(i18n, card, line);
  const statement = text?.statement ?? "";
  const isAsking = state === "ask";

  return (
    <SurveyCheckpoint
      visual={
        options && (
          <UniversalAxis
            start={card.start}
            end={card.end}
            showLabels
            showValues={false}
            isMasked={isAsking}
            description={description}
          />
        )
      }
      leadIn={text?.leadIn}
      statement={statement}
      options={
        isAsking &&
        options && (
          <SurveyCheckpointOptions
            label={statement}
            options={options}
            onSelect={(picked) => guess(getAxisPuzzleOutcome(card, picked))}
          />
        )
      }
      isContinueAvailable={!isAsking}
      onContinue={onContinue}
      onOptOut={onOptOut}
    />
  );
};
