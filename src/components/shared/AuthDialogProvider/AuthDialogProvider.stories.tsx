import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MemoryRouter } from "react-router";
import { userEvent, within } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { AuthSessionProvider } from "@/components/shared/AuthSessionProvider/AuthSessionProvider";
import { RequireAuth } from "@/components/shared/RequireAuth/RequireAuth";
import { createMockAuthClient } from "@/services/auth/client/createMockAuthClient";
import type { TextStorage } from "@/types/storage";
import { useRequireAuth } from "@/utils/auth/useRequireAuth";

import { AuthDialogProvider } from "./AuthDialogProvider";

// The dialog as any action meets it: a button that needs an account. The
// stories run on the stand-in client with fresh accounts each time; the
// dialog opens by itself. On a phone viewport it is a bottom sheet.
const createStorage = (): TextStorage => {
  const items = new Map<string, string>();

  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
  };
};

const CreateQuiz = () => {
  const requireAuth = useRequireAuth();
  const [isCreated, setIsCreated] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2 text-gi-primary">
      <button
        type="button"
        className="underline"
        onClick={() => requireAuth("create-quiz", () => setIsCreated(true))}
      >
        Stwórz własny
      </button>
      {isCreated && <p>The action ran: the editor would open here.</p>}
    </div>
  );
};

const Scene = ({ isGuarded = false }: { isGuarded?: boolean }) => (
  <MemoryRouter>
    <AuthSessionProvider
      client={createMockAuthClient({ storage: createStorage() })}
    >
      <AuthDialogProvider>
        {isGuarded ? (
          <RequireAuth intent="create-quiz">
            <p className="text-gi-primary">The guarded page.</p>
          </RequireAuth>
        ) : (
          <CreateQuiz />
        )}
      </AuthDialogProvider>
    </AuthSessionProvider>
  </MemoryRouter>
);

const meta = {
  title: "Shared/AuthDialogProvider",
  component: Scene,
  parameters: {
    viewport: { options: INITIAL_VIEWPORTS },
  },
} satisfies Meta<typeof Scene>;

export default meta;

type Story = StoryObj<typeof meta>;

const openDialog: Story["play"] = async ({ canvasElement }) => {
  await userEvent.click(
    within(canvasElement).getByRole("button", { name: "Stwórz własny" }),
  );
};

// Utwórz quiz / Desktop / Modal logowania
export const Modal: Story = { play: openDialog };

// Utwórz quiz / Mobile / Modal logowania
export const BottomSheet: Story = {
  globals: { viewport: { value: "iphone12", isRotated: false } },
  play: openDialog,
};

// After a first sign-in with Google: the step, in the dialog. Not drawn.
export const SetupStep: Story = {
  play: async (context) => {
    await openDialog(context);
    await userEvent.click(
      await within(document.body).findByRole("button", {
        name: "Kontynuuj z Google",
      }),
    );
  },
};

// A page that needs an account, opened signed out.
export const GuardedPage: Story = { args: { isGuarded: true } };
