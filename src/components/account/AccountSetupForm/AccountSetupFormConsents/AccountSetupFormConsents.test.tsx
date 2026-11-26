import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { AccountSetupFormConsents } from "./AccountSetupFormConsents";
import type { AccountSetupFormConsentsProps } from "./AccountSetupFormConsents.types";

const IDS = {
  age: "age",
  ageMessage: "age-message",
  terms: "terms",
  termsSentence: "terms-sentence",
  termsMessage: "terms-message",
};

const renderConsents = (props: Partial<AccountSetupFormConsentsProps> = {}) => {
  const handlers = { onAgeChange: vi.fn(), onTermsChange: vi.fn() };

  renderWithI18n(
    <AccountSetupFormConsents
      ids={IDS}
      isAgeDeclared={false}
      hasAcceptedTerms={false}
      isDisabled={false}
      termsHref="/terms"
      privacyHref="/privacy"
      {...handlers}
      {...props}
    />,
  );

  return handlers;
};

const ageBox = () =>
  screen.getByRole("checkbox", { name: "Mam ukończone 16 lat." });
const termsBox = () =>
  screen.getByRole("checkbox", {
    name: "Akceptuję Regulamin i Politykę prywatności.",
  });

describe("AccountSetupFormConsents", () => {
  describe("given two unticked boxes", () => {
    it("names the terms box by the whole sentence", () => {
      renderConsents();

      expect(ageBox()).not.toBeChecked();
      expect(termsBox()).not.toBeChecked();
    });

    it("hands each tick over", () => {
      const { onAgeChange, onTermsChange } = renderConsents();

      fireEvent.click(ageBox());
      fireEvent.click(termsBox());

      expect(onAgeChange).toHaveBeenCalledWith(true);
      expect(onTermsChange).toHaveBeenCalledWith(true);
    });

    it("opens both documents in a new tab without ticking the box", () => {
      const { onTermsChange } = renderConsents();

      const terms = screen.getByRole("link", { name: "Regulamin" });
      const privacy = screen.getByRole("link", {
        name: "Politykę prywatności",
      });
      fireEvent.click(terms);

      expect(terms).toHaveAttribute("href", "/terms");
      expect(terms).toHaveAttribute("target", "_blank");
      expect(privacy).toHaveAttribute("href", "/privacy");
      expect(onTermsChange).not.toHaveBeenCalled();
    });
  });

  describe("given ticked boxes", () => {
    it("hands an untick over", () => {
      const { onAgeChange } = renderConsents({ isAgeDeclared: true });

      fireEvent.click(ageBox());

      expect(onAgeChange).toHaveBeenCalledWith(false);
    });
  });

  describe("given messages", () => {
    it("ties each to its box and marks the box invalid", () => {
      renderConsents({ ageMessage: "Wiek", termsMessage: "Regulamin brak" });

      expect(ageBox()).toHaveAccessibleDescription("Wiek");
      expect(ageBox()).toHaveAttribute("aria-invalid", "true");
      expect(termsBox()).toHaveAccessibleDescription("Regulamin brak");
    });

    it("keeps the message out of the box's name", () => {
      renderConsents({ termsMessage: "Regulamin brak" });

      expect(termsBox()).toHaveAccessibleName(
        "Akceptuję Regulamin i Politykę prywatności.",
      );
    });
  });

  describe("given no messages", () => {
    it("describes neither box", () => {
      renderConsents();

      expect(ageBox()).not.toHaveAttribute("aria-describedby");
      expect(ageBox()).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("given the step is saving", () => {
    it("disables both boxes", () => {
      renderConsents({ isDisabled: true });

      expect(ageBox()).toBeDisabled();
      expect(termsBox()).toBeDisabled();
    });
  });
});
