import { createContext } from "react";

import type { RequireAuth } from "@/types/auth";

export const AuthDialogContext = createContext<RequireAuth | null>(null);
