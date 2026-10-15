import { fireEvent, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockResizeObserver } from "@/components/shared/AnimatedHeight/utils/mockResizeObserver";
import type {
  AuthClient,
  CompleteSignUpOutcome,
  SignInOutcome,
} from "@/types/auth";
import { createFakeAuthClient } from "@/utils/vitest/auth/createFakeAuthClient";
import {
  createSessionValue,
  renderWithSession,
} from "@/utils/vitest/auth/renderWithSession";

import { AuthDialog } from "./AuthDialog";

const renderDialog = (client: AuthClient = createFakeAuthClient()) => {
  const onClose = vi.fn();
  const rendered = renderWithSession(
    <MemoryRouter initialEntries={["/quizzes?tab=all"]}>
      <AuthDialog intent="create-quiz" onClose={onClose} />
    </MemoryRouter>,
    createSessionValue({ client }),
  );

  return { ...rendered, onClose, dialog: screen.getByRole("dialog") };
};

describe("AuthDialog", () => {
  beforeEach(() => {
    mockResizeObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("given it opens", () => {
    it("is a modal dialog in the body, named by the heading and described by the intent's line", () => {
      const { dialog, container } = renderDialog();

      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAccessibleName("Najpierw zaloguj się");
      expect(dialog).toHaveAccessibleDescription(
        "Quiz zapiszemy na Twoim koncie. Pierwsze logowanie je zakłada.",
      );
      expect(container).not.toContainElement(dialog);
      expect(dialog).toHaveFocus();
    });

    it("draws the handle of the sheet for a phone", () => {
      const { dialog } = renderDialog();

      expect(
        dialog.querySelector('[aria-hidden="true"].md\\:hidden'),
      ).not.toBeNull();
    });
  });

  describe("given a provider is chosen", () => {
    it("tells the client to come back to the sign-in page with this page as next", () => {
      const client = createFakeAuthClient({
        signIn: vi.fn(() => new Promise<SignInOutcome>(() => undefined)),
      });
      const { dialog } = renderDialog(client);

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Kontynuuj z Google" }),
      );

      expect(client.signIn).toHaveBeenCalledWith(
        "google",
        expect.objectContaining({
          returnTo: "/login?next=%2Fquizzes%3Ftab%3Dall",
        }),
      );
    });
  });

  describe("given the close button", () => {
    it("closes", () => {
      const { dialog, onClose } = renderDialog();

      fireEvent.click(within(dialog).getByRole("button", { name: "Zamknij" }));

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("given Escape", () => {
    it("closes", () => {
      const { dialog, onClose } = renderDialog();

      fireEvent.keyDown(dialog, { key: "Escape" });

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("given a press on the dimmed page", () => {
    it("closes, while a press inside does not", () => {
      const { dialog, onClose } = renderDialog();

      fireEvent.mouseDown(dialog);
      expect(onClose).not.toHaveBeenCalled();

      fireEvent.mouseDown(dialog.parentElement as HTMLElement);
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("given the account is being saved", () => {
    it("refuses Escape, the dimmed page and the close button", async () => {
      const client = createFakeAuthClient({
        signIn: vi.fn().mockResolvedValue({
          kind: "new-account",
          signUp: { id: "sign-up-1", provider: "google", suggestedName: "Ala" },
        }),
        completeSignUp: vi.fn(
          () => new Promise<CompleteSignUpOutcome>(() => undefined),
        ),
      });
      const { dialog, onClose } = renderDialog(client);
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Kontynuuj z Google" }),
      );
      await within(dialog).findByRole("heading", { name: "Prawie gotowe" });
      fireEvent.click(within(dialog).getByRole("checkbox", { name: /16 lat/ }));
      fireEvent.click(
        within(dialog).getByRole("checkbox", { name: /Akceptuję/ }),
      );
      fireEvent.click(within(dialog).getByRole("button", { name: "Gotowe" }));
      await vi.waitFor(() =>
        expect(
          within(dialog).getByRole("button", { name: "Zamknij" }),
        ).toBeDisabled(),
      );

      fireEvent.keyDown(dialog, { key: "Escape" });
      fireEvent.mouseDown(dialog.parentElement as HTMLElement);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("given the step's cancel button", () => {
    it("closes", async () => {
      const client = createFakeAuthClient({
        signIn: vi.fn().mockResolvedValue({
          kind: "new-account",
          signUp: { id: "sign-up-1", provider: "google" },
        }),
      });
      const { dialog, onClose } = renderDialog(client);
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Kontynuuj z Google" }),
      );

      fireEvent.click(
        await within(dialog).findByRole("button", { name: "Anuluj" }),
      );

      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
