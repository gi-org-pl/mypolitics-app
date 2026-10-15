import { describe, expect, it } from "vitest";

import { toPanelView } from "./toPanelView";

describe("toPanelView()", () => {
  describe("given the choose state", () => {
    it("passes the waiting provider and the error on", () => {
      expect(
        toPanelView({
          step: "choose",
          waitingFor: "google",
          error: { kind: "failed" },
        }),
      ).toEqual({
        kind: "choose",
        waitingFor: "google",
        error: { kind: "failed" },
      });
    });
  });

  describe("given the account-exists state", () => {
    it("passes the providers, the address and the wait on", () => {
      expect(
        toPanelView({
          step: "account-exists",
          provider: "facebook",
          ownerProvider: "google",
          email: "ala@example.com",
          isWaiting: true,
        }),
      ).toEqual({
        kind: "account-exists",
        provider: "facebook",
        ownerProvider: "google",
        email: "ala@example.com",
        isWaiting: true,
      });
    });
  });
});
