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

// The identifier of the pending sign-up or link a state shows, if any.
const getPendingId = (state: SignInFlowState) =>
  state.step === "setup"
    ? state.signUp.id
    : state.step === "account-exists"
      ? state.pendingId
      : undefined;

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
  const [state, setState] = useState<SignInFlowState>(
    resume ? { step: "resuming" } : { step: "choose" },
  );
  const stateRef = useRef(state);
  const isMounted = useRef(true);
  const running = useRef<AbortController | null>(null);

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

  // Dropping a pending operation is a request the person never waits for:
  // when it fails, the cookie expires in their own browser.
  const dropPending = (pendingId: string | undefined) => {
    if (pendingId) void client.cancelPending(pendingId).catch(() => undefined);
  };

  const signIn = async (provider: IdentityProvider, link?: string) => {
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
    void signIn(provider);
  };

  const signInOwner = () => {
    const current = stateRef.current;
    if (running.current || current.step !== "account-exists") return;

    show({ ...current, isWaiting: true });
    void signIn(current.ownerProvider, current.pendingId);
  };

  const chooseAnother = () => {
    if (running.current) return;

    dropPending(getPendingId(stateRef.current));
    show({ step: "choose" });
  };

  // A save whose answer is lost may still have made the account: before
  // saying it failed, the flow asks for the session.
  const completeSetup = async (setup: AccountSetup) => {
    const current = stateRef.current;
    if (current.step !== "setup" || current.isSaving) return;

    show({ ...current, isSaving: true, hasSaveFailed: false });
    onBusyChange?.(true);

    const outcome = await client
      .completeSignUp(current.signUp.id, setup)
      .catch(() => ({ kind: "failed" }) as const);
    const account =
      outcome.kind === "failed"
        ? await client.getSession().catch(() => null)
        : null;

    onBusyChange?.(false);

    if (outcome.kind === "signed-in") finish(outcome);
    else if (account) finish({ kind: "signed-in", account });
    else if (outcome.kind === "expired") finish(FAILED);
    else show({ ...current, isSaving: false, hasSaveFailed: true });
  };

  // The person walks away from the step: the pending sign-up is dropped and
  // the card starts over.
  const cancelSetup = () => {
    dropPending(getPendingId(stateRef.current));
    show({ step: "choose" });
    onCancel?.();
  };

  useEffect(() => {
    isMounted.current = true;

    // While the flow asks how a sign-in that left the page ended, it shows
    // nothing, so no other sign-in can start.
    if (resume) {
      void client
        .resumeSignIn()
        .catch(() => null)
        .then((outcome) => {
          if (outcome) finish(outcome);
          else show({ step: "choose" });
        });
    }

    return () => {
      isMounted.current = false;
      running.current?.abort();
      dropPending(getPendingId(stateRef.current));
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
