import { useState } from "react";

import { useAuthSession } from "@/utils/auth/useAuthSession";

// Signing out from the header. When the session could not be ended, the
// person is still signed in and the header says so, until the next attempt.
export const useSignOutAction = (onSignedOut?: () => void) => {
  const { signOut } = useAuthSession();
  const [hasFailed, setHasFailed] = useState(false);

  return {
    hasFailed,
    signOut: async () => {
      setHasFailed(false);

      if (await signOut()) onSignedOut?.();
      else setHasFailed(true);
    },
  };
};
