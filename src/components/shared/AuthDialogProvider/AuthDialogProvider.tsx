import { AuthDialogContext } from "@/utils/auth/authDialogContext";

import { AuthDialog } from "./AuthDialog/AuthDialog";
import type { AuthDialogProviderProps } from "./AuthDialogProvider.types";
import { useAuthRequest } from "./utils/useAuthRequest";

// Lets any part of the app ask for an account before an action, with
// useRequireAuth, and shows the auth dialog when one is needed. The root of
// the app puts it inside AuthSessionProvider, around every page.
//
// The action runs once the session turns signed in, so the dialog has nothing
// to do on a sign-in itself.
export const AuthDialogProvider = ({ children }: AuthDialogProviderProps) => {
  const { request, requireAuth, cancel } = useAuthRequest();

  return (
    <AuthDialogContext value={requireAuth}>
      {children}
      {request && <AuthDialog intent={request.intent} onClose={cancel} />}
    </AuthDialogContext>
  );
};
