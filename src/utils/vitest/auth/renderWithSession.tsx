import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

import type { AuthSession, AuthSessionValue } from "@/types/auth";
import { AuthSessionContext } from "@/utils/auth/authSessionContext";

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

export const SessionWrapper =
  (value: AuthSessionValue) =>
  ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <AuthSessionContext value={value}>{children}</AuthSessionContext>
    </I18nProvider>
  );

export const renderWithSession = (
  ui: ReactElement,
  value: AuthSessionValue = createSessionValue(),
) => ({
  ...render(ui, { wrapper: SessionWrapper(value) }),
  value,
});
