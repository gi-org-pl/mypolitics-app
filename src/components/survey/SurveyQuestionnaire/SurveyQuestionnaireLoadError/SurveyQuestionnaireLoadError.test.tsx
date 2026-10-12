import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyQuestionnaireLoadError } from "./SurveyQuestionnaireLoadError";

const renderError = () => {
  const onRetry = vi.fn();

  renderWithI18n(<SurveyQuestionnaireLoadError onRetry={onRetry} />);

  return { onRetry };
};

describe("<SurveyQuestionnaireLoadError />", () => {
  describe("when the quiz could not be read", () => {
    it("shows the heading, the line and the retry button", () => {
      renderError();

      expect(
        screen.getByRole("heading", { name: "Nie udało się wczytać quizu" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Sprawdź połączenie z internetem i spróbuj ponownie."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Spróbuj ponownie" }),
      ).toBeEnabled();
    });

    it("announces the failure", () => {
      renderError();

      const alert = within(screen.getByRole("alert"));

      expect(
        alert.getByRole("heading", { name: "Nie udało się wczytać quizu" }),
      ).toBeInTheDocument();
      expect(
        alert.getByRole("button", { name: "Spróbuj ponownie" }),
      ).toBeInTheDocument();
    });
  });

  describe("when retry is pressed", () => {
    it("calls onRetry", () => {
      const { onRetry } = renderError();

      fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
