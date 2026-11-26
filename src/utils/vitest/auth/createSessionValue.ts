import { vi } from "vitest";

import type { AuthSession, AuthSessionValue } from "@/types/auth";

import { createFakeAuthClient } from "./createFakeAuthClient";

// A session context for tests of what reads the session: the client, the
// session and mocks for the ways to change it.
export const createSessionValue = (
  overrides: Partial<AuthSessionValue> = {},
): AuthSessionValue => ({
  session: { status: "signed-out" } as AuthSession,
  client: createFakeAuthClient(),
  setSignedIn: vi.fn(),
  signOut: vi.fn().mockResolvedValue(true),
  refresh: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});
