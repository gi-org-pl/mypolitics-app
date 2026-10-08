import { useLingui } from "@lingui/react/macro";

import { TraitPill } from "@/components/shared/TraitPill/TraitPill";
import { SurveyCheckpoint } from "@/components/survey/SurveyCheckpoint/SurveyCheckpoint";
import type { CheckpointCardProps } from "@/types/checkpoint";
import { getCheckpointText } from "@/utils/checkpoint/getCheckpointText";

// The new trait card: the trait the taker's answers have earned for good, on
// the pill the result will show it on, and the line the engine drew, which
// names the trait. It is the frame filled from the card alone: one pill for
// a trait the taker holds - no avatar, no hatching - and the two texts. The
// card is frozen when it fires and takes no input, so nothing here changes
// while it is up.
//
// The pill comes before the paragraph and its name is text; the statement
// carries the name too, so nothing depends on seeing the pill. A card whose
// text cannot be built - a trait without a name, a line that does not exist -
// hands the frame nothing to draw, and the frame leaves by itself.
export const SurveyCheckpointNewTrait = ({
  card,
  onContinue,
  onOptOut,
}: CheckpointCardProps<"new-trait">) => {
  const { i18n } = useLingui();
  const text = getCheckpointText(i18n, card);

  return (
    <SurveyCheckpoint
      visual={text && <TraitPill orientation={card.trait} />}
      leadIn={text?.leadIn}
      statement={text?.statement ?? ""}
      onContinue={onContinue}
      onOptOut={onOptOut}
    />
  );
};
