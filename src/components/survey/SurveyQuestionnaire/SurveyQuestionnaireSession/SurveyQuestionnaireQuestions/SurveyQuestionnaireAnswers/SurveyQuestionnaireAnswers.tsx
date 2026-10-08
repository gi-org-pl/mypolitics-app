import { Button } from "@gi-org-pl/athena";
import { Trans } from "@lingui/react/macro";

import { SurveyAnswer } from "@/components/survey/SurveyAnswer/SurveyAnswer";

import type { SurveyQuestionnaireAnswersProps } from "../../../SurveyQuestionnaire.types";
import { SKIP_CLASS_NAME } from "./SurveyQuestionnaireAnswers.constants";
import { isButtonPress } from "./utils/isButtonPress";
import { useAnswersToDraw } from "./utils/useAnswersToDraw";

// The answers of a question, as a group named by its statement, and "Pomiń"
// under the last one. An answer reports its press only when its
// acknowledgement has played, so the press is caught here, on the group, at
// the moment it happens. An answer of a question is never drawn disabled and
// never drawn selected.
export const SurveyQuestionnaireAnswers = ({
  question,
  onPress,
  onAnswer,
  onSkip,
}: SurveyQuestionnaireAnswersProps) => {
  const answers = useAnswersToDraw(question);

  return (
    <div className="flex w-full flex-col gap-4">
      <div
        role="group"
        aria-label={question.text}
        onClick={(event) => isButtonPress(event) && onPress()}
        className="flex w-full flex-col gap-2"
      >
        {answers.map(({ id, label, kind }) => (
          <SurveyAnswer
            key={id}
            title={label}
            type={kind}
            onClick={() => onAnswer(id)}
          />
        ))}
      </div>
      <Button
        type="ghost"
        variant="primary"
        onClick={onSkip}
        className={SKIP_CLASS_NAME}
      >
        <Trans>Pomiń</Trans>
      </Button>
    </div>
  );
};
