import { useLingui } from "@lingui/react/macro";

import cardQuestionIcon from "@/assets/icons/card-question.svg";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";

import { NUMBER_ANIMATION_MS } from "../../SurveyControls.constants";
import type { SurveyControlsCountProps } from "../../SurveyControls.types";
import {
  NUMBER_CLASS_NAME,
  NUMBER_ENTER_CLASS_NAME,
  NUMBER_LEAVE_CLASS_NAME,
  PILL_ICON_CLASS_NAME,
} from "./SurveyControlsCount.constants";
import { useNumberRoll } from "./utils/useNumberRoll";

export const SurveyControlsCount = ({ count }: SurveyControlsCountProps) => {
  const { t } = useLingui();
  const { value, previousValue, direction } = useNumberRoll(count);
  const isRolling = previousValue !== undefined;

  return (
    <span className="flex shrink-0 items-center gap-1">
      <span
        aria-hidden="true"
        className={`${PILL_ICON_CLASS_NAME} h-5.25 w-[23.16px]`}
        style={getIconMaskStyle(cardQuestionIcon)}
      />
      <span className="sr-only">{t`Pozostałe pytania w kategorii: ${count}`}</span>
      <span aria-hidden="true" className="grid">
        {isRolling && (
          <span
            key={previousValue}
            style={{ transitionDuration: `${NUMBER_ANIMATION_MS}ms` }}
            className={`${NUMBER_CLASS_NAME} ${NUMBER_LEAVE_CLASS_NAME[direction]}`}
          >
            {previousValue}
          </span>
        )}
        <span
          key={value}
          style={{ transitionDuration: `${NUMBER_ANIMATION_MS}ms` }}
          className={`${NUMBER_CLASS_NAME} ${isRolling ? NUMBER_ENTER_CLASS_NAME[direction] : ""}`}
        >
          {value}
        </span>
      </span>
    </span>
  );
};
