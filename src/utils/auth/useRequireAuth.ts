import { useContext } from "react";

import type { RequireAuth } from "@/types/auth";

import { AuthDialogContext } from "./authDialogContext";

// Asks for an account before an action, from anywhere in the app. Only
// inside AuthDialogProvider, which the root of the app puts around every
// page.
export const useRequireAuth = (): RequireAuth => {
  const requireAuth = useContext(AuthDialogContext);

  if (!requireAuth) {
    throw new Error("useRequireAuth is used outside AuthDialogProvider");
  }

  return requireAuth;
};
