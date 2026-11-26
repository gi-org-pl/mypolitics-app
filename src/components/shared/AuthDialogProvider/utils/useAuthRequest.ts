import { useCallback, useEffect, useRef, useState } from "react";

import type { AuthIntentKey, RequireAuth } from "@/types/auth";
import { useAuthSession } from "@/utils/auth/useAuthSession";
import { doNothing } from "@/utils/function/doNothing";

export interface AuthRequest {
  intent: AuthIntentKey;
  action: () => void;
  onCancel?: () => void;
}

// The one request for an account the dialog stands for, if any.
//
// Signed in, an action runs at once. Otherwise the request opens the dialog;
// a second request while one is open is ignored. Whenever the session turns
// signed in while a request is open - through the dialog, or because the
// first check of the session finished late - the dialog closes and the
// action runs, once. Closing the dialog drops the request and calls its
// onCancel; the caller dropping it closes the dialog and calls nothing.
export const useAuthRequest = () => {
  const { session } = useAuthSession();
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const requestRef = useRef(request);
  const sessionRef = useRef(session);

  requestRef.current = request;
  sessionRef.current = session;

  const requireAuth: RequireAuth = useCallback((intent, action, options) => {
    if (sessionRef.current.status === "signed-in") {
      action();
      return doNothing;
    }

    if (requestRef.current) return doNothing;

    const next = { intent, action, onCancel: options?.onCancel };
    requestRef.current = next;
    setRequest(next);

    return () => {
      if (requestRef.current !== next) return;

      requestRef.current = null;
      setRequest(null);
    };
  }, []);

  useEffect(() => {
    if (session.status !== "signed-in" || !request) return;

    requestRef.current = null;
    setRequest(null);
    request.action();
  }, [session.status, request]);

  const cancel = useCallback(() => {
    const current = requestRef.current;
    if (!current) return;

    requestRef.current = null;
    setRequest(null);
    current.onCancel?.();
  }, []);

  return { request, requireAuth, cancel };
};
