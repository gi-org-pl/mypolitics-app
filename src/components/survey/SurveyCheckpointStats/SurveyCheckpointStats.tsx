import { useLingui } from "@lingui/react/macro";

import { SurveyCheckpoint } from "@/components/survey/SurveyCheckpoint/SurveyCheckpoint";
import type { CheckpointCardProps } from "@/types/checkpoint";
import { getCheckpointSlots } from "@/utils/checkpoint/getCheckpointSlots";
import { getCheckpointText } from "@/utils/checkpoint/getCheckpointText";

import { SurveyCheckpointStatsChart } from "./SurveyCheckpointStatsChart/SurveyCheckpointStatsChart";
import { getStatsQuote } from "./utils/getStatsQuote";
import { useStatsDescription } from "./utils/useStatsDescription";
import { useStatsSliceNames } from "./utils/useStatsSliceNames";

// The stats chart card: how everyone answered the thesis the taker just
// answered, as a pie of three slices with its legend, and the line the engine
// drew for the taker's side, which quotes the thesis. It is the frame filled
// from the card alone: the card is frozen when it fires and holds its own
// three totals and its percent, so nothing here reads a source and nothing
// changes while it is up.
//
// The one number on the card is in the statement. The pie is one image whose
// description gives the three shares in words, and the thesis is marked as a
// quotation, so it is not read as the product's own words. A card whose
// counts cannot be drawn or whose text cannot be built hands the frame
// nothing to draw, and the frame leaves by itself.
export const SurveyCheckpointStats = ({
  card,
  onContinue,
  onOptOut,
}: CheckpointCardProps<"stats">) => {
  const { i18n } = useLingui();
  const names = useStatsSliceNames();
  const description = useStatsDescription(card);
  const text = getCheckpointText(i18n, card);
  const thesis = getCheckpointSlots(card, card.line.pool)?.thesis;

  return (
    <SurveyCheckpoint
      visual={
        description !== undefined && (
          <SurveyCheckpointStatsChart
            counts={card.counts}
            description={description}
            names={names}
          />
        )
      }
      leadIn={text?.leadIn}
      statement={text?.statement ?? ""}
      quote={getStatsQuote(text?.statement, String(thesis ?? ""))}
      onContinue={onContinue}
      onOptOut={onOptOut}
    />
  );
};
