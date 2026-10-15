import type { ReactNode } from "react";

import type { AuthClient } from "@/types/auth";

export interface AuthSessionProviderProps {
  client?: AuthClient; // default: the app's client
  children: ReactNode;
}
