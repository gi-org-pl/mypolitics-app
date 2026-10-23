import { z } from "zod";

import type {
  AuthAccount,
  AuthClient,
  IdentityProvider,
  SignInOptions,
  SignInOutcome,
} from "@/types/auth";
import type { TextStorage } from "@/types/storage";
import { getSafeSessionStorage } from "@/utils/storage/getSafeSessionStorage";
import { toJsonStorage } from "@/utils/storage/toJsonStorage";

// A stand-in for the accounts API, which does not exist yet. It behaves as
// the sign-in spec says the API will - a pending sign-up that becomes an
// account only when completed, no merging on the address, a pending link
// bound to the account the address belongs to, every pending operation named
// by its own identifier - but it contacts no provider and no server. Its
// accounts and its session live in the tab's storage, so a refresh keeps the
// person signed in for the tab. It is for development builds, stories and
// tests only.

export type MockSignInBehaviour =
  | "auto" // signed in when the provider has an account, otherwise a new account
  | "window-closed"
  | "provider-failed"
  | "failed"
  | { accountExists: IdentityProvider }; // the address belongs to that provider's account

export interface MockAuthClientOptions {
  storage?: TextStorage; // default: the tab's session storage, or memory
  delayMs?: number; // how long the pretend provider window stays open
  outcomes?: Partial<Record<IdentityProvider, MockSignInBehaviour>>;
  failCompleteSignUp?: boolean;
}

export const MOCK_AUTH_STORAGE_KEY = "mypolitics.mock-auth";

const DEFAULT_DELAY_MS = 600;

// What each pretend provider says about the person. Fictional; X gives no
// address, as it often does not.
const MOCK_PROFILES: Record<
  IdentityProvider,
  { suggestedName: string; email?: string }
> = {
  google: { suggestedName: "Ala Nowak", email: "ala.nowak@example.com" },
  facebook: { suggestedName: "Ala Nowak", email: "ala.nowak@example.com" },
  x: { suggestedName: "Ala Nowak" },
};

const providerSchema = z.enum(["google", "facebook", "x"]);

const stateSchema = z.object({
  accounts: z.array(
    z.object({
      id: z.string(),
      displayName: z.string(),
      email: z.string().optional(),
      providers: z.array(providerSchema),
    }),
  ),
  session: z
    .object({ accountId: z.string(), provider: providerSchema })
    .optional(),
  pendingSignUps: z
    .record(
      z.string(),
      z.object({
        provider: providerSchema,
        suggestedName: z.string().optional(),
        email: z.string().optional(),
      }),
    )
    .default({}),
  pendingLinks: z
    .record(
      z.string(),
      z.object({
        provider: providerSchema,
        ownerProvider: providerSchema,
        accountId: z.string(),
      }),
    )
    .default({}),
  // Completed sign-ups, so a repeated completion answers with its account.
  completed: z
    .record(
      z.string(),
      z.object({ accountId: z.string(), provider: providerSchema }),
    )
    .default({}),
  nextId: z.number().default(1),
});

type MockState = z.infer<typeof stateSchema>;
type MockAccount = MockState["accounts"][number];

const createEmptyState = (): MockState => stateSchema.parse({ accounts: [] });

