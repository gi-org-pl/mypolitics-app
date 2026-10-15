import type { AuthCardLayout } from "@/components/account/AuthCard/AuthCard.types";
import type { AccountSetup, IdentityProvider } from "@/types/auth";

export interface AccountSetupFormProps {
  provider: IdentityProvider; // named in the privacy promise
  suggestedName?: string; // the field starts with it
  isSaving?: boolean; // "Gotowe" waits and nothing can be changed
  hasSaveFailed?: boolean;
  termsHref: string;
  privacyHref: string;
  headingLevel?: 1 | 2;
  cardLayout?: AuthCardLayout;
  headingId?: string;
  descriptionId?: string;
  onClose?: () => void; // the dialog's close button
  isCloseDisabled?: boolean;
  onSubmit: (setup: AccountSetup) => void;
  onCancel: () => void;
}

// What is still missing when the done button is pressed, in the order of
// the step.
export type AccountSetupIssue =
  | "name-missing"
  | "name-too-short"
  | "age-not-declared"
  | "terms-not-accepted";
