import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { authClient } from "@/services/auth/client/authClient";
import type { AuthAccount, AuthSession } from "@/types/auth";
import { AuthSessionContext } from "@/utils/auth/authSessionContext";

import type { AuthSessionProviderProps } from "./AuthSessionProvider.types";

// Holds who is signed in for the whole app. The session is unknown until the
// client answers; a client that cannot answer leaves the person signed out,
// so the header offers to sign in rather than waiting for ever.
//
// Every change counts as a new version. An answer of the client that was
// asked for before a later change - a sign-in that finished while the first
// check was still on its way - is dropped, so it cannot undo that change.
export const AuthSessionProvider = ({
  client = authClient,
  children,
}: AuthSessionProviderProps) => {
  const [session, setSession] = useState<AuthSession>({ status: "unknown" });
  const version = useRef(0);

  const refresh = useCallback(async () => {
    version.current += 1;
    const asked = version.current;
    let next: AuthSession;

    try {
      const account = await client.getSession();
      next = account
        ? { status: "signed-in", account }
        : { status: "signed-out" };
    } catch {
      next = { status: "signed-out" };
    }

    if (asked === version.current) setSession(next);
  }, [client]);

  const setSignedIn = useCallback((account: AuthAccount) => {
    version.current += 1;
    setSession({ status: "signed-in", account });
  }, []);

  // The page never shows a person signed out while the session may still be
  // alive behind it: a client that could not end it leaves them signed in.
  //
  // A sign-in that finishes while the sign-out is on its way is newer, so the
  // sign-out then leaves it in place.
  const signOut = useCallback(async () => {
    version.current += 1;
    const asked = version.current;

    try {
      await client.signOut();
    } catch {
      return false;
    }

    if (asked === version.current) setSession({ status: "signed-out" });

    return true;
  }, [client]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ session, client, setSignedIn, signOut, refresh }),
    [session, client, setSignedIn, signOut, refresh],
  );

  return <AuthSessionContext value={value}>{children}</AuthSessionContext>;
};
