import { authClient } from "@/services/auth/client/authClient";
import { AuthSessionContext } from "@/utils/auth/authSessionContext";

import type { AuthSessionProviderProps } from "./AuthSessionProvider.types";
import { useSessionState } from "./utils/useSessionState";

// Holds who is signed in for the whole app; useAuthSession reads it.
export const AuthSessionProvider = ({
  client = authClient,
  children,
}: AuthSessionProviderProps) => {
  const value = useSessionState(client);

  return <AuthSessionContext value={value}>{children}</AuthSessionContext>;
};
