import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockResizeObserver } from "@/utils/vitest/mockResizeObserver";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { AccountSetupForm } from "./AccountSetupForm";
import type { AccountSetupFormProps } from "./AccountSetupForm.types";

const NAME_MISSING = "Wpisz nazwę, którą podpiszemy Twoje quizy.";
const NAME_TOO_SHORT = "Nazwa musi mieć co najmniej 2 znaki.";
const AGE = "Konto mogą założyć osoby, które mają ukończone 16 lat.";
const TERMS =
  "Żeby założyć konto, zaakceptuj Regulamin i Politykę prywatności.";

const renderForm = (props: Partial<AccountSetupFormProps> = {}) => {
  const handlers = { onSubmit: vi.fn(), onCancel: vi.fn() };

  renderWithI18n(
    <AccountSetupForm
      provider="google"
      suggestedName="Ala Nowak"
      termsHref="/terms"
      privacyHref="/privacy"
      {...handlers}
      {...props}
    />,
  );

  return handlers;
};

const nameField = () => screen.getByRole("textbox", { name: "Nazwa" });
const ageBox = () => screen.getByRole("checkbox", { name: /16 lat/ });
const termsBox = () =>
  screen.getByRole("checkbox", {
    name: "Akceptuję Regulamin i Politykę prywatności.",
  });
const done = () => screen.getByRole("button", { name: "Gotowe" });

const tickBoth = () => {
  fireEvent.click(ageBox());
  fireEvent.click(termsBox());
};

