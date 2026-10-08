import { toTrimmedText } from "@/utils/text/toTrimmedText";

import type { SurveyQuestionProps } from "./SurveyQuestion.types";
import { SurveyQuestionExplanation } from "./SurveyQuestionExplanation/SurveyQuestionExplanation";
import { SurveyQuestionStatement } from "./SurveyQuestionStatement/SurveyQuestionStatement";

export const SurveyQuestion = ({
  question,
  explanation,
}: SurveyQuestionProps) => {
  const statement = toTrimmedText(question);
  const explanationText = toTrimmedText(explanation);

  if (!statement) return null;

  return (
    <div className="flex w-full flex-col">
      <SurveyQuestionStatement statement={statement} />
      {explanationText && (
        <SurveyQuestionExplanation
          key={JSON.stringify([statement, explanationText])}
          explanation={explanationText}
        />
      )}
    </div>
  );
};
