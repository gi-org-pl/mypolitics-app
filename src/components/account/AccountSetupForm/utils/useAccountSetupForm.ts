import { type FormEvent, useId, useRef } from "react";

import type { AccountSetup } from "@/types/auth";

import type { AccountSetupIssue } from "../AccountSetupForm.types";
import { useAccountSetup } from "./useAccountSetup";

interface AccountSetupFormOptions {
  suggestedName?: string;
  isSaving: boolean;
  onSubmit: (setup: AccountSetup) => void;
}

// The step as a form: the identifiers its controls are tied by, and the
// submit that either hands a complete setup out or moves focus to the first
// thing that is missing. A submit while the account is being saved does
// nothing.
export const useAccountSetupForm = ({
  suggestedName,
  isSaving,
  onSubmit,
}: AccountSetupFormOptions) => {
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

  const focusIssue = (issue: AccountSetupIssue) => {
    if (issue === "age-not-declared") document.getElementById(ids.age)?.focus();
    else if (issue === "terms-not-accepted")
      document.getElementById(ids.terms)?.focus();
    else nameRef.current?.focus();
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (isSaving) return;

    const result = setup.submit();

    if (Array.isArray(result)) focusIssue(result[0]);
    else onSubmit(result);
  };

  return {
    ...setup,
    ids,
    nameRef,
    nameIssue: setup.issues.find(
      (issue) => issue === "name-missing" || issue === "name-too-short",
    ),
    submit,
  };
};
