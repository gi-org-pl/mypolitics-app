import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AuthAccount, AuthClient } from "@/types/auth";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createFakeAuthClient } from "@/utils/vitest/auth/createFakeAuthClient";

import { useSessionState } from "./useSessionState";

const deferred = <Value>() => {
  let resolve: (value: Value) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<Value>((done, fail) => {
    resolve = done;
    reject = fail;
  });

  return { promise, resolve, reject };
};

const renderState = (client: AuthClient) =>
  renderHook(() => useSessionState(client));

const signedInClient = (overrides: Partial<AuthClient> = {}) =>
  createFakeAuthClient({
    getSession: vi.fn().mockResolvedValue(createAuthAccount()),
    ...overrides,
  });

describe("useSessionState()", () => {
  describe("given the client has not answered yet", () => {
    it("holds an unknown session", () => {
      const { result } = renderState(
        createFakeAuthClient({
          getSession: () => new Promise<AuthAccount | null>(() => undefined),
        }),
      );

      expect(result.current.session).toEqual({ status: "unknown" });
    });
  });

  describe("given the client returns an account", () => {
    it("is signed in with it", async () => {
      const { result } = renderState(signedInClient());

      await waitFor(() =>
        expect(result.current.session).toEqual({
          status: "signed-in",
          account: createAuthAccount(),
        }),
      );
    });
  });

  describe("given the client returns no account", () => {
    it("is signed out", async () => {
      const { result } = renderState(createFakeAuthClient());

      await waitFor(() =>
        expect(result.current.session.status).toBe("signed-out"),
      );
    });
  });

  describe("given the client cannot answer", () => {
    it("is signed out", async () => {
      const { result } = renderState(
        createFakeAuthClient({
          getSession: vi.fn().mockRejectedValue(new Error("offline")),
        }),
      );

      await waitFor(() =>
        expect(result.current.session.status).toBe("signed-out"),
      );
    });
  });

  describe("given a signed-in session", () => {
    it("signs out through the client and answers true", async () => {
      const client = signedInClient();
      const { result } = renderState(client);
      await waitFor(() =>
        expect(result.current.session.status).toBe("signed-in"),
      );

      let hasEnded: boolean | undefined;
      await act(async () => {
        hasEnded = await result.current.signOut();
      });

      expect(client.signOut).toHaveBeenCalledOnce();
      expect(hasEnded).toBe(true);
      expect(result.current.session.status).toBe("signed-out");
    });

    it("stays signed in and answers false when the client cannot end the session", async () => {
      const { result } = renderState(
        signedInClient({
          signOut: vi.fn().mockRejectedValue(new Error("offline")),
        }),
      );
      await waitFor(() =>
        expect(result.current.session.status).toBe("signed-in"),
      );

      let hasEnded: boolean | undefined;
      await act(async () => {
        hasEnded = await result.current.signOut();
      });

      expect(hasEnded).toBe(false);
      expect(result.current.session.status).toBe("signed-in");
    });
  });

  describe("given any session", () => {
    it("is signed in with the account a sign-in screen hands over", async () => {
      const { result } = renderState(createFakeAuthClient());
      await waitFor(() =>
        expect(result.current.session.status).toBe("signed-out"),
      );

      act(() =>
        result.current.setSignedIn(createAuthAccount({ displayName: "Ola" })),
      );

      expect(result.current.session).toMatchObject({
        account: { displayName: "Ola" },
      });
    });

    it("asks the client again on refresh", async () => {
      const getSession = vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createAuthAccount());
      const { result } = renderState(createFakeAuthClient({ getSession }));
      await waitFor(() =>
        expect(result.current.session.status).toBe("signed-out"),
      );

      await act(() => result.current.refresh());

      expect(result.current.session.status).toBe("signed-in");
    });
  });

  describe("given a signed-in session and a refresh that cannot be answered", () => {
    it("stays signed in", async () => {
      const getSession = vi
        .fn()
        .mockResolvedValueOnce(createAuthAccount())
        .mockRejectedValueOnce(new Error("offline"));
      const { result } = renderState(createFakeAuthClient({ getSession }));
      await waitFor(() =>
        expect(result.current.session.status).toBe("signed-in"),
      );

      await act(() => result.current.refresh());

      expect(result.current.session.status).toBe("signed-in");
    });
  });

  describe("given a sign-in finishes before the first answer of the client", () => {
    it("keeps the sign-in when the late answer says signed out", async () => {
      const first = deferred<AuthAccount | null>();
      const { result } = renderState(
        createFakeAuthClient({ getSession: () => first.promise }),
      );

      act(() =>
        result.current.setSignedIn(createAuthAccount({ displayName: "Ola" })),
      );
      await act(async () => first.resolve(null));

      expect(result.current.session).toMatchObject({
        account: { displayName: "Ola" },
      });
    });
  });

  describe("given a sign-in finishes while a sign-out is on its way", () => {
    it("keeps the sign-in", async () => {
      const ending = deferred<void>();
      const { result } = renderState(
        signedInClient({ signOut: () => ending.promise }),
      );
      await waitFor(() =>
        expect(result.current.session.status).toBe("signed-in"),
      );

      let signOut: Promise<boolean> | undefined;
      act(() => {
        signOut = result.current.signOut();
      });
      act(() =>
        result.current.setSignedIn(createAuthAccount({ displayName: "Ola" })),
      );
      await act(async () => {
        ending.resolve();
        await signOut;
      });

      expect(result.current.session).toMatchObject({
        account: { displayName: "Ola" },
      });
    });
  });

  describe("given two sign-outs overlap and the second fails", () => {
    it("is signed out by the first", async () => {
      const first = deferred<void>();
      const second = deferred<void>();
      const signOut = vi
        .fn()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise);
      const { result } = renderState(signedInClient({ signOut }));
      await waitFor(() =>
        expect(result.current.session.status).toBe("signed-in"),
      );

      let calls: Promise<boolean>[] = [];
      act(() => {
        calls = [result.current.signOut(), result.current.signOut()];
      });
      await act(async () => {
        first.resolve();
        second.reject(new Error("offline"));
        await Promise.all(calls);
      });

      expect(result.current.session.status).toBe("signed-out");
    });
  });
});
