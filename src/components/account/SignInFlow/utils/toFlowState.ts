import type { SignInOutcome } from "@/types/auth";

import type { SignInFlowState } from "../SignInFlow.types";

// Where the card goes after a provider sign-in that did not sign the person
// in. A sign-in that did is not a state of the card: the flow finishes.
export const toFlowState = (
  outcome: Exclude<SignInOutcome, { kind: "signed-in" }>,
): SignInFlowState => {
  switch (outcome.kind) {
    case "new-account":
      return {
        step: "setup",
        signUp: outcome.signUp,
        isSaving: false,
        hasSaveFailed: false,
      };
    case "account-exists":
      return {
        step: "account-exists",
        provider: outcome.provider,
        ownerProvider: outcome.ownerProvider,
        email: outcome.email,
        isWaiting: false,
      };
    case "window-closed":
    case "provider-failed":
      return {
        step: "choose",
        error: { kind: outcome.kind, provider: outcome.provider },
      };
    default:
      // "failed" and "link-failed": something went wrong, start over.
      return { step: "choose", error: { kind: "failed" } };
  }
};
