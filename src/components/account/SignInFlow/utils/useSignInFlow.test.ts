import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  AccountSetup,
  AuthClient,
  CompleteSignUpOutcome,
  SignInOutcome,
} from "@/types/auth";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createFakeAuthClient } from "@/utils/vitest/auth/createFakeAuthClient";
import {
  createSessionValue,
  SessionWrapper,
} from "@/utils/vitest/auth/renderWithSession";

import { useSignInFlow } from "./useSignInFlow";

const SETUP: AccountSetup = {
  displayName: "Ala",
  isAgeDeclared: true,
  hasAcceptedTerms: true,
};
const ACCOUNT = createAuthAccount();
const NEW_ACCOUNT: SignInOutcome = {
  kind: "new-account",
  signUp: { id: "sign-up-1", provider: "google", suggestedName: "Ala Nowak" },
};
const ACCOUNT_EXISTS: SignInOutcome = {
  kind: "account-exists",
  pendingId: "link-1",
  provider: "facebook",
  ownerProvider: "google",
  email: "ala@example.com",
};

const deferred = <Value>() => {
  let resolve: (value: Value) => void = () => undefined;
  const promise = new Promise<Value>((done) => {
    resolve = done;
  });

  return { promise, resolve };
};

const renderFlow = (
  client: AuthClient,
  options: Partial<Parameters<typeof useSignInFlow>[0]> = {},
) => {
  const value = createSessionValue({ client });
  const callbacks = {
    onSignedIn: vi.fn(),
    onCancel: vi.fn(),
    onBusyChange: vi.fn(),
  };
  const hook = renderHook(
    () => useSignInFlow({ returnTo: "/back", ...callbacks, ...options }),
    { wrapper: SessionWrapper(value) },
  );

  return { ...hook, ...callbacks, value };
};

const signingIn = (...outcomes: SignInOutcome[]) => {
  const signIn = vi.fn<AuthClient["signIn"]>();
  for (const outcome of outcomes) signIn.mockResolvedValueOnce(outcome);
  return signIn;
};

