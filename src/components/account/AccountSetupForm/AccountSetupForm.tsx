import { Button, Input } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import {
  QUIET_BUTTON_CLASS_NAME,
  TALL_BUTTON_CLASS_NAME,
} from "@/constants/button";
import { TEXT_FIELD_CLASS_NAME } from "@/constants/form";

import { AuthCard } from "../AuthCard/AuthCard";
import {
  CANCEL_CLASS_NAME,
  DONE_CLASS_NAME,
  LABEL_CLASS_NAME,
  SAVE_ERROR_CLASS_NAME,
} from "./AccountSetupForm.constants";
import type { AccountSetupFormProps } from "./AccountSetupForm.types";
import { AccountSetupFormConsents } from "./AccountSetupFormConsents/AccountSetupFormConsents";
import { useAccountSetupForm } from "./utils/useAccountSetupForm";
import { useSetupTexts } from "./utils/useSetupTexts";

// The step that completes a new account: the name the quizzes are signed
// with, suggested by the provider and editable, the age declaration and the
// acceptance of the terms. It makes no request: the done button hands a
// complete setup out, and only that saves the account.
//
// The done button is always the filled one, as the frames draw it. Pressed
// with something missing, it says what under each missing item and moves
// focus to the first of them. Nothing is focused when the step opens, so a
// phone keyboard does not cover it. While the account is saved, the done
// button stays filled with a spinner and everything else is drawn at 40%.
//
// The message about the name is Athena's error text of the field: Athena
// describes the input with it and with nothing else. The field has no
// native length limit: the browser counts UTF-16 units, the name counts
// characters, and the typed text is cut to 50 characters as it changes.
export const AccountSetupForm = ({
  provider,
  suggestedName,
  isSaving = false,
  hasSaveFailed = false,
  termsHref,
  privacyHref,
  headingLevel,
  cardLayout,
  headingId,
  descriptionId,
  onClose,
  isCloseDisabled,
  onSubmit,
  onCancel,
}: AccountSetupFormProps) => {
  const { t } = useLingui();
  const form = useAccountSetupForm({ suggestedName, isSaving, onSubmit });
  const { messages, promise } = useSetupTexts(provider);

  return (
    <AuthCard
      heading={t`Prawie gotowe`}
      description={t`Tak podpiszemy Twoje quizy. Nazwę zmienisz później w ustawieniach konta.`}
      headingLevel={headingLevel}
      layout={cardLayout}
      headingId={headingId}
      descriptionId={descriptionId}
      onClose={onClose}
      isCloseDisabled={isCloseDisabled || isSaving}
    >
      <form noValidate className="flex flex-col gap-4" onSubmit={form.submit}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={form.ids.name} className={LABEL_CLASS_NAME}>
            {t`Nazwa`}
          </label>
          <Input
            ref={form.nameRef}
            id={form.ids.name}
            autoComplete="nickname"
            value={form.name}
            isDisabled={isSaving}
            isError={form.nameIssue !== undefined}
            errorText={form.nameIssue ? messages[form.nameIssue] : undefined}
            className={`${TEXT_FIELD_CLASS_NAME} ${form.nameIssue ? "border-gi-red" : ""}`}
            onChange={form.changeName}
          />
        </div>

        <AccountSetupFormConsents
          ids={form.ids}
          isAgeDeclared={form.isAgeDeclared}
          hasAcceptedTerms={form.hasAcceptedTerms}
          ageMessage={
            form.issues.includes("age-not-declared")
              ? messages["age-not-declared"]
              : undefined
          }
          termsMessage={
            form.issues.includes("terms-not-accepted")
              ? messages["terms-not-accepted"]
              : undefined
          }
          isDisabled={isSaving}
          termsHref={termsHref}
          privacyHref={privacyHref}
          onAgeChange={form.setIsAgeDeclared}
          onTermsChange={form.setHasAcceptedTerms}
        />

        <p className="pl-5.5 text-sm leading-[1.2] italic">{promise}</p>

        {hasSaveFailed && (
          <p role="alert" className={SAVE_ERROR_CLASS_NAME}>
            {t`Nie udało się zapisać konta. Spróbuj jeszcze raz.`}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center">
          <Button
            type="primary"
            variant="primary"
            htmlType="submit"
            isLoading={isSaving}
            className={`${TALL_BUTTON_CLASS_NAME} ${DONE_CLASS_NAME}`}
          >
            {t`Gotowe`}
          </Button>
          <Button
            type="ghost"
            variant="primary"
            disabled={isSaving}
            className={`${QUIET_BUTTON_CLASS_NAME} ${CANCEL_CLASS_NAME}`}
            onClick={onCancel}
          >
            {t`Anuluj`}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};
