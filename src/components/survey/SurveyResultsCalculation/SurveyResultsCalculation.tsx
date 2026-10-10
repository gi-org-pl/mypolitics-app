import { useLingui } from "@lingui/react/macro";

import { withKeys } from "@/utils/array/withKeys";

import { RESULTS_CALCULATION_MESSAGES } from "./SurveyResultsCalculation.constants";
import type { SurveyResultsCalculationProps } from "./SurveyResultsCalculation.types";
import { SurveyResultsCalculationActions } from "./SurveyResultsCalculationActions/SurveyResultsCalculationActions";
import { SurveyResultsCalculationField } from "./SurveyResultsCalculationField/SurveyResultsCalculationField";
import { SurveyResultsCalculationLine } from "./SurveyResultsCalculationLine/SurveyResultsCalculationLine";
import { SurveyResultsCalculationMessage } from "./SurveyResultsCalculationMessage/SurveyResultsCalculationMessage";

// The loader card: the field of rings, and under it the two result actions,
// which never work here. During a run the lines stand on the field, stacked
// from the top, the last one current, and the rings move. In every other
// state the rings are still and a message with its one button takes the place
// of the lines: no line is ever on screen next to a message.
//
// It draws what it is told: it holds no timer, makes no request and knows no
// session. The wait is announced once, when it starts. The lines are not: the
// stack is not a live region, because a handful of lines read aloud in ten
// seconds would talk over each other.
export const SurveyResultsCalculation = ({
  state,
  lines,
  onRetry,
  onSeeResults,
}: SurveyResultsCalculationProps) => {
  const { i18n, t } = useLingui();
  const message =
    state === "running" ? undefined : RESULTS_CALCULATION_MESSAGES[state];

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-4">
      <p role="status" className="sr-only">
        {message === undefined && t`Liczymy Twoje wyniki`}
      </p>
      <SurveyResultsCalculationField isMoving={message === undefined}>
        {message === undefined && lines.length > 0 && (
          <ul className="flex w-full flex-col items-center gap-4">
            {withKeys(lines, (line) => line).map(({ item, key }, index) => (
              <SurveyResultsCalculationLine
                key={key}
                text={item}
                isCurrent={index === lines.length - 1}
              />
            ))}
          </ul>
        )}
        {message !== undefined && (
          <SurveyResultsCalculationMessage
            key={state}
            text={i18n._(message.text)}
            actionLabel={i18n._(message.actionLabel)}
            onAction={state === "link-not-sent" ? onSeeResults : onRetry}
          />
        )}
      </SurveyResultsCalculationField>
      <SurveyResultsCalculationActions />
    </div>
  );
};
