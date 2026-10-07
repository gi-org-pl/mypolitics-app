import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { ResultsHeaderConfidence } from "./ResultsHeaderConfidence";

describe("<ResultsHeaderConfidence />", () => {
  describe("given a confidence", () => {
    it("renders it as a rounded percentage with its word", () => {
      renderWithI18n(
        <ResultsHeaderConfidence confidence={86.6} band="match" />,
      );

      expect(screen.getByText("87% pewności")).toBeInTheDocument();
    });
  });

  describe("given the match band", () => {
    it("renders the text in the match colour", () => {
      renderWithI18n(<ResultsHeaderConfidence confidence={80} band="match" />);

      expect(screen.getByTestId("results-header-confidence")).toHaveClass(
        "text-gi-green",
      );
    });
  });

  describe("given the partial band", () => {
    it("renders the text in the partial colour, whatever it rounds to", () => {
      renderWithI18n(
        <ResultsHeaderConfidence confidence={79.9} band="partial" />,
      );

      expect(screen.getByText("80% pewności")).toHaveClass("text-gi-orange");
    });
  });
});
