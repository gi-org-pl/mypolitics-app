import { msg } from "@lingui/core/macro";

import type {
  ResultsCalculationMessage,
  ResultsCalculationMessageState,
} from "./SurveyResultsCalculation.types";

const RETRY_LABEL = msg`Spróbuj ponownie`;

// What the field says in each state that is not a run. A failure offers
// another try; the notice only leads on to the results.
export const RESULTS_CALCULATION_MESSAGES: Record<
  ResultsCalculationMessageState,
  ResultsCalculationMessage
> = {
  "failed-not-saved": {
    text: msg`Nie udało się zapisać Twoich odpowiedzi. Sprawdź połączenie i spróbuj ponownie.`,
    actionLabel: RETRY_LABEL,
  },
  "failed-not-ready": {
    text: msg`Liczenie wyników trwa dłużej niż zwykle. Twoje odpowiedzi są zapisane. Spróbuj ponownie za chwilę.`,
    actionLabel: RETRY_LABEL,
  },
  "link-not-sent": {
    text: msg`Nie udało się wysłać linku na Twój e-mail. Twoje wyniki są gotowe. Zapisz adres strony z wynikami, żeby móc do nich wrócić.`,
    actionLabel: msg`Zobacz wyniki`,
  },
};
