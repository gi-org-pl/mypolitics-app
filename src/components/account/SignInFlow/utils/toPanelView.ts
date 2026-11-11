import type { SignInPanelView } from "@/components/account/SignInPanel/SignInPanel.types";

import type { SignInFlowState } from "../SignInFlow.types";

// What the sign-in card shows for a state of the flow outside the step.
export const toPanelView = (
  state: Exclude<SignInFlowState, { step: "setup" } | { step: "resuming" }>,
): SignInPanelView =>
  state.step === "account-exists"
    ? {
        kind: "account-exists",
        provider: state.provider,
        ownerProvider: state.ownerProvider,
        email: state.email,
        isWaiting: state.isWaiting,
      }
    : { kind: "choose", waitingFor: state.waitingFor, error: state.error };
