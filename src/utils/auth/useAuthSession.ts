import { useContext } from "react";

import type { AuthSessionValue } from "@/types/auth";

import { AuthSessionContext } from "./authSessionContext";

// Who is signed in, and the ways to change it. Only inside
// AuthSessionProvider, which the root of the app puts around every page.
export const useAuthSession = (): AuthSessionValue => {
  const value = useContext(AuthSessionContext);

  if (!value) {
    throw new Error("useAuthSession is used outside AuthSessionProvider");
  }

  return value;
};
