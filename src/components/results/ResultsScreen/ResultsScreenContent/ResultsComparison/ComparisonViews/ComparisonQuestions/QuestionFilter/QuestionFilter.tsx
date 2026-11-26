import { Switch } from "@gi-org-pl/athena";
import { Trans } from "@lingui/react/macro";
import { useId } from "react";

import { FILTER_SWITCH_CLASS_NAME } from "./QuestionFilter.constants";
import type { QuestionFilterProps } from "./QuestionFilter.types";

// The filter of the list of questions: a switch that keeps only the
// questions the two sides disagree on. It is named by the text beside it,
// and the text switches it too. It keeps nothing itself: whether it is on is
// up to whoever draws the list.
export const QuestionFilter = ({ isOn, onChange }: QuestionFilterProps) => {
  const switchId = useId();

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Switch
        id={switchId}
        checked={isOn}
        className={FILTER_SWITCH_CLASS_NAME}
        onCheckedChange={onChange}
      />
      <label
        htmlFor={switchId}
        className="min-w-0 cursor-pointer text-sm leading-none font-medium wrap-break-word text-gi-primary"
      >
        <Trans>Tylko niezgodność</Trans>
      </label>
    </div>
  );
};
