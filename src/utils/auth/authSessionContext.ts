import { createContext } from "react";

import type { AuthSessionValue } from "@/types/auth";

export const AuthSessionContext = createContext<AuthSessionValue | null>(null);
