import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import {
  createMemoryRouter,
  MemoryRouter,
  Outlet,
  RouterProvider,
} from "react-router";
import { describe, expect, it, vi } from "vitest";

import { AuthSessionProvider } from "@/components/shared/AuthSessionProvider/AuthSessionProvider";
import { RequireAuth } from "@/components/shared/RequireAuth/RequireAuth";
import type { AuthClient } from "@/types/auth";
import { useRequireAuth } from "@/utils/auth/useRequireAuth";
import { createAuthAccount } from "@/utils/vitest/auth/createAuthAccount";
import { createFakeAuthClient } from "@/utils/vitest/auth/createFakeAuthClient";

import { AuthDialogProvider } from "./AuthDialogProvider";

// The provider composes the request and the dialog: what a request does is
// tested on useAuthRequest, what the dialog does on AuthDialog.
const CreateButton = ({ onCreate }: { onCreate: () => void }) => {
  const requireAuth = useRequireAuth();

  return (
    <button type="button" onClick={() => requireAuth("create-quiz", onCreate)}>
      Utwórz quiz
    </button>
  );
};

const renderProvider = (client: AuthClient) => {
  const onCreate = vi.fn();

  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <AuthSessionProvider client={client}>
          <AuthDialogProvider>
            <CreateButton onCreate={onCreate} />
          </AuthDialogProvider>
        </AuthSessionProvider>
      </MemoryRouter>
    </I18nProvider>,
  );

  return { onCreate };
};

describe("AuthDialogProvider", () => {
  describe("given a signed-out person asks for an account", () => {
    it("shows the dialog, and closing it brings focus back", async () => {
      renderProvider(createFakeAuthClient());
      const opener = screen.getByRole("button", { name: "Utwórz quiz" });
      opener.focus();

      fireEvent.click(opener);
      const dialog = await screen.findByRole("dialog");
      fireEvent.click(within(dialog).getByRole("button", { name: "Zamknij" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(opener).toHaveFocus();
    });

    it("runs the action once the person signs in through the dialog", async () => {
      const { onCreate } = renderProvider(
        createFakeAuthClient({
          signIn: vi.fn().mockResolvedValue({
            kind: "signed-in",
            account: createAuthAccount(),
          }),
        }),
      );

      fireEvent.click(screen.getByRole("button", { name: "Utwórz quiz" }));
      const dialog = await screen.findByRole("dialog");
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Kontynuuj z Google" }),
      );

      await vi.waitFor(() => expect(onCreate).toHaveBeenCalledOnce());
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("given a signed-out person leaves a guarded page while the dialog is open", () => {
    it("closes the dialog and stays on the page they went to", async () => {
      const router = createMemoryRouter(
        [
          {
            element: (
              <AuthSessionProvider client={createFakeAuthClient()}>
                <AuthDialogProvider>
                  <Outlet />
                </AuthDialogProvider>
              </AuthSessionProvider>
            ),
            children: [
              { path: "/", element: <p>home</p> },
              { path: "/about", element: <p>about</p> },
              {
                path: "/editor",
                element: (
                  <RequireAuth intent="create-quiz">
                    <p>editor</p>
                  </RequireAuth>
                ),
              },
            ],
          },
        ],
        { initialEntries: ["/", "/about", "/editor"], initialIndex: 2 },
      );
      render(
        <I18nProvider i18n={i18n}>
          <RouterProvider router={router} />
        </I18nProvider>,
      );
      await screen.findByRole("dialog");

      await act(() => router.navigate(-1));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/about");
      expect(screen.getByText("about")).toBeInTheDocument();
    });
  });
});
