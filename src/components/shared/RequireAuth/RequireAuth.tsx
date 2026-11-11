import type { RequireAuthProps } from "./RequireAuth.types";
import { useRequireAuthGuard } from "./utils/useRequireAuthGuard";

// A page that only makes sense signed in. Signed out, nothing of the page is
// shown and the auth dialog asks for an account with the intent's line.
export const RequireAuth = ({ intent, children }: RequireAuthProps) =>
  useRequireAuthGuard(intent) ? children : null;
