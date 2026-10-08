import { useLingui } from "@lingui/react/macro";

import { CompassMap } from "@/components/shared/CompassMap/CompassMap";
import { SurveyCheckpoint } from "@/components/survey/SurveyCheckpoint/SurveyCheckpoint";
import { DEFAULT_COMPASS_QUADRANTS } from "@/constants/results";
import type { CheckpointCardProps } from "@/types/checkpoint";
import { getCheckpointText } from "@/utils/checkpoint/getCheckpointText";

import { getPathPosition } from "./utils/getPathPosition";
import { useNolanPathDescription } from "./utils/useNolanPathDescription";

// The Nolan chart path card: the compass with the route the taker's position
// has travelled as a dotted line, the dot where they stand now, and the line
// the engine drew, which counts the quadrants. It is the frame filled from
// the card alone: the card is frozen when it fires, so nothing here changes
// while it is up, and nothing is computed - the trail is drawn as it is
// given, the dot is its last point, and the count is the card's.
//
// The map is one image and names no quadrant: the card counts quadrants and
// says which one nowhere. It is as large as it is in the design and shrinks
// with the card. A card without a place to put the dot or without a text
// hands the frame nothing to draw, and the frame leaves by itself.
export const SurveyCheckpointNolanPath = ({
  card,
  onContinue,
  onOptOut,
}: CheckpointCardProps<"nolan-path">) => {
  const { i18n } = useLingui();
  const position = getPathPosition(card.trail);
  const description = useNolanPathDescription(card);
  const text = getCheckpointText(i18n, card);

  return (
    <SurveyCheckpoint
      visual={
        position && (
          <div className="w-full max-w-61.25">
            <CompassMap
              quadrants={DEFAULT_COMPASS_QUADRANTS}
              trail={card.trail}
              position={position}
              description={description}
            />
          </div>
        )
      }
      leadIn={text?.leadIn}
      statement={text?.statement ?? ""}
      onContinue={onContinue}
      onOptOut={onOptOut}
    />
  );
};
