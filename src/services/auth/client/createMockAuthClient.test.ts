import { afterEach, describe, expect, it, vi } from "vitest";

import type { AccountSetup } from "@/types/auth";
import type { TextStorage } from "@/types/storage";
import { safely } from "@/utils/function/safely";

import {
  createMockAuthClient,
  MOCK_AUTH_STORAGE_KEY,
} from "./createMockAuthClient";

const SETUP: AccountSetup = {
  displayName: "Ala",
  isAgeDeclared: true,
  hasAcceptedTerms: true,
};

const createStorage = (): TextStorage => {
  const items = new Map<string, string>();

  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
  };
};

// The storage as the app hands it over: calls that never throw.
const getSafeStorage = (storage: TextStorage): TextStorage => ({
  getItem: (key) => safely(() => storage.getItem(key), null),
  setItem: (key, value) => safely(() => storage.setItem(key, value), undefined),
  removeItem: (key) => safely(() => storage.removeItem(key), undefined),
});

const createClient = (
  options: Parameters<typeof createMockAuthClient>[0] = {},
) => createMockAuthClient({ storage: createStorage(), delayMs: 0, ...options });

describe("createMockAuthClient()", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe("given a provider with no account", () => {
    it("answers with a new account and the provider's suggested name", async () => {
      const outcome = await createClient().signIn("google");

      expect(outcome).toEqual({
        kind: "new-account",
        signUp: {
          provider: "google",
          suggestedName: "Ala Nowak",
          email: "ala.nowak@example.com",
        },
      });
    });

    it("gives no address for X", async () => {
      const outcome = await createClient().signIn("x");

      expect(outcome).toEqual({
        kind: "new-account",
        signUp: { provider: "x", suggestedName: "Ala Nowak" },
      });
    });

    it("has no session until the sign-up is completed", async () => {
      const client = createClient();

      await client.signIn("google");

      expect(await client.getSession()).toBeNull();
    });
  });

  describe("given a pending sign-up", () => {
    it("saves the account with the chosen name and signs in", async () => {
      const client = createClient();
      await client.signIn("facebook");

      const outcome = await client.completeSignUp(SETUP);
      const account = {
        id: "mock-facebook",
        displayName: "Ala",
        email: "ala.nowak@example.com",
        provider: "facebook",
      };

      expect(outcome).toEqual({ kind: "signed-in", account });
      expect(await client.getSession()).toEqual(account);
    });

    it("answers failed when told to, and starts no session", async () => {
      const client = createClient({ failCompleteSignUp: true });
      await client.signIn("google");

      expect(await client.completeSignUp(SETUP)).toEqual({ kind: "failed" });
      expect(await client.getSession()).toBeNull();
    });

    it("forgets it when cancelled, so completing it has expired", async () => {
      const client = createClient();
      await client.signIn("google");

      await client.cancelPending();

      expect(await client.completeSignUp(SETUP)).toEqual({ kind: "expired" });
    });
  });

  describe("given no pending sign-up", () => {
    it("answers expired to completing one", async () => {
      expect(await createClient().completeSignUp(SETUP)).toEqual({
        kind: "expired",
      });
    });
  });

  describe("given a saved account", () => {
    it("signs straight in with its provider the next time", async () => {
      const client = createClient();
      await client.signIn("google");
      await client.completeSignUp(SETUP);
      await client.signOut();

      const outcome = await client.signIn("google");

      expect(outcome.kind).toBe("signed-in");
      expect(await client.getSession()).toMatchObject({ displayName: "Ala" });
    });

    it("has no session after signing out", async () => {
      const client = createClient();
      await client.signIn("google");
      await client.completeSignUp(SETUP);

      await client.signOut();

      expect(await client.getSession()).toBeNull();
    });
  });

  describe("given an address that belongs to another provider's account", () => {
    const outcomes = { facebook: { accountExists: "google" as const } };

    it("names the owning provider and the address", async () => {
      const client = createClient({ outcomes });

      expect(await client.signIn("facebook")).toEqual({
        kind: "account-exists",
        provider: "facebook",
        ownerProvider: "google",
        email: "ala.nowak@example.com",
      });
    });

    it("links the waiting provider once the owner signs in", async () => {
      const client = createClient({ outcomes });
      await client.signIn("facebook");

      const owner = await client.signIn("google");
      await client.signOut();
      const linked = await client.signIn("facebook");

      expect(owner).toMatchObject({
        kind: "signed-in",
        account: { id: "mock-google", provider: "google" },
      });
      expect(linked).toMatchObject({
        kind: "signed-in",
        account: { id: "mock-google", provider: "facebook" },
      });
    });

    it("links nothing when another provider's account signs in", async () => {
      const client = createClient({ outcomes });
      await client.signIn("x");
      await client.completeSignUp(SETUP);
      await client.signOut();
      await client.signIn("facebook");

      await client.signIn("x");
      await client.signOut();

      expect((await client.signIn("facebook")).kind).toBe("account-exists");
    });

    it("links nothing when the pending link is cancelled", async () => {
      const client = createClient({ outcomes });
      await client.signIn("facebook");
      await client.cancelPending();
      await client.signIn("google");
      await client.signOut();

      expect((await client.signIn("facebook")).kind).toBe("account-exists");
    });

    it("keeps an account the owner already has", async () => {
      const client = createClient({ outcomes });
      await client.signIn("google");
      await client.completeSignUp(SETUP);
      await client.signOut();

      await client.signIn("facebook");
      const owner = await client.signIn("google");

      expect(owner).toMatchObject({ account: { displayName: "Ala" } });
    });

    it("uses an address of its own when the provider gives none", async () => {
      const client = createClient({
        outcomes: { x: { accountExists: "google" } },
      });

      expect(await client.signIn("x")).toMatchObject({
        email: "ala.nowak@example.com",
      });
    });
  });

  describe("given a sign-in is aborted", () => {
    it("settles as a closed window and leaves nothing pending", async () => {
      const client = createClient({ delayMs: 1000 });
      const controller = new AbortController();
      const outcome = client.signIn("google", { signal: controller.signal });

      controller.abort();

      expect(await outcome).toEqual({
        kind: "window-closed",
        provider: "google",
      });
      expect(await client.completeSignUp(SETUP)).toEqual({ kind: "expired" });
    });

    it("settles at once when the signal was aborted before", async () => {
      const controller = new AbortController();
      controller.abort();

      expect(
        await createClient().signIn("x", { signal: controller.signal }),
      ).toEqual({ kind: "window-closed", provider: "x" });
    });
  });

  describe("given the stand-in never leaves the page", () => {
    it("has no sign-in to resume", async () => {
      expect(await createClient().resumeSignIn()).toBeNull();
    });
  });

  describe("given a failing behaviour", () => {
    it.each([
      ["window-closed", { kind: "window-closed", provider: "x" }],
      ["provider-failed", { kind: "provider-failed", provider: "x" }],
      ["failed", { kind: "failed" }],
    ] as const)("answers %s", async (behaviour, outcome) => {
      const client = createClient({ outcomes: { x: behaviour } });

      expect(await client.signIn("x")).toEqual(outcome);
    });
  });

  describe("given what is stored is not the stand-in's state", () => {
    it("starts from no accounts", async () => {
      const storage = createStorage();
      storage.setItem(MOCK_AUTH_STORAGE_KEY, '{"accounts":"none"}');
      const client = createMockAuthClient({ storage, delayMs: 0 });

      expect(await client.getSession()).toBeNull();
    });
  });

  describe("given no storage is passed", () => {
    it("keeps the session in the storage of the tab", async () => {
      const client = createMockAuthClient({ delayMs: 0 });
      await client.signIn("google");
      await client.completeSignUp(SETUP);

      const again = createMockAuthClient({ delayMs: 0 });

      expect(await again.getSession()).toMatchObject({ displayName: "Ala" });
    });
  });

  describe("given a storage that refuses writes", () => {
    it("keeps the pending sign-up in memory", async () => {
      const refusing: TextStorage = {
        getItem: () => null,
        setItem: () => {
          throw new DOMException(
            "The quota has been exceeded.",
            "QuotaExceededError",
          );
        },
        removeItem: () => undefined,
      };
      const client = createMockAuthClient({
        storage: getSafeStorage(refusing),
        delayMs: 0,
      });
      await client.signIn("google");

      expect(await client.completeSignUp(SETUP)).toMatchObject({
        kind: "signed-in",
      });
    });
  });

  describe("given the tab has no storage", () => {
    it("keeps the session in memory", async () => {
      const original = Object.getOwnPropertyDescriptor(
        globalThis,
        "sessionStorage",
      );
      Object.defineProperty(globalThis, "sessionStorage", {
        configurable: true,
        get: () => {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });

      try {
        const client = createMockAuthClient({ delayMs: 0 });
        await client.signIn("google");
        await client.completeSignUp(SETUP);

        expect(await client.getSession()).toMatchObject({ displayName: "Ala" });
        await client.signOut();
        expect(await client.getSession()).toBeNull();
      } finally {
        if (original)
          Object.defineProperty(globalThis, "sessionStorage", original);
      }
    });
  });
  describe("given no delay is passed", () => {
    it("answers once the pretend provider window has been open a while", async () => {
      vi.useFakeTimers();

      try {
        let isSettled = false;
        const outcome = createMockAuthClient({ storage: createStorage() })
          .signIn("google")
          .finally(() => {
            isSettled = true;
          });

        await vi.advanceTimersByTimeAsync(500);
        expect(isSettled).toBe(false);
        await vi.advanceTimersByTimeAsync(100);

        expect((await outcome).kind).toBe("new-account");
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
