
import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDescriptionPreview,
  renderWithUnderscores,
  SurveyQuestion,
} from "./SurveyQuestion";
import * as Constants from "./SurveyQuestion.constants";

const renderWithProviders = (ui: React.ReactElement) =>
  render(<I18nProvider i18n={i18n as any}>{ui}</I18nProvider>);

const DEFAULT_PROPS = {
  question: "Q",
  options: [{ id: "1", label: "O", text: "T" }],
  onSelectedOptionIdChange: vi.fn(),
};

describe("Komponent SurveyQuestion", () => {
  beforeEach(() => vi.restoreAllMocks());

  describe("renderWithUnderscores", () => {
    it("prawidłowo obsługuje przypadki z pustą listą fraz oraz z dopasowaniem tekstu", () => {
      const spy = vi.spyOn(Constants, "getUnderscoredPhrases");

      spy.mockReturnValue([]);
      expect(renderWithUnderscores("zwykły tekst")).toEqual(["zwykły tekst"]);

      spy.mockReturnValue(["nie"]);
      const result = renderWithUnderscores("nie");
      expect(result.some((item) => typeof item !== "string")).toBe(true);
    });
  });

  describe("getDescriptionPreview", () => {
    it("poprawnie formatuje triggery, zwraca krótkie opisy bez zmian i ucina zbyt długi tekst", () => {
      const trigger = Constants.EXPLANATION_TRIGGER_PHRASES[0];

      expect(getDescriptionPreview(trigger)).toBe(`${trigger}...`);
      expect(getDescriptionPreview("krótki")).toBe("krótki");

      const longText =
        "To jest bardzo długi tekst, który powinien zostać przycięty przez funkcję";
      const result = getDescriptionPreview(longText);
      expect(result).toMatch(/\.\.\.$/);
      expect(result.length).toBeLessThanOrEqual(
        Constants.EXPLANATION_PREVIEW_FALLBACK_CHARS + 3,
      );
    });
  });

  describe("DescriptionPanel", () => {
    it("zmienia widoczność zawartości panelu wyjaśnień po kliknięciu przycisku", () => {
      renderWithProviders(
        <SurveyQuestion {...DEFAULT_PROPS} questionDescription="opis" />,
      );
      const toggle = screen.getByTestId("explanation-toggle");

      fireEvent.click(toggle);
      expect(screen.getByTestId("explanation-content")).toBeVisible();
    });
  });

  describe("Dynamiczne renderowanie", () => {
    it("nie renderuje przycisku wyjaśnienia, gdy opis nie jest podany, i dodaje go po aktualizacji propsów", () => {
      const { rerender } = renderWithProviders(
        <SurveyQuestion {...DEFAULT_PROPS} />,
      );
      expect(
        screen.queryByTestId("explanation-toggle"),
      ).not.toBeInTheDocument();

      rerender(
        <I18nProvider i18n={i18n as any}>
          <SurveyQuestion {...DEFAULT_PROPS} questionDescription="dane" />
        </I18nProvider>,
      );
      expect(screen.getByTestId("explanation-toggle")).toBeInTheDocument();
    });

    it("poprawnie obsługuje przekazywanie treści pytania i opisu przez MessageDescriptor z Lingui", () => {
      const { rerender } = renderWithProviders(
        <SurveyQuestion {...DEFAULT_PROPS} question={msg`Q`} />,
      );
      expect(screen.getByTestId("question-text").textContent).toBe("Q");

      rerender(
        <I18nProvider i18n={i18n as any}>
          <SurveyQuestion {...DEFAULT_PROPS} questionDescription={msg`D`} />
        </I18nProvider>,
      );
      expect(screen.getByTestId("explanation-toggle")).toBeInTheDocument();
    });
  });
});
