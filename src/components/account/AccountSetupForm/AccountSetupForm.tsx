import { Button, Input } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import { type FormEvent, useId, useRef } from "react";

import {
  QUIET_BUTTON_CLASS_NAME,
  TALL_BUTTON_CLASS_NAME,
} from "@/constants/button";
import { TEXT_FIELD_CLASS_NAME } from "@/constants/form";
import { DISPLAY_NAME_MAX_LENGTH } from "@/utils/auth/toDisplayName";

import { AuthCard } from "../AuthCard/AuthCard";
import { LABEL_CLASS_NAME } from "./AccountSetupForm.constants";
import type {
  AccountSetupFormProps,
  AccountSetupIssue,
} from "./AccountSetupForm.types";
import { AccountSetupFormConsents } from "./AccountSetupFormConsents/AccountSetupFormConsents";
import { useAccountSetup } from "./utils/useAccountSetup";

// The step that completes a new account: the name the quizzes are signed
// with, suggested by the provider and editable, the age declaration and the
// acceptance of the terms. It makes no request: the done button hands a
// complete setup out, and only that saves the account.
//
// The done button is always the filled one, as the frames draw it. Pressed
// with something missing, it says what under each missing item and moves
// focus to the first of them. Nothing is focused when the step opens, so a phone
// keyboard does not cover it.
//
// The message about the name is Athena's error text of the field: Athena
// describes the input with it and with nothing else.
export const AccountSetupForm = ({
  provider,
  suggestedName,
  isSaving = false,
  hasSaveFailed = false,
  termsHref,
  privacyHref,
  headingLevel,
  headingId,
  descriptionId,
  onClose,
  isCloseDisabled,
  onSubmit,
  onCancel,
}: AccountSetupFormProps) => {
  const { t } = useLingui();
  const setup = useAccountSetup(suggestedName);
  const baseId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const ids = {
    name: `${baseId}-name`,
    age: `${baseId}-age`,
    ageMessage: `${baseId}-age-message`,
    terms: `${baseId}-terms`,
    termsSentence: `${baseId}-terms-sentence`,
    termsMessage: `${baseId}-terms-message`,
  };

  const messages: Record<AccountSetupIssue, string> = {
    "name-missing": t`Wpisz nazwę, którą podpiszemy Twoje quizy.`,
    "name-too-short": t`Nazwa musi mieć co najmniej 2 znaki.`,
    "age-not-declared": t`Konto mogą założyć osoby, które mają ukończone 16 lat.`,
    "terms-not-accepted": t`Żeby założyć konto, zaakceptuj Regulamin i Politykę prywatności.`,
  };
  const nameIssue = setup.issues.find((issue) => issue.startsWith("name"));
  const promise =
    provider === "facebook"
      ? t`Dbamy o Twoją prywatność. Dane z konta na Facebooku (w tym adres e-mail) nigdy nie będą powiązane z danymi o Twoich poglądach.`
      : provider === "x"
        ? t`Dbamy o Twoją prywatność. Dane z konta X (w tym adres e-mail) nigdy nie będą powiązane z danymi o Twoich poglądach.`
        : t`Dbamy o Twoją prywatność. Dane z konta Google (w tym adres e-mail) nigdy nie będą powiązane z danymi o Twoich poglądach.`;

  const focusIssue = (issue: AccountSetupIssue) => {
    const id =
      issue === "age-not-declared"
        ? ids.age
        : issue === "terms-not-accepted"
          ? ids.terms
          : undefined;

    if (id) document.getElementById(id)?.focus();
    else nameRef.current?.focus();
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (isSaving) return;

    const result = setup.submit();

    if (Array.isArray(result)) focusIssue(result[0]);
    else onSubmit(result);
  };

  return (
    <AuthCard
      heading={t`Prawie gotowe`}
      description={t`Tak podpiszemy Twoje quizy. Nazwę zmienisz później w ustawieniach konta.`}
      headingLevel={headingLevel}
      headingId={headingId}
      descriptionId={descriptionId}
      onClose={onClose}
      isCloseDisabled={isCloseDisabled}
    >
      <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.name} className={LABEL_CLASS_NAME}>
            {t`Nazwa`}
          </label>
          <Input
            ref={nameRef}
            id={ids.name}
            autoComplete="nickname"
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            value={setup.name}
            isDisabled={isSaving}
            isError={nameIssue !== undefined}
            errorText={nameIssue ? messages[nameIssue] : undefined}
            className={`${TEXT_FIELD_CLASS_NAME} ${nameIssue ? "border-gi-red" : ""}`}
            onChange={setup.changeName}
          />
        </div>

        <AccountSetupFormConsents
          ids={ids}
          isAgeDeclared={setup.isAgeDeclared}
          hasAcceptedTerms={setup.hasAcceptedTerms}
          ageMessage={
            setup.issues.includes("age-not-declared")
              ? messages["age-not-declared"]
              : undefined
          }
          termsMessage={
            setup.issues.includes("terms-not-accepted")
              ? messages["terms-not-accepted"]
              : undefined
          }
          isDisabled={isSaving}
          termsHref={termsHref}
          privacyHref={privacyHref}
          onAgeChange={setup.setIsAgeDeclared}
          onTermsChange={setup.setHasAcceptedTerms}
        />

        <p className="pl-5.5 text-sm leading-[1.2] italic">{promise}</p>

        {hasSaveFailed && (
          <p
            role="alert"
            className="text-center text-sm leading-[1.2] text-gi-red"
          >
            {t`Nie udało się zapisać konta. Spróbuj jeszcze raz.`}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center">
          <Button
            type="primary"
            variant="primary"
            htmlType="submit"
            isLoading={isSaving}
            className={TALL_BUTTON_CLASS_NAME}
          >
            {t`Gotowe`}
          </Button>
          <Button
            type="ghost"
            variant="primary"
            disabled={isSaving}
            className={QUIET_BUTTON_CLASS_NAME}
            onClick={onCancel}
          >
            {t`Anuluj`}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};
