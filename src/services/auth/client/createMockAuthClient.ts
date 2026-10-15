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
// account only when completed, no merging on the address, a pending link -
// but it contacts no provider and no server. Its accounts and its session
// live in the tab's storage, so a refresh keeps the person signed in for the
// tab. It is for development builds, stories and tests only.

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
  pendingSignUp: z
    .object({
      provider: providerSchema,
      suggestedName: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  pendingLink: z
    .object({ provider: providerSchema, ownerProvider: providerSchema })
    .optional(),
});

type MockState = z.infer<typeof stateSchema>;
type MockAccount = MockState["accounts"][number];

const EMPTY_STATE: MockState = { accounts: [] };

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

export const createMockAuthClient = ({
  storage = getSafeSessionStorage() ?? createMemoryStorage(),
  delayMs = DEFAULT_DELAY_MS,
  outcomes = {},
  failCompleteSignUp = false,
}: MockAuthClientOptions = {}): AuthClient => {
  const store = toJsonStorage<unknown>(withMemory(storage));

  const read = (): MockState => {
    const parsed = stateSchema.safeParse(store.getItem(MOCK_AUTH_STORAGE_KEY));

    return parsed.success ? parsed.data : EMPTY_STATE;
  };

  const write = (state: MockState) =>
    store.setItem(MOCK_AUTH_STORAGE_KEY, state);

  const findAccount = (state: MockState, provider: IdentityProvider) =>
    state.accounts.find((account) => account.providers.includes(provider));

  const startSession = (
    state: MockState,
    account: MockAccount,
    provider: IdentityProvider,
  ): SignInOutcome => {
    write({
      ...state,
      session: { accountId: account.id, provider },
      pendingSignUp: undefined,
      pendingLink: undefined,
    });

    return { kind: "signed-in", account: toAccount(account, provider) };
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
    const linked = findAccount(state, provider);

    if (linked) {
      // Signing in with the provider that owns the address links the provider
      // that was waiting for it, so either works from now on. A sign-in with
      // any other provider links nothing.
      const link = state.pendingLink;
      const account =
        link?.ownerProvider === provider &&
        !linked.providers.includes(link.provider)
          ? { ...linked, providers: [...linked.providers, link.provider] }
          : linked;

      return startSession(
        {
          ...state,
          accounts: state.accounts.map((item) =>
            item.id === account.id ? account : item,
          ),
        },
        account,
        provider,
      );
    }

    const profile = MOCK_PROFILES[provider];

    if (typeof behaviour === "object") {
      const owner = behaviour.accountExists;
      const email = profile.email ?? MOCK_PROFILES.google.email ?? "";
      const accounts = findAccount(state, owner)
        ? state.accounts
        : [
            ...state.accounts,
            {
              id: `mock-${owner}`,
              displayName: MOCK_PROFILES[owner].suggestedName,
              email,
              providers: [owner],
            },
          ];

      write({
        ...state,
        accounts,
        pendingSignUp: undefined,
        pendingLink: { provider, ownerProvider: owner },
      });

      return { kind: "account-exists", provider, ownerProvider: owner, email };
    }

    const signUp = {
      provider,
      suggestedName: profile.suggestedName,
      email: profile.email,
    };

    write({ ...state, pendingSignUp: signUp, pendingLink: undefined });

    return { kind: "new-account", signUp };
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
    completeSignUp: async (setup) => {
      await wait(delayMs);

      const state = read();
      const pending = state.pendingSignUp;

      if (!pending) return { kind: "expired" };
      if (failCompleteSignUp) return { kind: "failed" };

      const account: MockAccount = {
        id: `mock-${pending.provider}`,
        displayName: setup.displayName,
        email: pending.email,
        providers: [pending.provider],
      };

      write({
        accounts: [...state.accounts, account],
        session: { accountId: account.id, provider: pending.provider },
      });

      return {
        kind: "signed-in",
        account: toAccount(account, pending.provider),
      };
    },
    cancelPending: async () => {
      write({ ...read(), pendingSignUp: undefined, pendingLink: undefined });
    },
    signOut: async () => {
      write({ ...read(), session: undefined });
    },
  };
};
