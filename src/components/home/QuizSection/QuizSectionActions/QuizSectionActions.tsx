import { Button } from "@gi-org-pl/athena";
import { Trans } from "@lingui/react/macro";

import pencilRulerIcon from "@/assets/icons/pencil-ruler.svg";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";

import {
  ACTION_CLASS_NAME,
  FORCED_COLORS_BORDER_CLASS_NAME,
} from "./QuizSectionActions.constants";
import type { QuizSectionActionsProps } from "./QuizSectionActions.types";

export const QuizSectionActions = ({
  onShowMore,
  onCreate,
}: QuizSectionActionsProps) => (
  <div className="flex flex-wrap gap-2">
    <Button
      type="outlined"
      variant="primary"
      className={`${ACTION_CLASS_NAME} ${FOCUS_CLASS_NAME}`}
      onClick={onShowMore}
    >
      <Trans>Zobacz więcej</Trans>
    </Button>

    <Button
      type="primary"
      variant="primary"
      className={`${ACTION_CLASS_NAME} ${FORCED_COLORS_BORDER_CLASS_NAME} ${FOCUS_CLASS_NAME}`}
      LeftIcon={
        <span
          className={`${BUTTON_ICON_MASK_CLASS_NAME} size-4 mask-contain`}
          style={getIconMaskStyle(pencilRulerIcon)}
        />
      }
      onClick={onCreate}
    >
      <Trans>Stwórz własny</Trans>
    </Button>
  </div>
);
