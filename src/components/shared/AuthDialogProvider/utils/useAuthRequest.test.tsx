import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/types/auth";
import { AuthSessionContext } from "@/utils/auth/authSessionContext";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createSessionValue } from "@/utils/vitest/auth/renderWithSession";

import { useAuthRequest } from "./useAuthRequest";

const SIGNED_IN: AuthSession = {
  status: "signed-in",
  account: createAuthAccount(),
};

// The hook under a session that a test can change.
const renderRequest = (initial: AuthSession) => {
  let session = initial;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthSessionContext value={createSessionValue({ session })}>
      {children}
    </AuthSessionContext>
  );
  const hook = renderHook(() => useAuthRequest(), { wrapper });

  return {
    ...hook,
    setSession: (next: AuthSession) => {
      session = next;
      hook.rerender();
    },
  };
};

describe("useAuthRequest()", () => {
  describe("given a signed-in session", () => {
    it("runs the action at once and opens nothing", () => {
      const action = vi.fn();
      const { result } = renderRequest(SIGNED_IN);

      act(() => result.current.requireAuth("create-quiz", action));

      expect(action).toHaveBeenCalledOnce();
      expect(result.current.request).toBeNull();
    });
  });

  describe("given a signed-out session", () => {
    it("opens a request for the intent and runs nothing yet", () => {
      const action = vi.fn();
      const { result } = renderRequest({ status: "signed-out" });

      act(() => result.current.requireAuth("create-quiz", action));

      expect(result.current.request).toMatchObject({ intent: "create-quiz" });
      expect(action).not.toHaveBeenCalled();
    });

    it("runs the action once when the session turns signed in", () => {
      const action = vi.fn();
      const { result, setSession } = renderRequest({ status: "signed-out" });
      act(() => result.current.requireAuth("create-quiz", action));

      act(() => setSession(SIGNED_IN));
      act(() => setSession(SIGNED_IN));

      expect(action).toHaveBeenCalledOnce();
      expect(result.current.request).toBeNull();
    });

    it("ignores a second request while one is open", () => {
      const first = vi.fn();
      const second = vi.fn();
      const { result, setSession } = renderRequest({ status: "signed-out" });

      act(() => {
        result.current.requireAuth("create-quiz", first);
        result.current.requireAuth("create-quiz", second);
      });
      act(() => setSession(SIGNED_IN));

      expect(first).toHaveBeenCalledOnce();
      expect(second).not.toHaveBeenCalled();
    });

    it("drops the request on cancel, calls its onCancel and never runs the action", () => {
      const action = vi.fn();
      const onCancel = vi.fn();
      const { result, setSession } = renderRequest({ status: "signed-out" });
      act(() =>
        result.current.requireAuth("create-quiz", action, { onCancel }),
      );

      act(() => result.current.cancel());
      act(() => setSession(SIGNED_IN));

      expect(onCancel).toHaveBeenCalledOnce();
      expect(action).not.toHaveBeenCalled();
      expect(result.current.request).toBeNull();
    });

    it("does nothing on cancel when nothing is open", () => {
      const { result } = renderRequest({ status: "signed-out" });

      act(() => result.current.cancel());

      expect(result.current.request).toBeNull();
    });
  });

  describe("given the session is not known yet", () => {
    it("opens the request, and runs the action when the session turns out signed in", () => {
      const action = vi.fn();
      const { result, setSession } = renderRequest({ status: "unknown" });

      act(() => result.current.requireAuth("create-quiz", action));
      expect(result.current.request).not.toBeNull();

      act(() => setSession(SIGNED_IN));

      expect(action).toHaveBeenCalledOnce();
    });
  });
});
