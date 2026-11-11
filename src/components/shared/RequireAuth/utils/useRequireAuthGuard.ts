import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

import { PATHS } from "@/constants/paths";
import type { AuthIntentKey } from "@/types/auth";
import { useAuthSession } from "@/utils/auth/useAuthSession";
import { useRequireAuth } from "@/utils/auth/useRequireAuth";
import { doNothing } from "@/utils/function/doNothing";

// Whether a page that needs an account may show. Arriving signed out opens
// the auth dialog with the intent's line; closing it goes back, or home when
// the page was opened directly. Signing out while on the page goes straight
// home, with no dialog: a change from signed in to signed out is not the
// same as arriving signed out.
export const useRequireAuthGuard = (intent: AuthIntentKey) => {
  const { session } = useAuthSession();
  const requireAuth = useRequireAuth();
  const navigate = useNavigate();
  const { key } = useLocation();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (session.status === "signed-in") {
      wasSignedIn.current = true;
      return;
    }

    if (session.status !== "signed-out") return;

    if (wasSignedIn.current) {
      navigate(PATHS.home, { replace: true });
      return;
    }

    requireAuth(intent, doNothing, {
      onCancel: () => {
        // "default" is the key of the first page the app was opened on.
        if (key === "default") navigate(PATHS.home, { replace: true });
        else navigate(-1);
      },
    });
  }, [session.status, intent, requireAuth, navigate, key]);

  return session.status === "signed-in";
};
