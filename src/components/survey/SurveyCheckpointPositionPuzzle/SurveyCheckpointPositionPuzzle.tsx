import { useLingui } from "@lingui/react/macro";

import { SurveyCheckpoint } from "@/components/survey/SurveyCheckpoint/SurveyCheckpoint";
import { SurveyCheckpointOptions } from "@/components/survey/SurveyCheckpointOptions/SurveyCheckpointOptions";
import type { CheckpointCardProps } from "@/types/checkpoint";
import { getCheckpointText } from "@/utils/checkpoint/lines/getCheckpointText";
import { useCheckpointGuess } from "@/utils/checkpoint/useCheckpointGuess";

import { SurveyCheckpointPositionPuzzleVisual } from "./SurveyCheckpointPositionPuzzleVisual/SurveyCheckpointPositionPuzzleVisual";
import { canDrawPositionPuzzle } from "./utils/canDrawPositionPuzzle";
import { getPositionPuzzleEntry } from "./utils/getPositionPuzzleEntry";
import { getPositionPuzzleOutcome } from "./utils/getPositionPuzzleOutcome";
import { getPositionPuzzleRows } from "./utils/getPositionPuzzleRows";
import { usePositionPuzzleDescription } from "./utils/usePositionPuzzleDescription";

// The double axis puzzle: it shows how close the taker is to one archetype
// without saying which, and asks them to pick it out of three. The bar is
// true from the start - its length is the closeness of the closest archetype
// - and only the name, the image and the colour are held back. "Dalej" is
// there in every state: the guess can be passed over.
//
// A hit uncovers the archetype in place: its name over the bar, its image on
// the cap, the bar in the colour of its match band. A miss uncovers nothing,
// on purpose - the closest archetype is the headline of the result - so the
// card then differs from the asking one by its words alone. No archetype's
// own colour is shown anywhere, and the row that was picked is never marked.
//
// The guess is held here for as long as the card is on screen and goes
// nowhere else. Hit or miss is read from the card as it fired; nothing is
// ranked again.
//
// A card without exactly three named rows that include the leader, with a
// closeness under 50, or whose line cannot be finished, hands the frame
// nothing to draw, and the frame leaves by itself.
export const SurveyCheckpointPositionPuzzle = ({
  card,
  onReveal,
  onContinue,
  onOptOut,
}: CheckpointCardProps<"position-puzzle">) => {
  const { i18n } = useLingui();
  const { state, line, guess } = useCheckpointGuess(card, onReveal, onContinue);
  const description = usePositionPuzzleDescription(card, state);
  const canDraw = canDrawPositionPuzzle(card);
  const text = getCheckpointText(i18n, card, line);
  const statement = text?.statement ?? "";

  return (
    <SurveyCheckpoint
      visual={
        canDraw && (
          <SurveyCheckpointPositionPuzzleVisual
            name={state === "hit" ? card.leader.name : undefined}
            entry={getPositionPuzzleEntry(card, state)}
            description={description}
          />
        )
      }
      leadIn={text?.leadIn}
      statement={statement}
      options={
        state === "ask" &&
        canDraw && (
          <SurveyCheckpointOptions
            label={statement}
            options={getPositionPuzzleRows(card)}
            onSelect={(picked) => guess(getPositionPuzzleOutcome(card, picked))}
          />
        )
      }
      onContinue={onContinue}
      onOptOut={onOptOut}
    />
  );
};
