import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyResultsCalculationActions } from "./SurveyResultsCalculationActions";

describe("<SurveyResultsCalculationActions />", () => {
  describe("given the card", () => {
    it('draws "Pobierz" then "Pełne wyniki", both disabled buttons', () => {
      renderWithI18n(<SurveyResultsCalculationActions />);

      const actions = screen.getAllByRole("button");

      expect(actions.map((action) => action.textContent)).toEqual([
        "Pobierz",
        "Pełne wyniki",
      ]);
      expect(screen.getByRole("button", { name: "Pobierz" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Pełne wyniki" }),
      ).toBeDisabled();
    });

    it('draws "Pobierz" with its download icon, hidden from assistive technology', () => {
      renderWithI18n(<SurveyResultsCalculationActions />);

      const [download, fullResults] = screen.getAllByRole("button");

      expect(download.querySelector("[aria-hidden='true']")).toHaveStyle({
        maskImage: expect.stringContaining("download"),
      });
      expect(
        fullResults.querySelector("[aria-hidden='true']"),
      ).not.toBeInTheDocument();
    });
  });

  describe("when an action is pressed", () => {
    it("does nothing and takes no focus", () => {
      renderWithI18n(<SurveyResultsCalculationActions />);

      const download = screen.getByRole("button", { name: "Pobierz" });

      fireEvent.click(download);
      download.focus();

      expect(download).toBeDisabled();
      expect(download).not.toHaveFocus();
    });
  });
});
