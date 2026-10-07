import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { withoutPropagation } from "@/utils/event/withoutPropagation";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";

import { TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME } from "../../QuizCard.constants";
import { TOGGLE_ICON_OPEN_CLASS_NAME } from "./QuizCardToggle.constants";
import type { QuizCardToggleProps } from "./QuizCardToggle.types";

export const QuizCardToggle = ({
  bodyId,
  isOpen,
  isHiddenOnWideScreen,
  onToggle,
}: QuizCardToggleProps) => {
  const { t } = useLingui();

  return (
    <Button
      type="outlined"
      variant="primary"
      isIconButton
      className={`size-12 hover:bg-gi-primary/10 ${FOCUS_CLASS_NAME} ${
        isHiddenOnWideScreen ? TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME : ""
      }`}
      aria-label={isOpen ? t`Zwiń` : t`Rozwiń`}
      aria-expanded={isOpen}
      aria-controls={bodyId}
      onClick={withoutPropagation(onToggle)}
    >
      <span
        className={`${BUTTON_ICON_MASK_CLASS_NAME} h-2 w-3.5 mask-contain transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          isOpen ? TOGGLE_ICON_OPEN_CLASS_NAME : ""
        }`}
        style={getIconMaskStyle(chevronDownIcon)}
      />
    </Button>
  );
};
