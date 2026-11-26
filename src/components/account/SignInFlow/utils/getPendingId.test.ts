import { describe, expect, it } from "vitest";

import { getPendingId } from "./getPendingId";

describe("getPendingId()", () => {
  describe("given a state of the flow", () => {
    it("names the sign-up of the step and the link of account-exists", () => {
      expect(
        getPendingId({
          step: "setup",
          signUp: { id: "sign-up-1", provider: "google" },
          isSaving: false,
          hasSaveFailed: false,
        }),
      ).toBe("sign-up-1");
      expect(
        getPendingId({
          step: "account-exists",
          pendingId: "link-1",
          provider: "facebook",
          ownerProvider: "google",
          email: "ala@example.com",
          isWaiting: false,
        }),
      ).toBe("link-1");
    });

    it("names nothing for the providers and the resume", () => {
      expect(getPendingId({ step: "choose" })).toBeUndefined();
      expect(getPendingId({ step: "resuming" })).toBeUndefined();
    });
  });

  describe("given an outcome", () => {
    it("names the sign-up of a new account and the link of account-exists", () => {
      expect(
        getPendingId({
          kind: "new-account",
          signUp: { id: "sign-up-2", provider: "x" },
        }),
      ).toBe("sign-up-2");
      expect(
        getPendingId({
          kind: "account-exists",
          pendingId: "link-2",
          provider: "facebook",
          ownerProvider: "google",
          email: "ala@example.com",
        }),
      ).toBe("link-2");
    });

    it("names nothing for the others", () => {
      expect(getPendingId({ kind: "failed" })).toBeUndefined();
    });
  });
});
