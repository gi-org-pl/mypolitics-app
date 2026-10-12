import { fireEvent, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyEmailCapture } from "./SurveyEmailCapture";
import type { SurveyEmailCaptureProps } from "./SurveyEmailCapture.types";

const BODY =
  "Wyślemy na Twój e-mail link do wyników, dzięki czemu łatwo do nich wrócisz.";
const CONSENT =
  "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja.";
const PROMISE =
  "Dbamy o Twoją prywatność, Twoje dane osobowe (w tym adres e-mail) nigdy nie będą powiązane z danymi o Twoich poglądach.";
const HINT = "Wpisz pełny adres e-mail, na przykład twoj@mail.com.";
const SKIP = "Pomiń";
const SUBMIT = "Wyślij i zobacz wyniki";

const handlers = {
  onAddressChange: vi.fn(),
  onConsentChange: vi.fn(),
  onSubmit: vi.fn(),
  onSkip: vi.fn(),
};

// The card is controlled: the test keeps what is typed and ticked, like the
// phase does, and reports every call.
const Card = ({
  address: firstAddress = "",
  hasConsent: firstHasConsent = false,
}: Partial<SurveyEmailCaptureProps>) => {
  const [address, setAddress] = useState(firstAddress);
  const [hasConsent, setHasConsent] = useState(firstHasConsent);

  return (
    <SurveyEmailCapture
      address={address}
      hasConsent={hasConsent}
      privacyPolicyHref="/privacy"
      onAddressChange={(typedAddress) => {
        handlers.onAddressChange(typedAddress);
        setAddress(typedAddress);
      }}
      onConsentChange={(isTicked) => {
        handlers.onConsentChange(isTicked);
        setHasConsent(isTicked);
      }}
      onSubmit={handlers.onSubmit}
      onSkip={handlers.onSkip}
    />
  );
};

const renderCard = (props: Partial<SurveyEmailCaptureProps> = {}) => {
  vi.clearAllMocks();

  return renderWithI18n(<Card {...props} />);
};

const getField = () => screen.getByRole("textbox", { name: "Adres e-mail" });

const type = (text: string) =>
  fireEvent.change(getField(), { target: { value: text } });

const getBox = () => screen.getByRole("checkbox", { name: CONSENT });

const getPrivacyLink = () =>
  screen.getByRole("link", { name: "Polityka prywatności." });

const getButton = (name: string) => screen.getByRole("button", { name });

const queryButton = (name: string) => screen.queryByRole("button", { name });

