import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthSessionProvider } from "@/components/shared/AuthSessionProvider/AuthSessionProvider";
import type { AuthAccount, AuthClient, SignInOutcome } from "@/types/auth";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createFakeAuthClient } from "@/utils/vitest/auth/createFakeAuthClient";
import { mockResizeObserver } from "@/utils/vitest/mockResizeObserver";

import SignInPage from "./login";

const HEADING = "Zaloguj się lub załóż konto";

// The page at /login next to a stand-in for the page it sends people to.
const renderPage = (client: AuthClient, entry = "/login") => {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <SignInPage /> },
      { path: "/", element: <p>Strona główna</p> },
      { path: "/quizzes/:quizSlug", element: <p>Strona quizu</p> },
    ],
    { initialEntries: [entry] },
  );

  render(
    <I18nProvider i18n={i18n}>
      <AuthSessionProvider client={client}>
        <RouterProvider router={router} />
      </AuthSessionProvider>
    </I18nProvider>,
  );

  return router;
};

const signedOut = (overrides: Partial<AuthClient> = {}) =>
  createFakeAuthClient(overrides);

const signedIn = (account: AuthAccount = createAuthAccount()) =>
  createFakeAuthClient({ getSession: vi.fn().mockResolvedValue(account) });

describe("SignInPage", () => {
  beforeEach(() => {
    mockResizeObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("given a signed-out visitor", () => {
    it("shows the sign-in card as the page's heading", async () => {
      renderPage(signedOut());

      expect(
        await screen.findByRole("heading", { level: 1, name: HEADING }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Pierwsze logowanie zakłada konto, w którym tworzysz quizy. Quizy rozwiążesz bez logowania.",
        ),
      ).toBeInTheDocument();
    });

    it("sends them to next once they are in", async () => {
      const router = renderPage(
        signedOut({
          signIn: vi.fn().mockResolvedValue({
            kind: "signed-in",
            account: createAuthAccount(),
          }),
        }),
        "/login?next=%2Fquizzes%2Fmypolitics",
      );

      fireEvent.click(
        await screen.findByRole("button", { name: "Kontynuuj z Google" }),
      );

      expect(await screen.findByText("Strona quizu")).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/quizzes/mypolitics");
    });

    it("asks the client to come back to this very page", async () => {
      const signIn = vi.fn(() => new Promise<SignInOutcome>(() => undefined));
      renderPage(signedOut({ signIn }), "/login?next=%2F");

      fireEvent.click(
        await screen.findByRole("button", { name: "Kontynuuj z Google" }),
      );

      expect(signIn).toHaveBeenCalledWith(
        "google",
        expect.objectContaining({ returnTo: "/login?next=%2F" }),
      );
    });

    it("returns to the providers when the last step is cancelled", async () => {
      renderPage(
        signedOut({
          signIn: vi.fn().mockResolvedValue({
            kind: "new-account",
            signUp: { id: "sign-up-1", provider: "google" },
          }),
        }),
      );
      fireEvent.click(
        await screen.findByRole("button", { name: "Kontynuuj z Google" }),
      );

      fireEvent.click(await screen.findByRole("button", { name: "Anuluj" }));

      expect(
        screen.getByRole("heading", { level: 1, name: HEADING }),
      ).toBeInTheDocument();
    });
  });

  describe("given a provider sent the person back with a new account", () => {
    it("shows the last step", async () => {
      renderPage(
        signedOut({
          resumeSignIn: vi.fn().mockResolvedValue({
            kind: "new-account",
            signUp: { id: "sign-up-1", provider: "x", suggestedName: "Ala" },
          }),
        }),
      );

      expect(
        await screen.findByRole("heading", { level: 1, name: "Prawie gotowe" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a signed-in person", () => {
    it("sends them to next at once, replacing the sign-in page", async () => {
      const router = renderPage(signedIn(), "/login?next=%2Fquizzes%2Fx");

      expect(await screen.findByText("Strona quizu")).toBeInTheDocument();
      expect(router.state.historyAction).toBe("REPLACE");
    });

    it("sends them home when next leaves the app", async () => {
      renderPage(signedIn(), "/login?next=https%3A%2F%2Fexample.com");

      expect(await screen.findByText("Strona główna")).toBeInTheDocument();
    });
  });

  describe("given the session is not known yet", () => {
    it("shows nothing", () => {
      renderPage(
        createFakeAuthClient({
          getSession: () => new Promise<AuthAccount | null>(() => undefined),
        }),
      );

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });
});
