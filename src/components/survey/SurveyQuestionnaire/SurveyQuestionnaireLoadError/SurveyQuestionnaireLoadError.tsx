import { Button } from "@gi-org-pl/athena";
import { Trans } from "@lingui/react/macro";

import { TALL_BUTTON_CLASS_NAME } from "@/constants/button";

import { NOTICE_CLASS_NAME } from "../SurveyQuestionnaire.constants";
import type { SurveyQuestionnaireLoadErrorProps } from "./SurveyQuestionnaireLoadError.types";

// The quiz could not be read. The card is announced when it appears.
export const SurveyQuestionnaireLoadError = ({
  onRetry,
}: SurveyQuestionnaireLoadErrorProps) => (
  <div role="alert" className={NOTICE_CLASS_NAME}>
    <div className="flex w-full flex-col gap-2">
      <h1 className="text-lg leading-[21px] font-bold">
        <Trans>Nie udało się wczytać quizu</Trans>
      </h1>
      <p>
        <Trans>Sprawdź połączenie z internetem i spróbuj ponownie.</Trans>
      </p>
    </div>
    <Button
      type="primary"
      variant="primary"
      onClick={onRetry}
      className={TALL_BUTTON_CLASS_NAME}
    >
      <Trans>Spróbuj ponownie</Trans>
    </Button>
  </div>
);
