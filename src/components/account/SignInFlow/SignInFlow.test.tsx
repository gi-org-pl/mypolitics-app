import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthSessionProvider } from "@/components/shared/AuthSessionProvider/AuthSessionProvider";
import {
  createMockAuthClient,
  type MockAuthClientOptions,
} from "@/services/auth/client/createMockAuthClient";
import type { TextStorage } from "@/types/storage";
import { mockResizeObserver } from "@/utils/vitest/mockResizeObserver";

import { SignInFlow } from "./SignInFlow";
import type { SignInFlowProps } from "./SignInFlow.types";

// The flow composed with the panel and the step, on the stand-in client:
// which view shows after which press. What the flow does with each outcome
// is tested on useSignInFlow.
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

const renderFlow = (
  options: MockAuthClientOptions = {},
  props: Partial<SignInFlowProps> = {},
) => {
  const onSignedIn = vi.fn();
  const client = createMockAuthClient({
    storage: createStorage(),
    delayMs: 0,
    ...options,
  });

  render(
    <I18nProvider i18n={i18n}>
      <AuthSessionProvider client={client}>
        <SignInFlow
          heading="Zaloguj się lub załóż konto"
          description="Linia"
          onSignedIn={onSignedIn}
          {...props}
        />
      </AuthSessionProvider>
    </I18nProvider>,
  );

  return { onSignedIn };
};

describe("SignInFlow", () => {
  beforeEach(() => {
    mockResizeObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("given it opens", () => {
    it("shows the providers under the heading it was given", () => {
      renderFlow();

      expect(
        screen.getByRole("heading", { name: "Zaloguj się lub załóż konto" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Kontynuuj z Google" }),
      ).toBeInTheDocument();
    });
  });

  describe("given it resumes a sign-in that left the page", () => {
    it("shows nothing until it knows how it ended", async () => {
      renderFlow({}, { resume: true });

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: "Kontynuuj z Google" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a first sign-in", () => {
    it("shows the step, and the done button finishes", async () => {
      const { onSignedIn } = renderFlow();

      fireEvent.click(
        screen.getByRole("button", { name: "Kontynuuj z Google" }),
      );
      expect(
        await screen.findByRole("heading", { name: "Prawie gotowe" }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("checkbox", { name: /16 lat/ }));
      fireEvent.click(screen.getByRole("checkbox", { name: /Akceptuję/ }));
      fireEvent.click(screen.getByRole("button", { name: "Gotowe" }));

      await vi.waitFor(() =>
        expect(onSignedIn).toHaveBeenCalledWith(
          expect.objectContaining({ displayName: "Ala Nowak" }),
        ),
      );
    });

    it("returns to the providers on cancel", async () => {
      const onCancel = vi.fn();
      renderFlow({}, { onCancel });
      fireEvent.click(
        screen.getByRole("button", { name: "Kontynuuj z Google" }),
      );
      await screen.findByRole("heading", { name: "Prawie gotowe" });

      fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));

      expect(
        screen.getByRole("button", { name: "Kontynuuj z Google" }),
      ).toBeInTheDocument();
      expect(onCancel).toHaveBeenCalledOnce();
    });
  });

  describe("given an address that belongs to a Google account", () => {
    it("shows the account-exists view and signs in through Google", async () => {
      const { onSignedIn } = renderFlow({
        outcomes: { facebook: { accountExists: "google" } },
      });

      fireEvent.click(
        screen.getByRole("button", { name: "Kontynuuj z Facebookiem" }),
      );
      fireEvent.click(
        await screen.findByRole("button", { name: "Zaloguj się przez Google" }),
      );

      await vi.waitFor(() => expect(onSignedIn).toHaveBeenCalledOnce());
    });
  });

  describe("given the provider window is closed", () => {
    it("shows the error over the providers", async () => {
      renderFlow({ outcomes: { x: "window-closed" } });

      fireEvent.click(screen.getByRole("button", { name: "Kontynuuj z X" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Logowanie przerwane",
      );
    });
  });

  describe("given a close handler", () => {
    it("passes it to the card", () => {
      const onClose = vi.fn();
      renderFlow({}, { onClose });

      fireEvent.click(screen.getByRole("button", { name: "Zamknij" }));

      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
