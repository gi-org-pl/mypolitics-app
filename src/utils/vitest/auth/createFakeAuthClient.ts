import { vi } from "vitest";

import type { AuthClient } from "@/types/auth";

// An AuthClient whose every call is a mock: signed out, and every other call
// settles with nothing in particular. A test replaces what it needs.
export const createFakeAuthClient = (
  overrides: Partial<AuthClient> = {},
): AuthClient => ({
  getSession: vi.fn<AuthClient["getSession"]>().mockResolvedValue(null),
  signIn: vi.fn<AuthClient["signIn"]>().mockResolvedValue({ kind: "failed" }),
  resumeSignIn: vi.fn<AuthClient["resumeSignIn"]>().mockResolvedValue(null),
  completeSignUp: vi
    .fn<AuthClient["completeSignUp"]>()
    .mockResolvedValue({ kind: "failed" }),
  cancelPending: vi
    .fn<AuthClient["cancelPending"]>()
    .mockResolvedValue(undefined),
  signOut: vi.fn<AuthClient["signOut"]>().mockResolvedValue(undefined),
  ...overrides,
});
