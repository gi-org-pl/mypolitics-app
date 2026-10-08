import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";

import type { SurveyCheckpointAxisClosenessVisualProps } from "./SurveyCheckpointAxisClosenessVisual.types";

// What the axis closeness card shows in the panel of the frame: the name the
// card is about, and under it one bar. The bar carries no number and is
// described in words, and its sides are named under their caps only when
// there are two of them. It fills the width it is given.
//
// The title is plain text: it wraps and is never cut. It is not a paragraph,
// so that the text of the card stays the only one in the frame. One line of
// it takes 16 px, as the frame draws it; its lines are 20 px apart, so that
// the marks above the letters of one line stay clear of the line before, and
// the 2 px that adds above and below are taken back.
export const SurveyCheckpointAxisClosenessVisual = ({
  title,
  start,
  end,
  description,
}: SurveyCheckpointAxisClosenessVisualProps) => (
  <div className="flex w-full min-w-0 flex-col gap-2">
    <div className="-my-0.5 w-full text-left text-base leading-tight font-bold wrap-break-word text-gi-primary">
      {title}
    </div>
    <UniversalAxis
      start={start}
      end={end}
      showValues={false}
      showLabels={end !== undefined}
      description={description}
    />
  </div>
);
