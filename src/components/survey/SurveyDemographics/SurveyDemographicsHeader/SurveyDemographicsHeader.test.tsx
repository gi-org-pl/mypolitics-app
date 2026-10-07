import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyDemographicsHeader } from "./SurveyDemographicsHeader";

describe("<SurveyDemographicsHeader />", () => {
  describe("when rendered", () => {
    it("renders the title and the description", () => {
      renderWithI18n(<SurveyDemographicsHeader />);

      expect(
        screen.getByRole("heading", { level: 2, name: "Twoja tożsamość" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "W tym teście otrzymasz dostosowaną pod siebie kartę tożsamości",
        ),
      ).toBeInTheDocument();
    });

    it("hides the illustration from assistive technology", () => {
      const { container } = renderWithI18n(<SurveyDemographicsHeader />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(container.querySelector("img")).toHaveAttribute("alt", "");
    });

    it("separates the title from the description", () => {
      renderWithI18n(<SurveyDemographicsHeader />);

      expect(screen.getByRole("separator")).toBeInTheDocument();
    });
  });
});
