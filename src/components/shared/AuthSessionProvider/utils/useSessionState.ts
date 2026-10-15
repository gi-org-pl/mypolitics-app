import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  AuthAccount,
  AuthClient,
  AuthSession,
  AuthSessionValue,
} from "@/types/auth";

// The session of the app and the ways to change it. The session is unknown
// until the client answers; a client that cannot answer leaves the person
// signed out, so the header offers to sign in rather than waiting for ever.
//
// Answers arrive out of order, so each change says what it may overwrite:
// - a session check is dropped when anything changed after it was asked for
//   (a sign-in that finished while the first check was on its way);
// - a sign-out that the client confirmed is dropped only when a sign-in
//   finished after it was asked for. Another sign-out that fails meanwhile
//   does not undo it.
export const useSessionState = (client: AuthClient): AuthSessionValue => {
  const [session, setSession] = useState<AuthSession>({ status: "unknown" });
  const changes = useRef(0);
  const signIns = useRef(0);

  const refresh = useCallback(async () => {
    changes.current += 1;
    const asked = changes.current;
    let next: AuthSession;

    try {
      const account = await client.getSession();
      next = account
        ? { status: "signed-in", account }
        : { status: "signed-out" };
    } catch {
      next = { status: "signed-out" };
    }

    if (asked === changes.current) setSession(next);
  }, [client]);

  const setSignedIn = useCallback((account: AuthAccount) => {
    changes.current += 1;
    signIns.current += 1;
    setSession({ status: "signed-in", account });
  }, []);

  // The page never shows a person signed out while the session may still be
  // alive behind it: a client that could not end it leaves them signed in.
  const signOut = useCallback(async () => {
    changes.current += 1;
    const asked = signIns.current;

    try {
      await client.signOut();
    } catch {
      return false;
    }

    if (asked === signIns.current) setSession({ status: "signed-out" });

    return true;
  }, [client]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({ session, client, setSignedIn, signOut, refresh }),
    [session, client, setSignedIn, signOut, refresh],
  );
};
