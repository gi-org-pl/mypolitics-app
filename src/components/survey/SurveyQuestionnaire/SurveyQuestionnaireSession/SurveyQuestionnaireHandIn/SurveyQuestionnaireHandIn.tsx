import { Button } from "@gi-org-pl/athena";
import { Trans } from "@lingui/react/macro";

import { TALL_BUTTON_CLASS_NAME } from "@/constants/button";
import { NOTICE_CARD_CLASS_NAME } from "@/constants/notice";
import type { SurveyPhaseContentProps } from "@/types/survey";

import { useHandIn } from "./utils/useHandIn";

// The stand-in for results calculation: it hands the session in and leaves
// for the results. It is not in the design, and `survey-results-calculation`
// replaces it as a whole with the loader.
export const SurveyQuestionnaireHandIn = (props: SurveyPhaseContentProps) => {
  const { hasFailed, retry } = useHandIn(props);

  if (!hasFailed) {
    return (
      <p role="status" className={`${NOTICE_CARD_CLASS_NAME} font-bold`}>
        <Trans>Liczymy Twoje wyniki</Trans>
      </p>
    );
  }

  return (
    <div role="alert" className={NOTICE_CARD_CLASS_NAME}>
      <p>
        <Trans>
          Nie udało się zapisać Twoich odpowiedzi. Sprawdź połączenie i spróbuj
          ponownie.
        </Trans>
      </p>
      <Button
        type="primary"
        variant="primary"
        onClick={retry}
        className={TALL_BUTTON_CLASS_NAME}
      >
        <Trans>Spróbuj ponownie</Trans>
      </Button>
    </div>
  );
};
