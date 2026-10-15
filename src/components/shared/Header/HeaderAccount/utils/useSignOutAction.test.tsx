import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { AuthSessionValue } from "@/types/auth";
import { AuthSessionContext } from "@/utils/auth/authSessionContext";
import { createSessionValue } from "@/utils/vitest/auth/renderWithSession";

import { useSignOutAction } from "./useSignOutAction";

const renderAction = (value: AuthSessionValue, onSignedOut = vi.fn()) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthSessionContext value={value}>{children}</AuthSessionContext>
  );

  return {
    onSignedOut,
    ...renderHook(() => useSignOutAction(onSignedOut), { wrapper }),
  };
};

describe("useSignOutAction()", () => {
  describe("given the session ends", () => {
    it("calls onSignedOut and reports no failure", async () => {
      const { result, onSignedOut } = renderAction(createSessionValue());

      await act(() => result.current.signOut());

      expect(onSignedOut).toHaveBeenCalledOnce();
      expect(result.current.hasFailed).toBe(false);
    });
  });

  describe("given the session could not be ended", () => {
    it("reports the failure, and clears it on the next attempt", async () => {
      const signOut = vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      const { result, onSignedOut } = renderAction(
        createSessionValue({ signOut }),
      );

      await act(() => result.current.signOut());
      expect(result.current.hasFailed).toBe(true);
      expect(onSignedOut).not.toHaveBeenCalled();

      await act(() => result.current.signOut());
      expect(result.current.hasFailed).toBe(false);
    });
  });

  describe("given no onSignedOut", () => {
    it("still signs out", async () => {
      const value = createSessionValue();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthSessionContext value={value}>{children}</AuthSessionContext>
      );
      const { result } = renderHook(() => useSignOutAction(), { wrapper });

      await act(() => result.current.signOut());

      expect(value.signOut).toHaveBeenCalledOnce();
    });
  });
});
