import { Button } from "@gi-org-pl/athena";
import { Trans, useLingui } from "@lingui/react/macro";

import { toSingleLine } from "@/utils/text/toSingleLine";

import {
  CONTINUE_CLASS_NAME,
  OPT_OUT_CLASS_NAME,
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
      <SurveyCheckpointText
        leadIn={leadInText}
        statement={statementText}
        quote={quote}
        textRef={textRef}
      />
      {hasOptions && (
        <div className="flex w-full min-w-0 flex-col gap-2">{options}</div>
      )}
      {/* A card with no options has no other way forward: it keeps "Dalej". */}
      {(isContinueAvailable || !hasOptions) && (
        <Button
          type="ghost"
          variant="primary"
          className={CONTINUE_CLASS_NAME}
          onClick={requestContinue}
        >
          <Trans>Dalej</Trans>
        </Button>
      )}
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
