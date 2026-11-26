import { describe, expect, it } from "vitest";

import {
  mockAuthAccountSchema,
  mockAuthProviderSchema,
  mockAuthStateSchema,
} from "./mockAuthState";

const ACCOUNT = {
  id: "mock-account-1",
  displayName: "Ala",
  email: "ala@example.com",
  providers: ["google"],
};

describe("mockAuthProviderSchema", () => {
  it.each(["google", "facebook", "x"])("takes %s", (provider) => {
    expect(mockAuthProviderSchema.parse(provider)).toBe(provider);
  });

  it("refuses a provider the app does not know", () => {
    expect(mockAuthProviderSchema.safeParse("github").success).toBe(false);
  });
});

describe("mockAuthAccountSchema", () => {
  it("takes an account with an address", () => {
    expect(mockAuthAccountSchema.parse(ACCOUNT)).toEqual(ACCOUNT);
  });

  it("takes an account without an address", () => {
    const account = {
      id: "mock-account-2",
      displayName: "Ola",
      providers: ["x"],
    };

    expect(mockAuthAccountSchema.parse(account)).toEqual(account);
  });

  it("refuses an account with a provider the app does not know", () => {
    expect(
      mockAuthAccountSchema.safeParse({ ...ACCOUNT, providers: ["github"] })
        .success,
    ).toBe(false);
  });
});

describe("mockAuthStateSchema", () => {
  describe("given a state with accounts only", () => {
    it("fills in nothing pending, nothing completed and the first identifier, and no session", () => {
      expect(mockAuthStateSchema.parse({ accounts: [ACCOUNT] })).toEqual({
        accounts: [ACCOUNT],
        pendingSignUps: {},
        pendingLinks: {},
        completed: {},
        nextId: 1,
      });
    });
  });

  describe("given a full state", () => {
    it("keeps every part of it", () => {
      const state = {
        accounts: [ACCOUNT],
        session: { accountId: ACCOUNT.id, provider: "google" },
        pendingSignUps: {
          "pending-1": { provider: "x", suggestedName: "Ala Nowak" },
        },
        pendingLinks: {
          "pending-2": {
            provider: "facebook",
            ownerProvider: "google",
            accountId: ACCOUNT.id,
          },
        },
        completed: {
          "pending-0": { accountId: ACCOUNT.id, provider: "google" },
        },
        nextId: 3,
      };

      expect(mockAuthStateSchema.parse(state)).toEqual(state);
    });
  });

  describe("given a value that is not a state of the stand-in", () => {
    it.each([
      ["nothing", null],
      ["text", "signed in"],
      ["no accounts", {}],
      [
        "a pending link without its owner",
        {
          accounts: [],
          pendingLinks: { "pending-1": { provider: "x", accountId: "a" } },
        },
      ],
    ])("refuses %s", (_name, value) => {
      expect(mockAuthStateSchema.safeParse(value).success).toBe(false);
    });
  });
});
