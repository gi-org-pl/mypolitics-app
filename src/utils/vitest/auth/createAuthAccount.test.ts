import { describe, expect, it } from "vitest";

import { createAuthAccount } from "./createAuthAccount";

describe("createAuthAccount()", () => {
  describe("given nothing", () => {
    it("is a Google account of Ala Nowak with an address", () => {
      expect(createAuthAccount()).toEqual({
        id: "account-1",
        displayName: "Ala Nowak",
        email: "ala.nowak@example.com",
        provider: "google",
      });
    });
  });

  describe("given overrides", () => {
    it("takes them over the defaults", () => {
      expect(
        createAuthAccount({ provider: "x", email: undefined }),
      ).toMatchObject({ provider: "x", email: undefined, id: "account-1" });
    });
  });
});
