import { Button } from "@gi-org-pl/athena";
import { Trans, useLingui } from "@lingui/react/macro";

import { AnimatedHeight } from "@/components/shared/AnimatedHeight/AnimatedHeight";
import { toSingleLine } from "@/utils/text/toSingleLine";

import {
  BODY_CLASS_NAME,
  CONTINUE_CLASS_NAME,
  CONTINUE_ROW_CLASS_NAME,
  OPT_OUT_CLASS_NAME,
  OPTIONS_CLASS_NAME,
} from "./SurveyCheckpoint.constants";
import type { SurveyCheckpointProps } from "./SurveyCheckpoint.types";
import { SurveyCheckpointText } from "./SurveyCheckpointText/SurveyCheckpointText";
import { hasContent } from "./utils/hasContent";
import { useCheckpointActions } from "./utils/useCheckpointActions";
import { useTextFocus } from "./utils/useTextFocus";

// The frame every checkpoint card is drawn in: the visual in its panel, one
// paragraph of text, the options of a puzzle, "Dalej" and "Wyłącz
// checkpointy". It knows nothing of card types: it draws what it is given and
// reports which button was pressed, once.
//
// It is part of the page and not a dialog: it covers nothing, holds no focus
// inside itself and does not close on Escape or by itself. A card without a
// visual or without a statement is not drawn and leaves by asking to
// continue.
//
// A card may change in place - a puzzle reveals its answer: the line changes,
// the options go and "Dalej" comes, or stays when it was there already. Each
// of the three stands in a box of its own that moves its height, so what is
// under a part that changes - "Dalej" under the options, "Wyłącz checkpointy"
// under all of them - moves with it instead of jumping. The gap above the
// options and above "Dalej" is inside their boxes, so a part that is not
// there takes no room. The frame animates nothing by itself: the card as a
// whole arrives and leaves with the content of the screen.
//
// The dashes of the panel are 8 px long and 8 px apart, which a CSS border
// cannot be told, so the outline is a rectangle drawn over the panel, and the
// 1 px it takes is part of the panel's 17 px padding.
export const SurveyCheckpoint = ({
  visual,
  leadIn,
  statement,
  quote,
  options,
  isContinueAvailable = true,
  onContinue,
  onOptOut,
}: SurveyCheckpointProps) => {
  const { t } = useLingui();
  const leadInText = toSingleLine(leadIn);
  const statementText = toSingleLine(statement);
  const canDraw = hasContent(visual) && statementText !== "";
  const hasOptions = hasContent(options);
  const { requestContinue, requestOptOut } = useCheckpointActions({
    canDraw,
    onContinue,
    onOptOut,
  });
  const textRef = useTextFocus(`${leadInText}\n${statementText}`);

  if (!canDraw) return null;

  return (
    <section
      aria-label={t`Checkpoint`}
      className="flex w-full min-w-0 flex-col gap-4"
    >
      <div className="relative flex w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-background p-4.25">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full fill-none stroke-gi-ash"
        >
          <rect
            x="0.5"
            y="0.5"
            rx="15.5"
            strokeDasharray="8 8"
            className="h-[calc(100%-1px)] w-[calc(100%-1px)]"
          />
        </svg>
        {visual}
      </div>
      <div className={BODY_CLASS_NAME}>
        <AnimatedHeight>
          <SurveyCheckpointText
            leadIn={leadInText}
            statement={statementText}
            quote={quote}
            textRef={textRef}
          />
        </AnimatedHeight>
        <AnimatedHeight>
          {hasOptions && <div className={OPTIONS_CLASS_NAME}>{options}</div>}
        </AnimatedHeight>
        <AnimatedHeight>
          {/* A card with no options has no other way forward: it keeps "Dalej". */}
          {(isContinueAvailable || !hasOptions) && (
            <div className={CONTINUE_ROW_CLASS_NAME}>
              <Button
                type="ghost"
                variant="primary"
                className={CONTINUE_CLASS_NAME}
                onClick={requestContinue}
              >
                <Trans>Dalej</Trans>
              </Button>
            </div>
          )}
        </AnimatedHeight>
      </div>
      <Button
        type="ghost"
        variant="primary"
        className={OPT_OUT_CLASS_NAME}
        onClick={requestOptOut}
      >
        <Trans>Wyłącz checkpointy</Trans>
      </Button>
    </section>
  );
};
