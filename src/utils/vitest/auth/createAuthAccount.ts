import type { AuthAccount } from "@/types/auth";

// A signed-in account for tests, with the fields a test cares about.
export const createAuthAccount = (
  overrides: Partial<AuthAccount> = {},
): AuthAccount => ({
  id: "account-1",
  displayName: "Ala Nowak",
  email: "ala.nowak@example.com",
  provider: "google",
  ...overrides,
});
