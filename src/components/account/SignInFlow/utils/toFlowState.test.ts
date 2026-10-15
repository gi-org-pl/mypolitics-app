import { describe, expect, it } from "vitest";

import { toFlowState } from "./toFlowState";

describe("toFlowState()", () => {
  describe("given a new account", () => {
    it("opens the step with the pending sign-up, not saving", () => {
      const signUp = {
        id: "pending-1",
        provider: "x" as const,
        suggestedName: "Ala",
      };

      expect(toFlowState({ kind: "new-account", signUp })).toEqual({
        step: "setup",
        signUp,
        isSaving: false,
        hasSaveFailed: false,
      });
    });
  });

  describe("given an address that belongs to another provider's account", () => {
    it("shows the account-exists view, not waiting", () => {
      expect(
        toFlowState({
          kind: "account-exists",
          pendingId: "pending-2",
          provider: "facebook",
          ownerProvider: "google",
          email: "ala@example.com",
        }),
      ).toEqual({
        step: "account-exists",
        pendingId: "pending-2",
        provider: "facebook",
        ownerProvider: "google",
        email: "ala@example.com",
        isWaiting: false,
      });
    });
  });

  describe.each([
    "window-closed",
    "provider-failed",
  ] as const)("given %s", (kind) => {
    it("returns to the providers with that error", () => {
      expect(toFlowState({ kind, provider: "google" })).toEqual({
        step: "choose",
        error: { kind, provider: "google" },
      });
    });
  });

  describe.each(["failed", "link-failed"] as const)("given %s", (kind) => {
    it("returns to the providers with the failed error", () => {
      expect(toFlowState({ kind })).toEqual({
        step: "choose",
        error: { kind: "failed" },
      });
    });
  });
});
