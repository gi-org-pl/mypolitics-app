import { Trans, useLingui } from "@lingui/react/macro";

import { SurveyCheckpoint } from "@/components/survey/SurveyCheckpoint/SurveyCheckpoint";
import type { CheckpointCardProps } from "@/types/checkpoint";
import { getCheckpointText } from "@/utils/checkpoint/getCheckpointText";

import { getHalfwayPercent } from "./utils/getHalfwayPercent";

// The halfway through card: the progress at the midpoint as a large number,
// and the line the engine drew, which says how many minutes the rest will
// take. It is the frame filled from the card alone: the card is frozen when it
// fires, so nothing here changes while it is up, and nothing is computed -
// the percent and the minutes are the card's.
//
// The number is plain text and comes before the paragraph, so it is read
// once, ahead of the lead-in and the statement. A card without a usable
// percent or without a text hands the frame nothing to draw, and the frame
// leaves by itself.
export const SurveyCheckpointHalfway = ({
  card,
  onContinue,
  onOptOut,
}: CheckpointCardProps<"halfway">) => {
  const { i18n } = useLingui();
  const percent = getHalfwayPercent(card);
  const text = getCheckpointText(i18n, card);

  return (
    <SurveyCheckpoint
      visual={
        percent !== undefined && (
          <span className="text-5xl leading-none font-bold text-gi-primary">
            <Trans>{percent}%</Trans>
          </span>
        )
      }
      leadIn={text?.leadIn}
      statement={text?.statement ?? ""}
      onContinue={onContinue}
      onOptOut={onOptOut}
    />
  );
};