describe("useSignInFlow()", () => {
  describe("given a provider with an account", () => {
    it("signs in and finishes", async () => {
      const client = createFakeAuthClient({
        signIn: signingIn({ kind: "signed-in", account: ACCOUNT }),
      });
      const { result, value, onSignedIn } = renderFlow(client);

      await act(async () => result.current.chooseProvider("google"));

      expect(client.signIn).toHaveBeenCalledWith("google", {
        returnTo: "/back",
        link: undefined,
        signal: expect.any(AbortSignal),
      });
      expect(value.setSignedIn).toHaveBeenCalledWith(ACCOUNT);
      expect(onSignedIn).toHaveBeenCalledWith(ACCOUNT);
    });
  });

  describe("given a provider is chosen", () => {
    it("waits for it and ignores a second choice", async () => {
      const answer = deferred<SignInOutcome>();
      const client = createFakeAuthClient({ signIn: () => answer.promise });
      const { result } = renderFlow(client);

      act(() => result.current.chooseProvider("facebook"));
      act(() => result.current.chooseProvider("x"));

      expect(result.current.state).toEqual({
        step: "choose",
        waitingFor: "facebook",
      });
      await act(async () => answer.resolve({ kind: "failed" }));
    });
  });

  describe("given a provider without an account", () => {
    it("opens the step with the suggested name", async () => {
      const { result } = renderFlow(
        createFakeAuthClient({ signIn: signingIn(NEW_ACCOUNT) }),
      );

      await act(async () => result.current.chooseProvider("google"));

      expect(result.current.state).toEqual({
        step: "setup",
        signUp: {
          id: "sign-up-1",
          provider: "google",
          suggestedName: "Ala Nowak",
        },
        isSaving: false,
        hasSaveFailed: false,
      });
    });
  });

  describe("given the step", () => {
    const withStep = async (complete: AuthClient["completeSignUp"]) => {
      const flow = renderFlow(
        createFakeAuthClient({
          signIn: signingIn(NEW_ACCOUNT),
          completeSignUp: complete,
        }),
      );
      await act(async () => flow.result.current.chooseProvider("google"));
      return flow;
    };

    it("saves the account, finishes, and is busy while saving", async () => {
      const saved = deferred<CompleteSignUpOutcome>();
      const { result, value, onSignedIn, onBusyChange } = await withStep(
        () => saved.promise,
      );

      act(() => result.current.completeSetup(SETUP));

      expect(result.current.state).toMatchObject({ isSaving: true });
      expect(onBusyChange).toHaveBeenLastCalledWith(true);

      await act(async () =>
        saved.resolve({ kind: "signed-in", account: ACCOUNT }),
      );

      expect(onBusyChange).toHaveBeenLastCalledWith(false);
      expect(value.setSignedIn).toHaveBeenCalledWith(ACCOUNT);
      expect(onSignedIn).toHaveBeenCalledWith(ACCOUNT);
    });

    it("saves the named sign-up", async () => {
      const complete = vi.fn().mockResolvedValue({ kind: "failed" });
      const { result } = await withStep(complete);

      await act(async () => result.current.completeSetup(SETUP));

      expect(complete).toHaveBeenCalledWith("sign-up-1", SETUP);
    });

    it("repeats a save whose answer was lost, and finishes when the account was made", async () => {
      const complete = vi
        .fn()
        .mockRejectedValueOnce(new Error("timeout"))
        .mockResolvedValueOnce({ kind: "signed-in", account: ACCOUNT });
      const { result, onSignedIn, onBusyChange } = await withStep(complete);

      await act(async () => result.current.completeSetup(SETUP));

      expect(complete).toHaveBeenCalledTimes(2);
      expect(complete).toHaveBeenLastCalledWith("sign-up-1", SETUP);
      expect(onSignedIn).toHaveBeenCalledWith(ACCOUNT);
      expect(onBusyChange.mock.calls).toEqual([[true], [false]]);
    });

    it("shows the save error when saving fails and no account was made", async () => {
      const { result } = await withStep(
        vi.fn().mockResolvedValue({ kind: "failed" }),
      );

      await act(async () => result.current.completeSetup(SETUP));

      expect(result.current.state).toMatchObject({
        step: "setup",
        isSaving: false,
        hasSaveFailed: true,
      });
    });

    it("shows the save error when the client cannot be reached twice", async () => {
      const { result } = await withStep(
        vi.fn().mockRejectedValue(new Error("offline")),
      );

      await act(async () => result.current.completeSetup(SETUP));

      expect(result.current.state).toMatchObject({ hasSaveFailed: true });
    });

    it("tells the host nothing more when it is unmounted during the save", async () => {
      const saved = deferred<CompleteSignUpOutcome>();
      const { result, unmount, onBusyChange, onSignedIn } = await withStep(
        () => saved.promise,
      );
      act(() => result.current.completeSetup(SETUP));

      unmount();
      await act(async () =>
        saved.resolve({ kind: "signed-in", account: ACCOUNT }),
      );

      expect(onBusyChange.mock.calls).toEqual([[true]]);
      expect(onSignedIn).not.toHaveBeenCalled();
    });

    it("returns to the providers with the failed error when the sign-up expired", async () => {
      const { result } = await withStep(
        vi.fn().mockResolvedValue({ kind: "expired" }),
      );

      await act(async () => result.current.completeSetup(SETUP));

      expect(result.current.state).toEqual({
        step: "choose",
        error: { kind: "failed" },
      });
    });

    it("drops the pending sign-up and returns to the providers on cancel", async () => {
      const { result, value, onCancel } = await withStep(vi.fn());

      act(() => result.current.cancelSetup());

      expect(value.client.cancelPending).toHaveBeenCalledWith("sign-up-1");
      expect(result.current.state).toEqual({ step: "choose" });
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it("drops the pending sign-up when the flow is unmounted", async () => {
      const { unmount, value } = await withStep(vi.fn());

      unmount();

      expect(value.client.cancelPending).toHaveBeenCalledWith("sign-up-1");
    });
  });

  describe("given an address that belongs to a Google account", () => {
    it("signs in with Google meant to link, and finishes", async () => {
      const client = createFakeAuthClient({
        signIn: signingIn(ACCOUNT_EXISTS, {
          kind: "signed-in",
          account: ACCOUNT,
        }),
      });
      const { result, onSignedIn } = renderFlow(client);
      await act(async () => result.current.chooseProvider("facebook"));

      expect(result.current.state).toMatchObject({ step: "account-exists" });

      await act(async () => result.current.signInOwner());

      expect(client.signIn).toHaveBeenLastCalledWith("google", {
        returnTo: "/back",
        link: "link-1",
        signal: expect.any(AbortSignal),
      });
      expect(onSignedIn).toHaveBeenCalledWith(ACCOUNT);
    });

    it("waits on the owner's button", async () => {
      const answer = deferred<SignInOutcome>();
      const signIn = vi
        .fn<AuthClient["signIn"]>()
        .mockResolvedValueOnce(ACCOUNT_EXISTS)
        .mockReturnValueOnce(answer.promise);
      const { result } = renderFlow(createFakeAuthClient({ signIn }));
      await act(async () => result.current.chooseProvider("facebook"));

      act(() => result.current.signInOwner());

      expect(result.current.state).toMatchObject({ isWaiting: true });
      await act(async () => answer.resolve({ kind: "failed" }));
    });

    it("starts over with the failed error when the link fails", async () => {
      const { result } = renderFlow(
        createFakeAuthClient({
          signIn: signingIn(ACCOUNT_EXISTS, { kind: "link-failed" }),
        }),
      );
      await act(async () => result.current.chooseProvider("facebook"));

      await act(async () => result.current.signInOwner());

      expect(result.current.state).toEqual({
        step: "choose",
        error: { kind: "failed" },
      });
    });

    it("drops the pending link on another way", async () => {
      const { result, value } = renderFlow(
        createFakeAuthClient({ signIn: signingIn(ACCOUNT_EXISTS) }),
      );
      await act(async () => result.current.chooseProvider("facebook"));

      act(() => result.current.chooseAnother());

      expect(value.client.cancelPending).toHaveBeenCalledWith("link-1");
      expect(result.current.state).toEqual({ step: "choose" });
    });
  });

  describe("given a sign-in that failed while the session was started", () => {
    it("finishes, signed in", async () => {
      const client = createFakeAuthClient({
        signIn: vi.fn().mockRejectedValue(new Error("lost")),
        getSession: vi.fn().mockResolvedValue(ACCOUNT),
      });
      const { result, onSignedIn } = renderFlow(client);

      await act(async () => result.current.chooseProvider("google"));

      expect(onSignedIn).toHaveBeenCalledWith(ACCOUNT);
    });
  });

  describe("given the provider window was closed", () => {
    it("returns to the providers with that error", async () => {
      const { result } = renderFlow(
        createFakeAuthClient({
          signIn: signingIn({ kind: "window-closed", provider: "facebook" }),
        }),
      );

      await act(async () => result.current.chooseProvider("facebook"));

      expect(result.current.state).toEqual({
        step: "choose",
        error: { kind: "window-closed", provider: "facebook" },
      });
    });
  });

  describe("given the client cannot be reached", () => {
    it("returns to the providers with the failed error", async () => {
      const { result } = renderFlow(
        createFakeAuthClient({
          signIn: vi.fn().mockRejectedValue(new Error("offline")),
        }),
      );

      await act(async () => result.current.chooseProvider("google"));

      expect(result.current.state).toEqual({
        step: "choose",
        error: { kind: "failed" },
      });
    });
  });

  describe("given the flow is unmounted while a provider is waited for", () => {
    it("aborts the sign-in and tells the host nothing", async () => {
      const answer = deferred<SignInOutcome>();
      let signal: AbortSignal | undefined;
      const client = createFakeAuthClient({
        signIn: (_provider, options) => {
          signal = options?.signal;
          return answer.promise;
        },
      });
      const { result, unmount, onSignedIn, value } = renderFlow(client);
      act(() => result.current.chooseProvider("google"));

      unmount();
      await act(async () =>
        answer.resolve({ kind: "signed-in", account: ACCOUNT }),
      );

      expect(signal?.aborted).toBe(true);
      expect(onSignedIn).not.toHaveBeenCalled();
      expect(value.setSignedIn).not.toHaveBeenCalled();
      expect(value.client.cancelPending).not.toHaveBeenCalled();
    });
  });

  describe("given resume and a sign-in that left the page", () => {
    it("continues from its outcome", async () => {
      const client = createFakeAuthClient({
        resumeSignIn: vi.fn().mockResolvedValue(NEW_ACCOUNT),
      });
      const { result } = renderFlow(client, { resume: true });

      await waitFor(() => expect(result.current.state.step).toBe("setup"));
    });

    it("finishes when that sign-in signed the person in", async () => {
      const client = createFakeAuthClient({
        resumeSignIn: vi
          .fn()
          .mockResolvedValue({ kind: "signed-in", account: ACCOUNT }),
      });
      const { onSignedIn } = renderFlow(client, { resume: true });

      await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(ACCOUNT));
    });

    it("finishes when it failed but the session was started", async () => {
      const client = createFakeAuthClient({
        resumeSignIn: vi.fn().mockResolvedValue({ kind: "failed" }),
        getSession: vi.fn().mockResolvedValue(ACCOUNT),
      });
      const { onSignedIn, value } = renderFlow(client, { resume: true });

      await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(ACCOUNT));
      expect(value.setSignedIn).toHaveBeenCalledWith(ACCOUNT);
    });

    it("shows the failed error when it failed and no session was started", async () => {
      const client = createFakeAuthClient({
        resumeSignIn: vi.fn().mockResolvedValue({ kind: "failed" }),
        getSession: vi.fn().mockResolvedValue(null),
      });
      const { result, onSignedIn } = renderFlow(client, { resume: true });

      await waitFor(() =>
        expect(result.current.state).toEqual({
          step: "choose",
          error: { kind: "failed" },
        }),
      );
      expect(onSignedIn).not.toHaveBeenCalled();
    });

    it("shows nothing and offers no sign-in until the client answers", async () => {
      const resumed = deferred<SignInOutcome | null>();
      const client = createFakeAuthClient({
        resumeSignIn: () => resumed.promise,
      });
      const { result } = renderFlow(client, { resume: true });

      act(() => result.current.chooseProvider("x"));

      expect(result.current.state).toEqual({ step: "resuming" });
      expect(client.signIn).not.toHaveBeenCalled();
      await act(async () => resumed.resolve(null));
      expect(result.current.state).toEqual({ step: "choose" });
    });
  });

  describe("given a resumed sign-in reports a pending operation after unmount", () => {
    it("drops it", async () => {
      const resumed = deferred<SignInOutcome | null>();
      const { unmount, value } = renderFlow(
        createFakeAuthClient({ resumeSignIn: () => resumed.promise }),
        { resume: true },
      );

      unmount();
      await act(async () => resumed.resolve(NEW_ACCOUNT));

      expect(value.client.cancelPending).toHaveBeenCalledWith("sign-up-1");
    });
  });

  describe("given no resume", () => {
    it("does not ask the client", () => {
      const client = createFakeAuthClient();

      renderFlow(client);

      expect(client.resumeSignIn).not.toHaveBeenCalled();
    });
  });

  describe("given resume and nothing to resume", () => {
    it("stays on the providers", async () => {
      const client = createFakeAuthClient({
        resumeSignIn: vi.fn().mockRejectedValue(new Error("offline")),
      });
      const { result } = renderFlow(client, { resume: true });

      await waitFor(() =>
        expect(result.current.state).toEqual({ step: "choose" }),
      );
    });
  });

  describe("given a press that does not belong to the view", () => {
    it("ignores it", async () => {
      const client = createFakeAuthClient({
        signIn: signingIn(ACCOUNT_EXISTS),
      });
      const { result } = renderFlow(client);

      act(() => result.current.signInOwner());
      act(() => result.current.completeSetup(SETUP));
      await act(async () => result.current.chooseProvider("facebook"));
      act(() => result.current.chooseProvider("google"));

      expect(client.signIn).toHaveBeenCalledOnce();
      expect(client.completeSignUp).not.toHaveBeenCalled();
      expect(result.current.state.step).toBe("account-exists");
    });

    it("ignores another way while the owner's sign-in runs", async () => {
      const answer = deferred<SignInOutcome>();
      const signIn = vi
        .fn<AuthClient["signIn"]>()
        .mockResolvedValueOnce(ACCOUNT_EXISTS)
        .mockReturnValueOnce(answer.promise);
      const { result, value } = renderFlow(createFakeAuthClient({ signIn }));
      await act(async () => result.current.chooseProvider("facebook"));
      act(() => result.current.signInOwner());

      act(() => result.current.chooseAnother());

      expect(value.client.cancelPending).not.toHaveBeenCalled();
      await act(async () => answer.resolve({ kind: "failed" }));
    });

    it("saves once when the done button is pressed twice", async () => {
      const saved = deferred<CompleteSignUpOutcome>();
      const client = createFakeAuthClient({
        signIn: signingIn(NEW_ACCOUNT),
        completeSignUp: vi.fn(() => saved.promise),
      });
      const { result } = renderFlow(client);
      await act(async () => result.current.chooseProvider("google"));

      act(() => result.current.completeSetup(SETUP));
      act(() => result.current.completeSetup(SETUP));

      expect(client.completeSignUp).toHaveBeenCalledOnce();
      await act(async () => saved.resolve({ kind: "failed" }));
    });
  });

  describe("given the pending sign-up cannot be dropped", () => {
    it("still walks away, on cancel and on unmount", async () => {
      const client = createFakeAuthClient({
        signIn: signingIn(NEW_ACCOUNT, ACCOUNT_EXISTS, ACCOUNT_EXISTS),
        cancelPending: vi.fn().mockRejectedValue(new Error("offline")),
      });
      const { result, unmount, onCancel } = renderFlow(client);
      await act(async () => result.current.chooseProvider("google"));

      await act(async () => result.current.cancelSetup());
      await act(async () => result.current.chooseProvider("facebook"));
      await act(async () => result.current.chooseAnother());
      await act(async () => result.current.chooseProvider("facebook"));
      unmount();

      expect(onCancel).toHaveBeenCalledOnce();
      expect(client.cancelPending).toHaveBeenCalledTimes(3);
    });
  });

  describe("given the flow is unmounted before a resumed sign-in answers", () => {
    it("tells the host nothing", async () => {
      const resumed = deferred<SignInOutcome | null>();
      const { unmount, onSignedIn, value } = renderFlow(
        createFakeAuthClient({ resumeSignIn: () => resumed.promise }),
        { resume: true },
      );

      unmount();
      await act(async () =>
        resumed.resolve({ kind: "signed-in", account: ACCOUNT }),
      );

      expect(onSignedIn).not.toHaveBeenCalled();
      expect(value.setSignedIn).not.toHaveBeenCalled();
    });
  });
});
