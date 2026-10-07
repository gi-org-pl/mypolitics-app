import { useLingui } from "@lingui/react";

import { withKeys } from "@/utils/array/withKeys";

import { EMPHASISED_PHRASES } from "../SurveyQuestion.constants";
import type { SurveyQuestionStatementProps } from "./SurveyQuestionStatement.types";
import { splitByPhrases } from "./utils/splitByPhrases";

export const SurveyQuestionStatement = ({
  statement,
}: SurveyQuestionStatementProps) => {
  const { i18n } = useLingui();
  const parts = splitByPhrases(
    statement,
    EMPHASISED_PHRASES.map((phrase) => i18n._(phrase)),
  );

  return (
    <p className="w-full rounded-3xl bg-gi-light-primary px-4 py-8 text-left text-lg leading-[21px] font-bold wrap-break-word text-white">
      {withKeys(parts, (part) => part.text).map(({ item, key }) => (
        <span key={key} className={item.isMatched ? "underline" : undefined}>
          {item.text}
        </span>
      ))}
    </p>
  );
};
