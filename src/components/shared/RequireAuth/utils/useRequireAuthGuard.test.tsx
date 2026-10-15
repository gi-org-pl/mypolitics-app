import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { AuthSession, RequireAuth } from "@/types/auth";
import { AuthDialogContext } from "@/utils/auth/authDialogContext";
import { AuthSessionContext } from "@/utils/auth/authSessionContext";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createSessionValue } from "@/utils/vitest/auth/renderWithSession";

import { useRequireAuthGuard } from "./useRequireAuthGuard";

const SIGNED_IN: AuthSession = {
  status: "signed-in",
  account: createAuthAccount(),
};

const Guarded = () => (
  <p>{useRequireAuthGuard("create-quiz") ? "page" : "nothing"}</p>
);

// A guarded page at /editor, opened from the home page or directly, under a
// session and a requireAuth the test controls. The session is state above
// the router, so a change reaches the page.
const renderGuard = (initial: AuthSession, entries: string[]) => {
  const requireAuth = vi.fn<RequireAuth>();
  const setter: { current: (next: AuthSession) => void } = {
    current: () => undefined,
  };
  const router = createMemoryRouter(
    [
      { path: "/", element: <p>home</p> },
      { path: "/editor", element: <Guarded /> },
    ],
    { initialEntries: entries, initialIndex: entries.length - 1 },
  );
  const Holder = () => {
    const [session, setSession] = useState(initial);
    setter.current = setSession;

    return (
      <AuthSessionContext value={createSessionValue({ session })}>
        <AuthDialogContext value={requireAuth}>
          <RouterProvider router={router} />
        </AuthDialogContext>
      </AuthSessionContext>
    );
  };

  render(<Holder />);

  return {
    router,
    requireAuth,
    setSession: (next: AuthSession) => setter.current(next),
  };
};

describe("useRequireAuthGuard()", () => {
  describe("given a signed-in session", () => {
    it("lets the page show and asks for nothing", () => {
      const { requireAuth } = renderGuard(SIGNED_IN, ["/editor"]);

      expect(screen.getByText("page")).toBeInTheDocument();
      expect(requireAuth).not.toHaveBeenCalled();
    });
  });

  describe("given the session is not known yet", () => {
    it("shows nothing and asks for nothing", () => {
      const { requireAuth } = renderGuard({ status: "unknown" }, ["/editor"]);

      expect(screen.getByText("nothing")).toBeInTheDocument();
      expect(requireAuth).not.toHaveBeenCalled();
    });
  });

  describe("given a signed-out visitor", () => {
    it("shows nothing and asks for an account with the intent", () => {
      const { requireAuth } = renderGuard({ status: "signed-out" }, [
        "/editor",
      ]);

      expect(screen.getByText("nothing")).toBeInTheDocument();
      expect(requireAuth).toHaveBeenCalledWith(
        "create-quiz",
        expect.any(Function),
        { onCancel: expect.any(Function) },
      );
    });

    it("goes back when the dialog is closed after coming from another page", () => {
      const { requireAuth, router } = renderGuard({ status: "signed-out" }, [
        "/",
        "/editor",
      ]);

      act(() => requireAuth.mock.calls[0][2]?.onCancel?.());

      expect(router.state.location.pathname).toBe("/");
    });

    it("goes home when the dialog is closed on a page opened directly", () => {
      const { requireAuth, router } = renderGuard({ status: "signed-out" }, [
        "/editor",
      ]);

      act(() => requireAuth.mock.calls[0][2]?.onCancel?.());

      expect(router.state.location.pathname).toBe("/");
    });

    it("shows the page once signed in", () => {
      const { setSession } = renderGuard({ status: "signed-out" }, ["/editor"]);

      act(() => setSession(SIGNED_IN));

      expect(screen.getByText("page")).toBeInTheDocument();
    });
  });

  describe("given the person signs out on the page", () => {
    it("goes home with no dialog", () => {
      const { setSession, router, requireAuth } = renderGuard(SIGNED_IN, [
        "/editor",
      ]);

      act(() => setSession({ status: "signed-out" }));

      expect(router.state.location.pathname).toBe("/");
      expect(requireAuth).not.toHaveBeenCalled();
    });
  });
});
