import type { SignInOutcome } from "@/types/auth";

import type { SignInFlowState } from "../SignInFlow.types";

// The identifier of the pending sign-up or link a state of the flow shows,
// or an outcome reports, if any.
export const getPendingId = (
  from: SignInFlowState | SignInOutcome,
): string | undefined => {
  if ("step" in from) {
    if (from.step === "setup") return from.signUp.id;
    if (from.step === "account-exists") return from.pendingId;
    return undefined;
  }

  if (from.kind === "new-account") return from.signUp.id;
  if (from.kind === "account-exists") return from.pendingId;
  return undefined;
};
