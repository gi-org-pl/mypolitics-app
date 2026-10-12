import { useLingui } from "@lingui/react/macro";

import { SurveyCheckpoint } from "@/components/survey/SurveyCheckpoint/SurveyCheckpoint";
import type { CheckpointCardProps } from "@/types/checkpoint";
import { getCheckpointText } from "@/utils/checkpoint/lines/getCheckpointText";

import { SurveyCheckpointAxisClosenessVisual } from "./SurveyCheckpointAxisClosenessVisual/SurveyCheckpointAxisClosenessVisual";
import { getAxisClosenessBar } from "./utils/getAxisClosenessBar";
import { useAxisClosenessDescription } from "./utils/useAxisClosenessDescription";

// The axis closeness card: it tells the taker where they already stand on one
// axis - that their score for one orientation is high, or which side of a
// pair is ahead. It fills the frame with a title and one bar without numbers,
// and with the line the engine drew. It is passive: it shows the reading of
// the boundary it fired at, takes no input and reads nothing but its card.
//
// A card whose title name is missing, or whose line cannot be finished, hands
// the frame nothing to draw, and the frame leaves by itself.
export const SurveyCheckpointAxisCloseness = ({
  card,
  onContinue,
  onOptOut,
}: CheckpointCardProps<"axis-closeness">) => {
  const { i18n } = useLingui();
  const bar = getAxisClosenessBar(card);
  const description = useAxisClosenessDescription(card);
  const text = getCheckpointText(i18n, card);

  return (
    <SurveyCheckpoint
      visual={
        bar && (
          <SurveyCheckpointAxisClosenessVisual
            {...bar}
            description={description}
          />
        )
      }
      leadIn={text?.leadIn}
      statement={text?.statement ?? ""}
      onContinue={onContinue}
      onOptOut={onOptOut}
    />
  );
};
