import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyQuestionnaireLoading } from "./SurveyQuestionnaireLoading";
import { ANSWER_PLACEHOLDERS } from "./SurveyQuestionnaireLoading.constants";

describe("<SurveyQuestionnaireLoading />", () => {
  describe("when the quiz is on its way", () => {
    it('says "Wczytywanie quizu" to assistive technology', () => {
      renderWithI18n(<SurveyQuestionnaireLoading />);

      expect(screen.getByRole("status")).toHaveTextContent(
        /^Wczytywanie quizu$/,
      );
      expect(screen.getByText("Wczytywanie quizu")).toHaveClass("sr-only");
    });

    it("shows the placeholders and no text or button", () => {
      renderWithI18n(<SurveyQuestionnaireLoading />);

      const placeholders = screen.getByRole("status").lastElementChild;

      expect(placeholders).toHaveAttribute("aria-hidden", "true");
      expect(placeholders).toHaveTextContent("");
      // The bar, the three parts of the controls bar, the card, the answers.
      expect(placeholders?.querySelectorAll(".bg-gi-dark-ash")).toHaveLength(
        5 + ANSWER_PLACEHOLDERS.length,
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("keeps the placeholders still", () => {
      const { container } = renderWithI18n(<SurveyQuestionnaireLoading />);

      expect(container.innerHTML).not.toContain("animate-");
    });

    it("takes the width of its parent", () => {
      renderWithI18n(<SurveyQuestionnaireLoading />);

      expect(screen.getByRole("status")).toHaveClass("w-full");
    });
  });
});
