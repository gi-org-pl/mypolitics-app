import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { SurveyCheckpointPositionPuzzleVisualProps } from "./SurveyCheckpointPositionPuzzleVisual.types";

// What the position puzzle shows in the panel of the frame: the name of an
// archetype, or a blank shape where the name will be, and under it one
// one-sided bar. The bar carries no number and no marker and is described in
// words. It fills the width it is given.
//
// The name is plain text: it wraps and is never cut. It is not a paragraph,
// so that the text of the card stays the only one in the frame. The shape
// that stands in for it is decoration and is hidden from assistive
// technology.
//
// The name comes in softly when it replaces the shape, and at once for a
// taker who prefers reduced motion.
export const SurveyCheckpointPositionPuzzleVisual = ({
  name,
  entry,
  description,
}: SurveyCheckpointPositionPuzzleVisualProps) => {
  const shownName = toSingleLine(name);

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-2">
      {shownName === "" ? (
        <span
          aria-hidden="true"
          data-testid="survey-checkpoint-position-puzzle-placeholder"
          className="h-4 w-39 max-w-full rounded-2xl bg-gi-ash"
        />
      ) : (
        <div className="w-full text-left text-base leading-[1.2] font-bold wrap-break-word text-gi-primary transition-opacity duration-300 motion-reduce:transition-none starting:opacity-0">
          {shownName}
        </div>
      )}
      <UniversalAxis
        start={entry}
        marker={false}
        showValues={false}
        description={description}
      />
    </div>
  );
};
