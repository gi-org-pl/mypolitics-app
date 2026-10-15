import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import closeIcon from "@/assets/icons/close.svg";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";

import { CARD_LAYOUT_CLASS_NAMES } from "./AuthCard.constants";
import type { AuthCardProps } from "./AuthCard.types";

// The card every sign-in screen is drawn in: an ash card with the heading and
// its line in a darker box at the top, like the e-mail card of the
// questionnaire. In a dialog the box also holds the round close button, and
// on a phone the card is a bottom sheet with a handle - a picture of one:
// the sheet is not dragged.
export const AuthCard = ({
  heading,
  description,
  headingLevel = 2,
  headingId,
  descriptionId,
  onClose,
  isCloseDisabled = false,
  layout = "card",
  children,
}: AuthCardProps) => {
  const { t } = useLingui();
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className="@container w-full min-w-0">
      <div
        className={`flex w-full min-w-0 flex-col gap-4 bg-gi-ash text-gi-primary ${CARD_LAYOUT_CLASS_NAMES[layout]}`}
      >
        {layout === "sheet-on-phone" && (
          <span
            aria-hidden="true"
            className="mx-auto block h-1 w-10 shrink-0 rounded-xs bg-gi-dark-ash md:hidden"
          />
        )}
        <div className="rounded-2xl bg-gi-dark-ash p-4">
          <div className="flex items-start gap-3">
            <Heading
              id={headingId}
              className="min-w-0 flex-1 text-2xl leading-9 font-bold wrap-break-word"
            >
              {heading}
            </Heading>
            {onClose && (
              <Button
                type="ghost"
                variant="primary"
                isIconButton
                aria-label={t`Zamknij`}
                disabled={isCloseDisabled}
                className={`size-8 shrink-0 bg-white text-gi-primary hover:bg-gi-ash data-[disabled=true]:bg-white data-[disabled=true]:opacity-40 ${FOCUS_CLASS_NAME}`}
                onClick={onClose}
              >
                <span
                  className={`${BUTTON_ICON_MASK_CLASS_NAME} size-3 mask-contain`}
                  style={getIconMaskStyle(closeIcon)}
                />
              </Button>
            )}
          </div>
          <p id={descriptionId} className="text-base leading-6 wrap-break-word">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};
