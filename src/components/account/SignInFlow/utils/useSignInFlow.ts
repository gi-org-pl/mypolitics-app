import { useEffect, useRef, useState } from "react";

import type {
  AccountSetup,
  AuthAccount,
  CompleteSignUpOutcome,
  IdentityProvider,
  SignInOutcome,
} from "@/types/auth";
import { useAuthSession } from "@/utils/auth/useAuthSession";

import type { SignInFlowActions, SignInFlowState } from "../SignInFlow.types";
import { getPendingId } from "./getPendingId";
import { toFlowState } from "./toFlowState";

interface SignInFlowOptions {
  returnTo?: string;
  resume?: boolean;
  onSignedIn: (account: AuthAccount) => void;
  onCancel?: () => void;
  onBusyChange?: (isBusy: boolean) => void;
}

const FAILED: SignInOutcome = { kind: "failed" };
const SAVE_FAILED: CompleteSignUpOutcome = { kind: "failed" };

// The sign-in as a sequence of states over the app's AuthClient. It talks to
// the client, keeps the card's state and tells its host when the person is
// signed in.
//
// The flow can be unmounted at any moment - the dialog closes. Then a
// running provider sign-in is aborted, which makes the client close the
// window and undo whatever the sign-in started, and a pending sign-up or
// link on screen - or reported after the unmount - is dropped. An answer
// that still arrives tells the host nothing.
//
// An answer can be lost after the API acted on it. So a sign-in that failed
// is checked against the session, and a save that failed is repeated once
// (the API answers a repeated completion with the account it made) before
// the person is told it did not work.
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

  // Dropping a pending operation is a request the person never waits for:
  // when it fails, the cookie expires in their own browser.
  const dropPending = (pendingId: string | undefined) => {
    if (pendingId) void client.cancelPending(pendingId).catch(() => undefined);
  };

  const finish = (outcome: SignInOutcome) => {
    if (!isMounted.current) {
      dropPending(getPendingId(outcome));
      return;
    }

    if (outcome.kind === "signed-in") {
      setSignedIn(outcome.account);
      onSignedIn(outcome.account);
    } else {
      show(toFlowState(outcome));
    }
  };

  // A failure that may hide a sign-in that happened: the session decides.
  const reconcile = async (outcome: SignInOutcome): Promise<SignInOutcome> => {
    if (outcome.kind !== "failed") return outcome;

    const account = await client.getSession().catch(() => null);

    return account ? { kind: "signed-in", account } : outcome;
  };

  const signIn = async (provider: IdentityProvider, link?: string) => {
    const controller = new AbortController();
    running.current = controller;

    const outcome = await client
      .signIn(provider, { returnTo, link, signal: controller.signal })
      .catch(() => FAILED)
      .then(reconcile);

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

  // The host is told the flow is busy for the whole save, the repeat
  // included, so it cannot close in between.
  const completeSetup = async (setup: AccountSetup) => {
    const current = stateRef.current;
    if (current.step !== "setup" || current.isSaving) return;

    show({ ...current, isSaving: true, hasSaveFailed: false });
    onBusyChange?.(true);

    const complete = () =>
      client.completeSignUp(current.signUp.id, setup).catch(() => SAVE_FAILED);
    const first = await complete();
    const outcome = first.kind === "failed" ? await complete() : first;

    if (!isMounted.current) return;

    onBusyChange?.(false);

    if (outcome.kind === "signed-in") finish(outcome);
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