describe("<SurveyEmailCapture />", () => {
  describe("given an empty field", () => {
    it('shows the heading, the body, the placeholder, the consent, the promise and "Pomiń"', () => {
      renderCard();

      expect(
        screen.getByRole("heading", { level: 2, name: "Zapisz swoje wyniki!" }),
      ).toBeInTheDocument();
      expect(screen.getByText(BODY)).toBeInTheDocument();
      expect(getField()).toHaveValue("");
      expect(getField()).toHaveAttribute("placeholder", "twoj@mail.com");
      expect(getBox()).not.toBeChecked();
      expect(getPrivacyLink()).toHaveAttribute("href", "/privacy");
      expect(screen.getByText(PROMISE)).toBeInTheDocument();
      expect(getButton(SKIP)).toBeEnabled();
      expect(queryButton(SUBMIT)).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does not focus the field", () => {
      renderCard();

      expect(getField()).not.toHaveFocus();
      expect(document.body).toHaveFocus();
    });

    it('calls onSkip when "Pomiń" is pressed', () => {
      renderCard();

      fireEvent.click(getButton(SKIP));

      expect(handlers.onSkip).toHaveBeenCalledTimes(1);
      expect(handlers.onSubmit).not.toHaveBeenCalled();
    });

    it("does nothing when Enter is pressed in the field", () => {
      renderCard({ address: "  " });

      fireEvent.keyDown(getField(), { key: "Enter" });

      expect(handlers.onSkip).not.toHaveBeenCalled();
      expect(handlers.onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("given text that is not a valid address", () => {
    it.each([
      ["biuro@mypolitics"],
      ["biuro"],
      ["Jan Kowalski <jan@poczta.pl>"],
      ["   "],
    ])('keeps the button "Pomiń": %j', (address) => {
      renderCard({ address });

      expect(getButton(SKIP)).toBeEnabled();
      expect(queryButton(SUBMIT)).not.toBeInTheDocument();
    });

    it('calls onSkip when "Pomiń" is pressed, and hands nothing over', () => {
      renderCard({ address: "biuro@mypolitics" });

      fireEvent.click(getButton(SKIP));

      expect(handlers.onSkip).toHaveBeenCalledTimes(1);
      expect(handlers.onSubmit).not.toHaveBeenCalled();
    });

    it("shows the hint and neither submits nor skips when Enter is pressed", () => {
      renderCard({ address: "biuro@mypolitics" });

      fireEvent.keyDown(getField(), { key: "Enter" });

      expect(screen.getByRole("alert")).toHaveTextContent(HINT);
      expect(handlers.onSubmit).not.toHaveBeenCalled();
      expect(handlers.onSkip).not.toHaveBeenCalled();
    });
  });

  describe("given a valid address", () => {
    it('names the button "Wyślij i zobacz wyniki" and draws no "Pomiń"', () => {
      renderCard({ address: "biuro@mypolitics.pl" });

      expect(getButton(SUBMIT)).toBeEnabled();
      expect(queryButton(SKIP)).not.toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("calls onSubmit with the trimmed address when the button is pressed", () => {
      renderCard({ address: "  Biuro@myPolitics.pl " });

      fireEvent.click(getButton(SUBMIT));

      expect(handlers.onSubmit).toHaveBeenCalledTimes(1);
      expect(handlers.onSubmit).toHaveBeenCalledWith("Biuro@myPolitics.pl");
      expect(handlers.onSkip).not.toHaveBeenCalled();
    });

    it("calls onSubmit with the trimmed address when Enter is pressed in the field", () => {
      renderCard({ address: " biuro@mypolitics.pl" });

      fireEvent.keyDown(getField(), { key: "Enter" });

      expect(handlers.onSubmit).toHaveBeenCalledTimes(1);
      expect(handlers.onSubmit).toHaveBeenCalledWith("biuro@mypolitics.pl");
      expect(handlers.onSkip).not.toHaveBeenCalled();
    });

    it("never says that a link was sent, and shows no waiting state", () => {
      renderCard({ address: "biuro@mypolitics.pl" });

      fireEvent.click(getButton(SUBMIT));

      expect(getButton(SUBMIT)).toBeEnabled();
      expect(getButton(SUBMIT)).not.toHaveAttribute("aria-busy", "true");
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("when the address stops being valid", () => {
    it('turns the button back into "Pomiń", in the same element', () => {
      renderCard({ address: "biuro@mypolitics.pl" });

      const button = getButton(SUBMIT);

      button.focus();
      type("biuro@mypolitics.p");
      type("biuro@mypolitics.");

      expect(getButton(SKIP)).toBe(button);
      expect(button).toHaveFocus();

      type("biuro@mypolitics.pl");

      expect(getButton(SUBMIT)).toBe(button);
      expect(button).toHaveFocus();
    });

    it('brings "Pomiń" back when the field is cleared', () => {
      renderCard({ address: "biuro@mypolitics.pl" });

      type("");
      fireEvent.click(getButton(SKIP));

      expect(handlers.onSkip).toHaveBeenCalledTimes(1);
      expect(handlers.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("given a ticked box", () => {
    it("does not change the button, with a valid address or without one", () => {
      renderCard({ hasConsent: true });

      expect(getBox()).toBeChecked();
      expect(getButton(SKIP)).toBeEnabled();

      fireEvent.click(getBox());

      expect(getBox()).not.toBeChecked();
      expect(getButton(SKIP)).toBeEnabled();

      type("biuro@mypolitics.pl");

      expect(getButton(SUBMIT)).toBeEnabled();

      fireEvent.click(getBox());

      expect(getBox()).toBeChecked();
      expect(getButton(SUBMIT)).toBeEnabled();
    });

    it("skips all the same: consent without an address is nothing", () => {
      renderCard({ hasConsent: true });

      fireEvent.click(getButton(SKIP));

      expect(handlers.onSkip).toHaveBeenCalledTimes(1);
      expect(handlers.onSubmit).not.toHaveBeenCalled();
      expect(handlers.onConsentChange).not.toHaveBeenCalled();
    });
  });

  describe("when the taker types", () => {
    it("calls onAddressChange with the text as typed", () => {
      renderCard();

      type("Jan Kowalski <jan");

      expect(handlers.onAddressChange).toHaveBeenCalledTimes(1);
      expect(handlers.onAddressChange).toHaveBeenCalledWith(
        "Jan Kowalski <jan",
      );
      expect(getField()).toHaveValue("Jan Kowalski <jan");
    });
  });

  describe("when the box is pressed", () => {
    it("calls onConsentChange", () => {
      renderCard();

      fireEvent.click(getBox());

      expect(handlers.onConsentChange).toHaveBeenCalledTimes(1);
      expect(handlers.onConsentChange).toHaveBeenCalledWith(true);
    });
  });

  describe("when the field is left with text that is not valid", () => {
    it("shows the hint under the field", () => {
      renderCard({ address: "biuro@mypolitics" });

      fireEvent.blur(getField());

      expect(screen.getByRole("alert")).toHaveTextContent(HINT);
      expect(getButton(SKIP)).toBeEnabled();
    });
  });

  describe("accessibility", () => {
    it('names the field "Adres e-mail" and marks it as an e-mail field', () => {
      renderCard();

      expect(getField()).toHaveAttribute("type", "email");
      expect(getField()).toHaveAttribute("autocomplete", "email");
      expect(screen.queryByLabelText("Adres e-mail")).toBe(getField());
    });

    it("gives the promise to the field as its description", () => {
      renderCard();

      const group = screen.getByRole("group");

      expect(group).toContainElement(getField());
      expect(group).toHaveAccessibleDescription(PROMISE);
      expect(group).not.toContainElement(getBox());
      expect(getBox()).not.toHaveAccessibleDescription();
    });

    it("reaches the field, the checkbox, the privacy link and the button in that order", () => {
      renderCard();

      const controls = [
        getField(),
        getBox(),
        getPrivacyLink(),
        getButton(SKIP),
      ];
      const controlsAsDrawn = [...controls].sort((first, second) =>
        first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      );

      expect(controlsAsDrawn).toEqual(controls);

      // No control is moved in the order or taken out of it.
      for (const control of controls) {
        expect(control.tabIndex).toBe(0);
      }
    });

    it("does not make the heading a stop for the Tab key", () => {
      renderCard();

      expect(screen.getByRole("heading")).not.toHaveAttribute("tabindex");
    });
  });
});
