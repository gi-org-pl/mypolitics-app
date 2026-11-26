import type { MockAuthAccount } from "@/services/auth/schemas/mockAuthState";
import type { AuthAccount, IdentityProvider } from "@/types/auth";

// An account of the stand-in as the app sees it: signed in with one of its
// providers.
export const toAccount = (
  account: MockAuthAccount,
  provider: IdentityProvider,
): AuthAccount => ({
  id: account.id,
  displayName: account.displayName,
  email: account.email,
  provider,
});
