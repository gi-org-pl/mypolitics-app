import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EMAIL_CONSENT_WORDING } from "@/constants/survey";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyEmailCaptureConsent } from "./SurveyEmailCaptureConsent";

const CONSENT =
  "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja.";
const PROMISE =
  "Dbamy o Twoją prywatność, Twoje dane osobowe (w tym adres e-mail) nigdy nie będą powiązane z danymi o Twoich poglądach.";

const onConsentChange = vi.fn();

const renderConsent = (hasConsent = false) => {
  onConsentChange.mockClear();

  return renderWithI18n(
    <SurveyEmailCaptureConsent
      hasConsent={hasConsent}
      privacyPolicyHref="/privacy"
      promiseId="promise"
      onConsentChange={onConsentChange}
    />,
  );
};

const getBox = () => screen.getByRole("checkbox", { name: CONSENT });

const getPrivacyLink = () =>
  screen.getByRole("link", { name: "Polityka prywatności." });

describe("<SurveyEmailCaptureConsent />", () => {
  describe("given no consent", () => {
    it("shows an unticked box named by the consent text", () => {
      renderConsent();

      expect(getBox()).not.toBeChecked();
      expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    });

    it("shows the promise under the identifier it is given", () => {
      renderConsent();

      expect(screen.getByText(PROMISE)).toHaveAttribute("id", "promise");
    });
  });

  describe("given consent", () => {
    it("shows a ticked box", () => {
      renderConsent(true);

      expect(getBox()).toBeChecked();
    });
  });

  describe("when the box or its text is pressed", () => {
    it("calls onConsentChange when the box or its text is pressed", () => {
      renderConsent();

      fireEvent.click(getBox());
      fireEvent.click(screen.getByText(CONSENT));

      expect(onConsentChange.mock.calls).toEqual([[true], [true]]);
    });

    it("calls onConsentChange with false when a ticked box is pressed", () => {
      renderConsent(true);

      fireEvent.click(getBox());

      expect(onConsentChange.mock.calls).toEqual([[false]]);
    });

    it("stays as it was given until the parent changes it", () => {
      renderConsent();

      fireEvent.click(getBox());

      expect(getBox()).not.toBeChecked();
    });
  });

  describe("when the privacy link is pressed", () => {
    it("opens the privacy page in a new tab without toggling the box", () => {
      renderConsent();

      expect(getPrivacyLink()).toHaveAttribute("href", "/privacy");
      expect(getPrivacyLink()).toHaveAttribute("target", "_blank");
      expect(getPrivacyLink()).toHaveAttribute("rel", "noopener noreferrer");

      fireEvent.click(getPrivacyLink());

      expect(onConsentChange).not.toHaveBeenCalled();
    });

    it("is not part of the label of the box", () => {
      renderConsent();

      expect(getPrivacyLink().closest("label")).toBeNull();
      expect(getBox()).not.toContainElement(getPrivacyLink());
    });
  });

  describe("when the promise is pressed", () => {
    it("does nothing when the promise is pressed", () => {
      renderConsent();

      fireEvent.click(screen.getByText(PROMISE));

      expect(onConsentChange).not.toHaveBeenCalled();
      expect(screen.getByText(PROMISE).closest("label")).toBeNull();
    });
  });

  describe("the order of the controls", () => {
    it("reaches the box before the privacy link", () => {
      renderConsent();

      expect(
        getBox().compareDocumentPosition(getPrivacyLink()) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });
});

describe("EMAIL_CONSENT_WORDING", () => {
  it("is pinned to the consent sentence of the card, so changing one without the other fails", () => {
    renderConsent();

    // The identifier names this very sentence: it is what the back-end keeps
    // as evidence of what the taker agreed to. A change of the sentence takes
    // a new identifier in the same commit, and both lines below with it.
    expect(EMAIL_CONSENT_WORDING).toBe("marketing-v1");
    expect(screen.getByRole("checkbox")).toHaveAccessibleName(
      "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja.",
    );
  });
});
