import { z } from "zod";

import type {
  AuthAccount,
  AuthClient,
  IdentityProvider,
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
  pendingLink: z.object({ provider: providerSchema }).optional(),
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

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
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
  const store = toJsonStorage<unknown>(storage);

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

  const signIn = async (provider: IdentityProvider): Promise<SignInOutcome> => {
    await wait(delayMs);

    const behaviour = outcomes[provider] ?? "auto";

    if (behaviour === "failed") return { kind: "failed" };
    if (behaviour === "window-closed" || behaviour === "provider-failed") {
      return { kind: behaviour, provider };
    }

    const state = read();
    const linked = findAccount(state, provider);

    if (linked) {
      // Signing in with the owner of an account links the provider that was
      // waiting for it, so either works from now on.
      const pending = state.pendingLink?.provider;
      const account =
        pending && !linked.providers.includes(pending)
          ? { ...linked, providers: [...linked.providers, pending] }
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
        pendingLink: { provider },
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
