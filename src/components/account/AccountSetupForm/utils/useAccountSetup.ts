import { useState } from "react";
import { DISPLAY_NAME_MIN_LENGTH } from "@/constants/auth";
import type { AccountSetup } from "@/types/auth";
import { toDisplayName } from "@/utils/auth/toDisplayName";
import { toTypedName } from "@/utils/auth/toTypedName";

import type { AccountSetupIssue } from "../AccountSetupForm.types";

const getIssues = (
  name: string,
  isAgeDeclared: boolean,
  hasAcceptedTerms: boolean,
): AccountSetupIssue[] => {
  const length = Array.from(toDisplayName(name)).length;
  const issues: AccountSetupIssue[] = [];

  if (length === 0) issues.push("name-missing");
  else if (length < DISPLAY_NAME_MIN_LENGTH) issues.push("name-too-short");
  if (!isAgeDeclared) issues.push("age-not-declared");
  if (!hasAcceptedTerms) issues.push("terms-not-accepted");

  return issues;
};

// What the step holds and what is missing. The step never greys the done
// button out: what is missing is shown once that button has been pressed,
// and from then on every change shows it afresh, so a message goes away as
// soon as its item is fixed.
export const useAccountSetup = (suggestedName = "") => {
  const [name, setName] = useState(() => toTypedName(suggestedName));
  const [isAgeDeclared, setIsAgeDeclared] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const allIssues = getIssues(name, isAgeDeclared, hasAcceptedTerms);
  const issues = isSubmitted ? allIssues : [];

  return {
    name,
    isAgeDeclared,
    hasAcceptedTerms,
    issues,
    changeName: (typed: string) => setName(toTypedName(typed)),
    setIsAgeDeclared,
    setHasAcceptedTerms,
    // The completed setup, or the issues that stop it.
    submit: (): AccountSetup | AccountSetupIssue[] => {
      setIsSubmitted(true);

      if (allIssues.length > 0) return allIssues;

      return {
        displayName: toDisplayName(name),
        isAgeDeclared: true,
        hasAcceptedTerms: true,
      };
    },
  };
};
