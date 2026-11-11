import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SignInPanel } from "./SignInPanel";
import type { SignInPanelProps } from "./SignInPanel.types";

const HEADING = "Zaloguj się lub załóż konto";
const LINE =
  "Pierwsze logowanie zakłada konto, w którym tworzysz quizy. Quizy rozwiążesz bez logowania.";

const renderPanel = (props: Partial<SignInPanelProps> = {}) => {
  const handlers = {
    onProviderSelect: vi.fn(),
    onChooseAnother: vi.fn(),
  };

  renderWithI18n(
    <SignInPanel
      heading={HEADING}
      description={LINE}
      view={{ kind: "choose" }}
      termsHref="/terms"
      privacyHref="/privacy"
      {...handlers}
      {...props}
    />,
  );

  return handlers;
};

const button = (name: string) => screen.getByRole("button", { name });

describe("SignInPanel", () => {
  describe("given the choose view", () => {
    it("shows the heading, the line and the three providers in order", () => {
      renderPanel();

      expect(
        screen.getByRole("heading", { level: 2, name: HEADING }),
      ).toBeInTheDocument();
      expect(screen.getByText(LINE)).toBeInTheDocument();
      expect(
        screen.getAllByRole("button").map((item) => item.textContent),
      ).toEqual([
        "Kontynuuj z Google",
        "Kontynuuj z Facebookiem",
        "Kontynuuj z X",
      ]);
    });

    it("hands the pressed provider over", () => {
      const { onProviderSelect } = renderPanel();

      fireEvent.click(button("Kontynuuj z Facebookiem"));

      expect(onProviderSelect).toHaveBeenCalledWith("facebook");
    });

    it("opens the terms and the privacy policy in a new tab", () => {
      renderPanel();

      const terms = screen.getByRole("link", { name: "Regulamin" });
      const privacy = screen.getByRole("link", {
        name: "Polityka prywatności",
      });

      expect(terms).toHaveAttribute("href", "/terms");
      expect(terms).toHaveAttribute("target", "_blank");
      expect(privacy).toHaveAttribute("href", "/privacy");
      expect(privacy).toHaveAttribute("target", "_blank");
    });

    it("shows no error and no close button", () => {
      renderPanel();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Zamknij" }),
      ).not.toBeInTheDocument();
    });

    it("can stand as the heading of a page", () => {
      renderPanel({ headingLevel: 1 });

      expect(
        screen.getByRole("heading", { level: 1, name: HEADING }),
      ).toBeInTheDocument();
    });
  });

  describe("given Google is waited for", () => {
    it("shows the waiting label on its busy button and disables the other two", () => {
      renderPanel({ view: { kind: "choose", waitingFor: "google" } });

      const waiting = button("Czekamy na Google…");

      expect(waiting).toHaveAttribute("aria-busy", "true");
      expect(waiting).not.toBeDisabled();
      expect(button("Kontynuuj z Facebookiem")).toBeDisabled();
      expect(button("Kontynuuj z X")).toBeDisabled();
    });

    it("calls nothing when a button is pressed", () => {
      const { onProviderSelect } = renderPanel({
        view: { kind: "choose", waitingFor: "google" },
      });

      fireEvent.click(button("Czekamy na Google…"));
      fireEvent.click(button("Kontynuuj z X"));

      expect(onProviderSelect).not.toHaveBeenCalled();
    });
  });

  describe("given Facebook is waited for", () => {
    it("declines the name in the waiting label", () => {
      renderPanel({ view: { kind: "choose", waitingFor: "facebook" } });

      expect(button("Czekamy na Facebooka…")).toBeInTheDocument();
    });
  });

  describe("given the Facebook window was closed", () => {
    it("announces that the sign-in was interrupted, naming Facebook", () => {
      renderPanel({
        view: {
          kind: "choose",
          error: { kind: "window-closed", provider: "facebook" },
        },
      });

      const alert = screen.getByRole("alert");

      expect(within(alert).getByText("Logowanie przerwane")).toBeVisible();
      expect(
        within(alert).getByText(
          "Okno Facebooka zostało zamknięte przed końcem logowania. Spróbuj jeszcze raz.",
        ),
      ).toBeVisible();
    });

    it("keeps the three providers available", () => {
      renderPanel({
        view: {
          kind: "choose",
          error: { kind: "window-closed", provider: "facebook" },
        },
      });

      expect(button("Kontynuuj z Google")).toBeEnabled();
      expect(button("Kontynuuj z Facebookiem")).toBeEnabled();
      expect(button("Kontynuuj z X")).toBeEnabled();
    });
  });

  describe("given X failed", () => {
    it("says that X does not answer and points to the other ways", () => {
      renderPanel({
        view: {
          kind: "choose",
          error: { kind: "provider-failed", provider: "x" },
        },
      });

      const alert = screen.getByRole("alert");

      expect(within(alert).getByText("X nie odpowiada")).toBeVisible();
      expect(
        within(alert).getByText(
          "Nie udało się zalogować przez X. Spróbuj za chwilę albo wybierz inny sposób.",
        ),
      ).toBeVisible();
    });
  });

  describe("given the app failed", () => {
    it("says that something went wrong", () => {
      renderPanel({ view: { kind: "choose", error: { kind: "failed" } } });

      expect(
        within(screen.getByRole("alert")).getByText("Coś poszło nie tak"),
      ).toBeVisible();
    });
  });

  describe("given the address belongs to a Google account and Facebook was used", () => {
    const view = {
      kind: "account-exists",
      provider: "facebook",
      ownerProvider: "google",
      email: "ala.nowak@example.com",
    } as const;

    it("names the address, the owner and the provider to be added", () => {
      renderPanel({ view });

      expect(
        screen.getByRole("heading", { name: "To konto już istnieje" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Adres ala.nowak@example.com należy do konta założonego przez Google. Zaloguj się przez Google, a Facebooka dodamy jako drugi sposób logowania.",
        ),
      ).toBeInTheDocument();
    });

    it("offers only the owner's sign-in and another way", () => {
      renderPanel({ view });

      expect(
        screen.getAllByRole("button").map((item) => item.textContent),
      ).toEqual(["Zaloguj się przez Google", "Wybierz inny sposób"]);
    });

    it("signs in with the owner", () => {
      const { onProviderSelect } = renderPanel({ view });

      fireEvent.click(button("Zaloguj się przez Google"));

      expect(onProviderSelect).toHaveBeenCalledWith("google");
    });

    it("goes back to the providers on another way", () => {
      const { onChooseAnother } = renderPanel({ view });

      fireEvent.click(button("Wybierz inny sposób"));

      expect(onChooseAnother).toHaveBeenCalledOnce();
    });

    it("shows no terms links", () => {
      renderPanel({ view });

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("waits on the owner's button and disables the other way", () => {
      const { onProviderSelect } = renderPanel({
        view: { ...view, isWaiting: true },
      });

      fireEvent.click(button("Czekamy na Google…"));

      expect(onProviderSelect).not.toHaveBeenCalled();
      expect(button("Wybierz inny sposób")).toBeDisabled();
    });
  });

  describe("given a close handler", () => {
    it("draws the close button and calls it", () => {
      const onClose = vi.fn();
      renderPanel({ onClose });

      fireEvent.click(button("Zamknij"));

      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
