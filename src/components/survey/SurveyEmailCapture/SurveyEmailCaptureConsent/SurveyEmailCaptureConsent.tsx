import { Checkbox } from "@gi-org-pl/athena";
import { Trans, useLingui } from "@lingui/react/macro";

import {
  CHECKBOX_CLASS_NAME,
  CONSENT_CLASS_NAME,
} from "./SurveyEmailCaptureConsent.constants";
import type { SurveyEmailCaptureConsentProps } from "./SurveyEmailCaptureConsent.types";

// The optional consent to marketing content, the link to the privacy policy
// and the promise of the card.
//
// The link is not part of the label: pressing it never toggles the box. The
// promise is not part of the consent either: it belongs to the whole card and
// describes the e-mail field, which finds it by `promiseId`.
//
// The consent sentence is named by EMAIL_CONSENT_WORDING: whoever changes the
// sentence changes that identifier in the same commit.
export const SurveyEmailCaptureConsent = ({
  hasConsent,
  privacyPolicyHref,
  promiseId,
  onConsentChange,
}: SurveyEmailCaptureConsentProps) => {
  const { t } = useLingui();

  return (
    <div className={CONSENT_CLASS_NAME}>
      <Checkbox
        label={t`Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja.`}
        checked={hasConsent}
        className={CHECKBOX_CLASS_NAME}
        onCheckedChange={(isChecked) => onConsentChange(isChecked === true)}
      />{" "}
      <a
        href={privacyPolicyHref}
        target="_blank"
        rel="noopener noreferrer"
        className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-primary"
      >
        <Trans>Polityka prywatności.</Trans>
      </a>
      <p id={promiseId} className="mt-[1.2em] italic">
        <Trans>
          Dbamy o Twoją prywatność, Twoje dane osobowe (w tym adres e-mail)
          nigdy nie będą powiązane z danymi o Twoich poglądach.
        </Trans>
      </p>
    </div>
  );
};
