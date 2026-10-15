import { useEffect, useRef, useState } from "react";

import type {
  AccountSetup,
  AuthAccount,
  IdentityProvider,
  SignInOutcome,
} from "@/types/auth";
import { useAuthSession } from "@/utils/auth/useAuthSession";

import type { SignInFlowActions, SignInFlowState } from "../SignInFlow.types";
import { toFlowState } from "./toFlowState";

interface SignInFlowOptions {
  returnTo?: string;
  resume?: boolean;
  onSignedIn: (account: AuthAccount) => void;
  onCancel?: () => void;
  onBusyChange?: (isBusy: boolean) => void;
}

const FAILED: SignInOutcome = { kind: "failed" };

// The sign-in as a sequence of states over the app's AuthClient. It talks to
// the client, keeps the card's state and tells its host when the person is
// signed in.
//
// The flow can be unmounted at any moment - the dialog closes. Then a
// running provider sign-in is aborted, which makes the client close the
// window and undo whatever the sign-in started, and a pending sign-up or
// link on screen is dropped. An answer that still arrives changes nothing.
export const useSignInFlow = ({
  returnTo,
  resume = false,
  onSignedIn,
  onCancel,
  onBusyChange,
}: SignInFlowOptions): { state: SignInFlowState } & SignInFlowActions => {
  const { client, setSignedIn } = useAuthSession();
  const [state, setState] = useState<SignInFlowState>({ step: "choose" });
  const stateRef = useRef(state);
  const isMounted = useRef(true);
  const running = useRef<AbortController | null>(null);
  const hasStarted = useRef(false);

  stateRef.current = state;

  const show = (next: SignInFlowState) => {
    if (isMounted.current) setState(next);
  };

  const finish = (outcome: SignInOutcome) => {
    if (!isMounted.current) return;

    if (outcome.kind === "signed-in") {
      setSignedIn(outcome.account);
      onSignedIn(outcome.account);
    } else {
      show(toFlowState(outcome));
    }
  };

  const signIn = async (provider: IdentityProvider, link: boolean) => {
    hasStarted.current = true;
    const controller = new AbortController();
    running.current = controller;

    const outcome = await client
      .signIn(provider, { returnTo, link, signal: controller.signal })
      .catch(() => FAILED);

    if (running.current === controller) running.current = null;
    if (!controller.signal.aborted) finish(outcome);
  };

  // A provider window can take minutes; its answer is what the card shows
  // next. Only one sign-in runs at a time.
  const chooseProvider = (provider: IdentityProvider) => {
    if (running.current || stateRef.current.step !== "choose") return;

    show({ step: "choose", waitingFor: provider });
    void signIn(provider, false);
  };

  const signInOwner = () => {
    const current = stateRef.current;
    if (running.current || current.step !== "account-exists") return;

    show({ ...current, isWaiting: true });
    void signIn(current.ownerProvider, true);
  };

  const chooseAnother = () => {
    if (running.current) return;

    void client.cancelPending().catch(() => undefined);
    show({ step: "choose" });
  };

  const completeSetup = async (setup: AccountSetup) => {
    const current = stateRef.current;
    if (current.step !== "setup" || current.isSaving) return;

    show({ ...current, isSaving: true, hasSaveFailed: false });
    onBusyChange?.(true);

    const outcome = await client
      .completeSignUp(setup)
      .catch(() => ({ kind: "failed" }) as const);

    onBusyChange?.(false);

    if (outcome.kind === "signed-in") finish(outcome);
    else if (outcome.kind === "expired") finish(FAILED);
    else show({ ...current, isSaving: false, hasSaveFailed: true });
  };

  // The person walks away from the step: the pending sign-up is dropped
  // (a failure to drop it is not theirs to wait for - the cookie expires in
  // their browser), and the card starts over.
  const cancelSetup = () => {
    void client.cancelPending().catch(() => undefined);
    show({ step: "choose" });
    onCancel?.();
  };

  useEffect(() => {
    isMounted.current = true;

    if (resume) {
      void client
        .resumeSignIn()
        .catch(() => null)
        .then((outcome) => {
          if (outcome && !hasStarted.current) finish(outcome);
        });
    }

    return () => {
      isMounted.current = false;
      running.current?.abort();

      const { step } = stateRef.current;
      if (step === "setup" || step === "account-exists") {
        void client.cancelPending().catch(() => undefined);
      }
    };
    // Once, when the flow is shown: it asks to resume once and lets go once.
  }, []);

  return {
    state,
    chooseProvider,
    signInOwner,
    chooseAnother,
    completeSetup: (setup) => void completeSetup(setup),
    cancelSetup,
  };
};
