import { Button } from "@gi-org-pl/athena";
import { Trans, useLingui } from "@lingui/react/macro";

import playIcon from "@/assets/icons/play.svg";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { withoutPropagation } from "@/utils/event/withoutPropagation";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";

import {
  FORCED_COLORS_BORDER_CLASS_NAME,
  LIGHT_BUTTON_CLASS_NAME,
  START_TEXT_BUTTON_CLASS_NAME,
  START_TEXT_CLASS_NAME,
} from "./QuizCardPlayButton.constants";
import type { QuizCardPlayButtonProps } from "./QuizCardPlayButton.types";

export const QuizCardPlayButton = ({
  isLight,
  isShowStartText,
  isLoading,
  onClick,
}: QuizCardPlayButtonProps) => {
  const { t } = useLingui();

  return (
    <Button
      type="primary"
      variant="primary"
      isIconButton={!isShowStartText}
      isLoading={isLoading}
      className={`size-12 ${FORCED_COLORS_BORDER_CLASS_NAME} ${FOCUS_CLASS_NAME} ${
        isLight ? LIGHT_BUTTON_CLASS_NAME : ""
      } ${isShowStartText ? START_TEXT_BUTTON_CLASS_NAME : ""}`}
      aria-label={t`Rozpocznij quiz`}
      RightIcon={
        <span
          className={`${BUTTON_ICON_MASK_CLASS_NAME} h-4 w-3.5 mask-contain`}
          style={getIconMaskStyle(playIcon)}
        />
      }
      onClick={withoutPropagation(onClick)}
    >
      {isShowStartText && (
        <span className={START_TEXT_CLASS_NAME}>
          <Trans>Rozpocznij</Trans>
        </span>
      )}
    </Button>
  );
};
