import { Input } from "@gi-org-pl/athena";
import { Trans, useLingui } from "@lingui/react/macro";

import { isEnterPress } from "@/utils/event/isEnterPress";
import { isEmailAddress } from "@/utils/text/isEmailAddress";

import { useEmailHint } from "../utils/useEmailHint";
import { FIELD_CLASS_NAME } from "./SurveyEmailCaptureField.constants";
import type { SurveyEmailCaptureFieldProps } from "./SurveyEmailCaptureField.types";

// The e-mail field and its hint. The field is never focused by the card, so a
// phone keyboard does not cover what stands under it. It is an e-mail field
// for the browser - the saved address is offered, a phone shows the e-mail
// keyboard - and no form, so the browser's own validation message never
// shows: the hint is the only one.
//
// Athena's Input describes the input with its own helper and nothing else,
// so the description from outside is given to a group around the field. The
// hint is an alert: it is announced when it appears.
export const SurveyEmailCaptureField = ({
  address,
  descriptionId,
  onAddressChange,
  onSubmit,
}: SurveyEmailCaptureFieldProps) => {
  const { t } = useLingui();
  const { isHintShown, showHint } = useEmailHint(address);

  return (
    <div role="group" aria-describedby={descriptionId} className="w-full">
      <Input
        type="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        aria-label={t`Adres e-mail`}
        placeholder={t`twoj@mail.com`}
        value={address}
        helper={
          isHintShown ? (
            <span role="alert" className="block px-4 text-gi-primary">
              <Trans>
                Wpisz pełny adres e-mail, na przykład twoj@mail.com.
              </Trans>
            </span>
          ) : undefined
        }
        className={FIELD_CLASS_NAME}
        onChange={onAddressChange}
        onBlur={showHint}
        onKeyDown={(event) => {
          if (!isEnterPress(event)) return;

          if (isEmailAddress(address)) {
            onSubmit(address.trim());
          } else {
            showHint();
          }
        }}
      />
    </div>
  );
};
