import { afterEach, describe, expect, it, vi } from "vitest";

import type { AccountSetup, AuthClient, SignInOutcome } from "@/types/auth";
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

const pendingIdOf = (outcome: SignInOutcome) => {
  if (outcome.kind === "new-account") return outcome.signUp.id;
  if (outcome.kind === "account-exists") return outcome.pendingId;
  throw new Error(`No pending operation in ${outcome.kind}`);
};

// A sign-up from the first press to the account.
const signUp = async (client: AuthClient, provider: "google" | "x") => {
  const outcome = await client.signIn(provider);
  return client.completeSignUp(pendingIdOf(outcome), SETUP);
};

describe("createMockAuthClient()", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe("given a provider with no account", () => {
    it("answers with a new account, its own identifier and the suggested name", async () => {
      const outcome = await createClient().signIn("google");

      expect(outcome).toEqual({
        kind: "new-account",
        signUp: {
          id: expect.any(String),
          provider: "google",
          suggestedName: "Ala Nowak",
          email: "ala.nowak@example.com",
        },
      });
    });

    it("gives no address for X", async () => {
      const outcome = await createClient().signIn("x");

      expect(outcome).toMatchObject({ signUp: { provider: "x" } });
      expect(outcome.kind === "new-account" && outcome.signUp.email).toBe(
        undefined,
      );
    });

    it("has no session until the sign-up is completed", async () => {
      const client = createClient();

      await client.signIn("google");

      expect(await client.getSession()).toBeNull();
    });

    it("gives two sign-ups two identifiers", async () => {
      const client = createClient();

      const first = pendingIdOf(await client.signIn("google"));
      const second = pendingIdOf(await client.signIn("x"));

      expect(first).not.toBe(second);
    });
  });

  describe("given a pending sign-up", () => {
    it("saves the account with the chosen name and signs in", async () => {
      const client = createClient();

      const outcome = await signUp(client, "google");

      expect(outcome).toMatchObject({
        kind: "signed-in",
        account: {
          displayName: "Ala",
          email: "ala.nowak@example.com",
          provider: "google",
        },
      });
      expect(await client.getSession()).toEqual(
        outcome.kind === "signed-in" ? outcome.account : null,
      );
    });

    it("answers with the same account when completed again", async () => {
      const client = createClient();
      const id = pendingIdOf(await client.signIn("google"));

      const first = await client.completeSignUp(id, SETUP);
      const again = await client.completeSignUp(id, SETUP);

      expect(again).toEqual(first);
    });

    it("completes only the sign-up it names", async () => {
      const client = createClient();
      const google = pendingIdOf(await client.signIn("google"));
      await client.signIn("x");

      const outcome = await client.completeSignUp(google, SETUP);

      expect(outcome).toMatchObject({ account: { provider: "google" } });
    });

    it("answers failed when told to, and starts no session", async () => {
      const client = createClient({ failCompleteSignUp: true });

      expect(await signUp(client, "google")).toEqual({ kind: "failed" });
      expect(await client.getSession()).toBeNull();
    });

    it("forgets it when cancelled, so completing it has expired", async () => {
      const client = createClient();
      const id = pendingIdOf(await client.signIn("google"));

      await client.cancelPending(id);

      expect(await client.completeSignUp(id, SETUP)).toEqual({
        kind: "expired",
      });
    });

    it("keeps another sign-up when one is cancelled", async () => {
      const client = createClient();
      const google = pendingIdOf(await client.signIn("google"));
      const x = pendingIdOf(await client.signIn("x"));

      await client.cancelPending(google);

      expect((await client.completeSignUp(x, SETUP)).kind).toBe("signed-in");
    });
  });

  describe("given an unknown identifier", () => {
    it("answers expired to completing it", async () => {
      expect(await createClient().completeSignUp("unknown", SETUP)).toEqual({
        kind: "expired",
      });
    });
  });

  describe("given a saved account", () => {
    it("signs straight in with its provider the next time", async () => {
      const client = createClient();
      await signUp(client, "google");
      await client.signOut();

      const outcome = await client.signIn("google");

      expect(outcome.kind).toBe("signed-in");
      expect(await client.getSession()).toMatchObject({ displayName: "Ala" });
    });

    it("has no session after signing out", async () => {
      const client = createClient();
      await signUp(client, "google");

      await client.signOut();

      expect(await client.getSession()).toBeNull();
    });
  });

  describe("given an address that belongs to another provider's account", () => {
    const outcomes = { facebook: { accountExists: "google" as const } };

    it("names the owning provider, the address and the pending link", async () => {
      const client = createClient({ outcomes });

      expect(await client.signIn("facebook")).toEqual({
        kind: "account-exists",
        pendingId: expect.any(String),
        provider: "facebook",
        ownerProvider: "google",
        email: "ala.nowak@example.com",
      });
    });

    it("links the waiting provider when the owner signs in to link", async () => {
      const client = createClient({ outcomes });
      const link = pendingIdOf(await client.signIn("facebook"));

      const owner = await client.signIn("google", { link });
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

    it("fails the link when the pending link was cancelled", async () => {
      const client = createClient({ outcomes });
      const link = pendingIdOf(await client.signIn("facebook"));
      await client.cancelPending(link);

      expect(await client.signIn("google", { link })).toEqual({
        kind: "link-failed",
      });
      expect(await client.getSession()).toBeNull();
    });

    it("fails the link when another provider than the owner signs in to link", async () => {
      const client = createClient({ outcomes });
      const link = pendingIdOf(await client.signIn("facebook"));

      expect(await client.signIn("x", { link })).toEqual({
        kind: "link-failed",
      });
    });

    it("links nothing on a plain sign-in of the owner", async () => {
      const client = createClient({ outcomes });
      await client.signIn("facebook");
      await client.signIn("google");
      await client.signOut();

      expect((await client.signIn("facebook")).kind).toBe("account-exists");
    });

    it("keeps an account the owner already has", async () => {
      const client = createClient({ outcomes });
      await signUp(client, "google");
      await client.signOut();

      const link = pendingIdOf(await client.signIn("facebook"));
      const owner = await client.signIn("google", { link });

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
      expect(await client.completeSignUp("pending-1", SETUP)).toEqual({
        kind: "expired",
      });
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

      expect(await signUp(client, "google")).toMatchObject({
        kind: "signed-in",
      });
    });
  });

  describe("given no storage is passed", () => {
    it("keeps the session in the storage of the tab", async () => {
      await signUp(createMockAuthClient({ delayMs: 0 }), "google");

      const again = createMockAuthClient({ delayMs: 0 });

      expect(await again.getSession()).toMatchObject({ displayName: "Ala" });
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
        await signUp(client, "google");

        expect(await client.getSession()).toMatchObject({ displayName: "Ala" });
        await client.signOut();
        expect(await client.getSession()).toBeNull();
      } finally {
        if (original) {
          Object.defineProperty(globalThis, "sessionStorage", original);
        }
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