describe("AccountSetupForm", () => {
  // The boxes stand in a form, where Athena's Checkbox measures a hidden
  // input with a ResizeObserver, which jsdom does not have.
  beforeEach(() => {
    mockResizeObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("given a suggested name", () => {
    it("starts with the name, both boxes unticked and nothing focused", () => {
      renderForm();

      expect(
        screen.getByRole("heading", { name: "Prawie gotowe" }),
      ).toBeInTheDocument();
      expect(nameField()).toHaveValue("Ala Nowak");
      expect(ageBox()).not.toBeChecked();
      expect(termsBox()).not.toBeChecked();
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe("given no suggested name", () => {
    it("starts with an empty field", () => {
      renderForm({ suggestedName: undefined });

      expect(nameField()).toHaveValue("");
    });
  });

  describe("given a suggested name longer than a name may be", () => {
    it("starts with its first 50 characters", () => {
      renderForm({ suggestedName: "a".repeat(70) });

      expect(nameField()).toHaveValue("a".repeat(50));
    });
  });

  describe("given a valid name and both boxes", () => {
    it("hands over the cleaned name with both declarations", () => {
      const { onSubmit } = renderForm();
      fireEvent.change(nameField(), { target: { value: "  Ala   Nowak " } });
      tickBoth();

      fireEvent.click(done());

      expect(onSubmit).toHaveBeenCalledWith({
        displayName: "Ala Nowak",
        isAgeDeclared: true,
        hasAcceptedTerms: true,
      });
    });

    it("acts on Enter in the name field as on the button", () => {
      const { onSubmit } = renderForm();
      tickBoth();

      fireEvent.submit(nameField());

      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });

  describe("given nothing is filled in", () => {
    it("shows every message, calls nothing and focuses the field", () => {
      const { onSubmit } = renderForm({ suggestedName: undefined });

      fireEvent.click(done());

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(NAME_MISSING)).toBeInTheDocument();
      expect(screen.getByText(AGE)).toBeInTheDocument();
      expect(screen.getByText(TERMS)).toBeInTheDocument();
      expect(nameField()).toHaveFocus();
      expect(nameField()).toHaveAttribute("aria-invalid", "true");
      expect(nameField()).toHaveAccessibleDescription(NAME_MISSING);
    });
  });

  describe("given a name of spaces only", () => {
    it("treats it as missing", () => {
      renderForm({ suggestedName: "   " });
      tickBoth();

      fireEvent.click(done());

      expect(screen.getByText(NAME_MISSING)).toBeInTheDocument();
    });
  });

  describe("given a name of one character", () => {
    it("says it is too short", () => {
      renderForm({ suggestedName: "A" });
      tickBoth();

      fireEvent.click(done());

      expect(screen.getByText(NAME_TOO_SHORT)).toBeInTheDocument();
    });
  });

  describe("given only the age is missing", () => {
    it("shows its message on the box and focuses it", () => {
      const { onSubmit } = renderForm();
      fireEvent.click(termsBox());

      fireEvent.click(done());

      expect(onSubmit).not.toHaveBeenCalled();
      expect(ageBox()).toHaveFocus();
      expect(ageBox()).toHaveAccessibleDescription(AGE);
      expect(screen.queryByText(TERMS)).not.toBeInTheDocument();
    });
  });

  describe("given only the terms are missing", () => {
    it("shows its message on the box and focuses it", () => {
      renderForm();
      fireEvent.click(ageBox());

      fireEvent.click(done());

      expect(termsBox()).toHaveFocus();
      expect(termsBox()).toHaveAccessibleDescription(TERMS);
    });
  });

  describe("given messages are shown", () => {
    it("takes each away as soon as its item is fixed", () => {
      renderForm({ suggestedName: undefined });
      fireEvent.click(done());

      fireEvent.change(nameField(), { target: { value: "Ola" } });
      fireEvent.click(ageBox());

      expect(screen.queryByText(NAME_MISSING)).not.toBeInTheDocument();
      expect(screen.queryByText(AGE)).not.toBeInTheDocument();
      expect(screen.getByText(TERMS)).toBeInTheDocument();
    });
  });

  describe("given more than 50 characters typed, some outside the basic plane", () => {
    it("keeps 50 characters, however many UTF-16 units they take", () => {
      renderForm({ suggestedName: undefined });

      fireEvent.change(nameField(), { target: { value: "😀".repeat(60) } });

      expect(Array.from((nameField() as HTMLInputElement).value)).toHaveLength(
        50,
      );
    });
  });

  describe("given a pasted tab", () => {
    it("turns it into a space", () => {
      renderForm({ suggestedName: undefined });

      fireEvent.change(nameField(), { target: { value: "Ala\tNowak" } });

      expect(nameField()).toHaveValue("Ala Nowak");
    });
  });

  describe("given the account is being saved", () => {
    it("makes the button busy and the step unchangeable", () => {
      const { onSubmit } = renderForm({ isSaving: true });

      fireEvent.click(done());

      expect(done()).toHaveAttribute("aria-busy", "true");
      expect(onSubmit).not.toHaveBeenCalled();
      expect(ageBox()).toBeDisabled();
      expect(termsBox()).toBeDisabled();
      expect(screen.getByRole("button", { name: "Anuluj" })).toBeDisabled();
    });

    it("disables the close button as well", () => {
      renderForm({ isSaving: true, onClose: vi.fn() });

      expect(screen.getByRole("button", { name: "Zamknij" })).toBeDisabled();
    });

    it("ignores a submit of the field", () => {
      const { onSubmit } = renderForm({ isSaving: true });

      fireEvent.submit(nameField());

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("given the save failed", () => {
    it("announces it above the buttons", () => {
      renderForm({ hasSaveFailed: true });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Nie udało się zapisać konta. Spróbuj jeszcze raz.",
      );
    });
  });

  describe("given the step", () => {
    it("calls onCancel on the cancel button", () => {
      const { onCancel } = renderForm();

      fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));

      expect(onCancel).toHaveBeenCalledOnce();
    });

    it("opens the terms in a new tab without ticking the box", () => {
      renderForm();

      const terms = screen.getByRole("link", { name: "Regulamin" });
      fireEvent.click(terms);

      expect(terms).toHaveAttribute("target", "_blank");
      expect(termsBox()).not.toBeChecked();
    });
  });

  describe.each([
    ["google", "Dane z konta Google"],
    ["facebook", "Dane z konta na Facebooku"],
    ["x", "Dane z konta X"],
  ] as const)("given a sign-in with %s", (provider, words) => {
    it("names the provider in the promise", () => {
      renderForm({ provider });

      expect(screen.getByText(new RegExp(words))).toBeInTheDocument();
    });
  });
});
