import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { ReactNode } from "react";

import type { AuthSessionValue } from "@/types/auth";
import { AuthSessionContext } from "@/utils/auth/authSessionContext";

// The wrapper a test renders in to read the given session: the app's
// translations and the session context.
export const SessionWrapper =
  (value: AuthSessionValue) =>
  ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <AuthSessionContext value={value}>{children}</AuthSessionContext>
    </I18nProvider>
  );
