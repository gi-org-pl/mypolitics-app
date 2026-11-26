import { render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthDialogContext } from "./authDialogContext";
import { useRequireAuth } from "./useRequireAuth";

const Probe = () => {
  useRequireAuth();

  return null;
};

describe("useRequireAuth()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("given an AuthDialogProvider around it", () => {
    it("answers with the provider's requireAuth", () => {
      const requireAuth = vi.fn();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthDialogContext value={requireAuth}>{children}</AuthDialogContext>
      );

      const { result } = renderHook(() => useRequireAuth(), { wrapper });

      expect(result.current).toBe(requireAuth);
    });
  });

  describe("given no AuthDialogProvider around it", () => {
    it("throws an error that names the provider", () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);

      expect(() => render(<Probe />)).toThrow(
        "useRequireAuth is used outside AuthDialogProvider",
      );
    });
  });
});
