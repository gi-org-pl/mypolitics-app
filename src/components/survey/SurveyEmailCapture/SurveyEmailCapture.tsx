import { Button } from "@gi-org-pl/athena";
import { Trans, useLingui } from "@lingui/react/macro";
import { useId } from "react";

import { isEmailAddress } from "@/utils/text/isEmailAddress";

import {
  SKIP_CLASS_NAME,
  SUBMIT_CLASS_NAME,
} from "./SurveyEmailCapture.constants";
import type { SurveyEmailCaptureProps } from "./SurveyEmailCapture.types";
import { SurveyEmailCaptureConsent } from "./SurveyEmailCaptureConsent/SurveyEmailCaptureConsent";
import { SurveyEmailCaptureField } from "./SurveyEmailCaptureField/SurveyEmailCaptureField";

// The e-mail card: it offers the link to the results by e-mail. It collects
// an address and a consent and makes no request, so it has no waiting state
// and no failed state, and never says that a link was sent.
//
// There is one button in every state. It is the same element with another
// name, so focus stays on it and assistive technology reads the new name.
export const SurveyEmailCapture = ({
  address,
  hasConsent,
  privacyPolicyHref,
  onAddressChange,
  onConsentChange,
  onSubmit,
  onSkip,
}: SurveyEmailCaptureProps) => {
  const { t } = useLingui();
  const promiseId = useId();
  const isAddressValid = isEmailAddress(address);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="rounded-2xl bg-gi-dark-ash p-4 text-gi-primary">
        <h2 className="text-2xl leading-9 font-bold wrap-break-word">
          <Trans>Zapisz swoje wyniki!</Trans>
        </h2>
        <p className="text-base leading-6 wrap-break-word">
          <Trans>
            Wyślemy na Twój e-mail link do wyników, dzięki czemu łatwo do nich
            wrócisz.
          </Trans>
        </p>
      </div>
      <SurveyEmailCaptureField
        address={address}
        descriptionId={promiseId}
        onAddressChange={onAddressChange}
        onSubmit={onSubmit}
      />
      <SurveyEmailCaptureConsent
        hasConsent={hasConsent}
        privacyPolicyHref={privacyPolicyHref}
        promiseId={promiseId}
        onConsentChange={onConsentChange}
      />
      <Button
        type={isAddressValid ? "primary" : "ghost"}
        variant="primary"
        className={isAddressValid ? SUBMIT_CLASS_NAME : SKIP_CLASS_NAME}
        onClick={() => (isAddressValid ? onSubmit(address.trim()) : onSkip())}
      >
        {isAddressValid ? t`Wyślij i zobacz wyniki` : t`Pomiń`}
      </Button>
    </div>
  );
};
