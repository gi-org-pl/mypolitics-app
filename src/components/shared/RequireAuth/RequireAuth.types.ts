import type { ReactNode } from "react";

import type { AuthIntentKey } from "@/types/auth";

export interface RequireAuthProps {
  intent: AuthIntentKey;
  children: ReactNode; // shown only when signed in
}