const createMemoryStorage = (): TextStorage => {
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

// Keeps every value in memory as well as in the storage it is given, and
// reads from memory first: a storage that refuses a write - full, or limited
// by the browser's privacy settings - then loses nothing for this client.
const withMemory = (storage: TextStorage): TextStorage => {
  const memory = createMemoryStorage();

  return {
    getItem: (key) => memory.getItem(key) ?? storage.getItem(key),
    setItem: (key, value) => {
      memory.setItem(key, value);
      storage.setItem(key, value);
    },
    removeItem: (key) => {
      memory.removeItem(key);
      storage.removeItem(key);
    },
  };
};

// Waits, or stops early with false when the signal is aborted.
const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<boolean>((resolve) => {
    if (signal?.aborted) {
      resolve(false);
      return;
    }

    const timer = setTimeout(() => resolve(true), ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });

const toAccount = (
  account: MockAccount,
  provider: IdentityProvider,
): AuthAccount => ({
  id: account.id,
  displayName: account.displayName,
  email: account.email,
  provider,
});

const without = <Value>(record: Record<string, Value>, key: string) =>
  Object.fromEntries(Object.entries(record).filter(([id]) => id !== key));

export const createMockAuthClient = ({
  storage = getSafeSessionStorage() ?? createMemoryStorage(),
  delayMs = DEFAULT_DELAY_MS,
  outcomes = {},
  failCompleteSignUp = false,
}: MockAuthClientOptions = {}): AuthClient => {
  const store = toJsonStorage<unknown>(withMemory(storage));

  const read = (): MockState => {
    const parsed = stateSchema.safeParse(store.getItem(MOCK_AUTH_STORAGE_KEY));

    return parsed.success ? parsed.data : createEmptyState();
  };

  const write = (state: MockState) =>
    store.setItem(MOCK_AUTH_STORAGE_KEY, state);

  const findAccount = (state: MockState, provider: IdentityProvider) =>
    state.accounts.find((account) => account.providers.includes(provider));

  const signedIn = (
    state: MockState,
    account: MockAccount,
    provider: IdentityProvider,
  ): Extract<SignInOutcome, { kind: "signed-in" }> => {
    write({ ...state, session: { accountId: account.id, provider } });

    return { kind: "signed-in", account: toAccount(account, provider) };
  };

  // The owner's sign-in after account-exists: it links the waiting provider
  // to the very account the address belongs to, or does nothing at all.
  const signInToLink = (
    state: MockState,
    provider: IdentityProvider,
    pendingId: string,
  ): SignInOutcome => {
    const link = state.pendingLinks[pendingId];
    const linked = findAccount(state, provider);
    const pendingLinks = without(state.pendingLinks, pendingId);

    if (
      !link ||
      link.ownerProvider !== provider ||
      linked?.id !== link.accountId
    ) {
      write({ ...state, pendingLinks });

      return { kind: "link-failed" };
    }

    const account = linked.providers.includes(link.provider)
      ? linked
      : { ...linked, providers: [...linked.providers, link.provider] };
    const accounts = state.accounts.map((item) =>
      item.id === account.id ? account : item,
    );

    return signedIn({ ...state, accounts, pendingLinks }, account, provider);
  };

  const signIn = async (
    provider: IdentityProvider,
    options: SignInOptions = {},
  ): Promise<SignInOutcome> => {
    // An aborted sign-in is a closed window that changed nothing.
    if (!(await wait(delayMs, options.signal))) {
      return { kind: "window-closed", provider };
    }

    const behaviour = outcomes[provider] ?? "auto";

    if (behaviour === "failed") return { kind: "failed" };
    if (behaviour === "window-closed" || behaviour === "provider-failed") {
      return { kind: behaviour, provider };
    }

    const state = read();

    if (options.link) return signInToLink(state, provider, options.link);

    const linked = findAccount(state, provider);
    if (linked) return signedIn(state, linked, provider);

    const id = `pending-${state.nextId}`;
    const nextId = state.nextId + 1;
    const profile = MOCK_PROFILES[provider];

    if (typeof behaviour === "object") {
      const owner = behaviour.accountExists;
      const email = profile.email ?? MOCK_PROFILES.google.email ?? "";
      const ownerAccount = findAccount(state, owner) ?? {
        id: `mock-${owner}`,
        displayName: MOCK_PROFILES[owner].suggestedName,
        email,
        providers: [owner],
      };
      const accounts = state.accounts.includes(ownerAccount)
        ? state.accounts
        : [...state.accounts, ownerAccount];

      write({
        ...state,
        accounts,
        nextId,
        pendingLinks: {
          ...state.pendingLinks,
          [id]: { provider, ownerProvider: owner, accountId: ownerAccount.id },
        },
      });

      return {
        kind: "account-exists",
        pendingId: id,
        provider,
        ownerProvider: owner,
        email,
      };
    }

    const signUp = {
      provider,
      suggestedName: profile.suggestedName,
      email: profile.email,
    };

    write({
      ...state,
      nextId,
      pendingSignUps: { ...state.pendingSignUps, [id]: signUp },
    });

    return { kind: "new-account", signUp: { id, ...signUp } };
  };

  return {
    getSession: async () => {
      const state = read();
      const account = state.accounts.find(
        (item) => item.id === state.session?.accountId,
      );

      return account && state.session
        ? toAccount(account, state.session.provider)
        : null;
    },
    signIn,
    resumeSignIn: async () => null, // the stand-in never leaves the page
    completeSignUp: async (pendingId, setup) => {
      await wait(delayMs);

      const state = read();
      const done = state.completed[pendingId];
      const doneAccount = state.accounts.find(
        (item) => item.id === done?.accountId,
      );

      if (done && doneAccount) {
        return signedIn(state, doneAccount, done.provider);
      }

      const pending = state.pendingSignUps[pendingId];

      if (!pending) return { kind: "expired" };
      if (failCompleteSignUp) return { kind: "failed" };

      const account: MockAccount = {
        id: `mock-account-${state.nextId}`,
        displayName: setup.displayName,
        email: pending.email,
        providers: [pending.provider],
      };

      write({
        ...state,
        accounts: [...state.accounts, account],
        nextId: state.nextId + 1,
        pendingSignUps: without(state.pendingSignUps, pendingId),
        completed: {
          ...state.completed,
          [pendingId]: { accountId: account.id, provider: pending.provider },
        },
        session: { accountId: account.id, provider: pending.provider },
      });

      return {
        kind: "signed-in",
        account: toAccount(account, pending.provider),
      };
    },
    cancelPending: async (pendingId) => {
      const state = read();

      write({
        ...state,
        pendingSignUps: without(state.pendingSignUps, pendingId),
        pendingLinks: without(state.pendingLinks, pendingId),
      });
    },
    signOut: async () => {
      write({ ...read(), session: undefined });
    },
  };
};
