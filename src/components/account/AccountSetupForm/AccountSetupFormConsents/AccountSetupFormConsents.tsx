import { Checkbox } from "@gi-org-pl/athena";
import { Trans, useLingui } from "@lingui/react/macro";

import {
  CONSENT_CHECKBOX_CLASS_NAME,
  CONSENT_CLASS_NAME,
} from "@/constants/form";

import { TEXT_LINK_CLASS_NAME } from "@/constants/link";

import { MESSAGE_CLASS_NAME } from "./AccountSetupFormConsents.constants";
import type { AccountSetupFormConsentsProps } from "./AccountSetupFormConsents.types";

// The two declarations of the step, drawn like the consent of the e-mail
// card. The terms sentence holds two links; they stand outside the label, so
// pressing one never ticks the box, and the box is named by the whole
// sentence. A message under a box stands outside the sentence, so it is not
// part of the box's name, and is tied to the box as its description.
export const AccountSetupFormConsents = ({
  ids,
  isAgeDeclared,
  hasAcceptedTerms,
  ageMessage,
  termsMessage,
  isDisabled,
  termsHref,
  privacyHref,
  onAgeChange,
  onTermsChange,
}: AccountSetupFormConsentsProps) => {
  const { t } = useLingui();

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className={CONSENT_CLASS_NAME}>
          <Checkbox
            id={ids.age}
            label={t`Mam ukończone 16 lat.`}
            checked={isAgeDeclared}
            disabled={isDisabled}
            aria-invalid={ageMessage ? true : undefined}
            aria-describedby={ageMessage ? ids.ageMessage : undefined}
            className={CONSENT_CHECKBOX_CLASS_NAME}
            onCheckedChange={(isChecked) => onAgeChange(isChecked === true)}
          />
        </div>
        {ageMessage && (
          <p id={ids.ageMessage} className={MESSAGE_CLASS_NAME}>
            {ageMessage}
          </p>
        )}
      </div>
      <div>
        <div id={ids.termsSentence} className={CONSENT_CLASS_NAME}>
          <Checkbox
            id={ids.terms}
            label={t`Akceptuję`}
            checked={hasAcceptedTerms}
            disabled={isDisabled}
            aria-labelledby={ids.termsSentence}
            aria-invalid={termsMessage ? true : undefined}
            aria-describedby={termsMessage ? ids.termsMessage : undefined}
            className={CONSENT_CHECKBOX_CLASS_NAME}
            onCheckedChange={(isChecked) => onTermsChange(isChecked === true)}
          />{" "}
          <Trans>
            <a
              href={termsHref}
              target="_blank"
              rel="noopener noreferrer"
              className={TEXT_LINK_CLASS_NAME}
            >
              Regulamin
            </a>{" "}
            i{" "}
            <a
              href={privacyHref}
              target="_blank"
              rel="noopener noreferrer"
              className={TEXT_LINK_CLASS_NAME}
            >
              Politykę prywatności
            </a>
            .
          </Trans>
        </div>
        {termsMessage && (
          <p id={ids.termsMessage} className={MESSAGE_CLASS_NAME}>
            {termsMessage}
          </p>
        )}
      </div>
    </div>
  );
};
