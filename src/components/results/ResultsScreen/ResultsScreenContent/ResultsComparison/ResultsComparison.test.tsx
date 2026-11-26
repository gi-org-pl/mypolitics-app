import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { ResultsComparison } from "./ResultsComparison";

describe("<ResultsComparison />", () => {
  describe("when rendered", () => {
    it("says that comparison is coming", () => {
      renderWithI18n(<ResultsComparison />);

      expect(
        screen.getByText("Porównanie będzie dostępne wkrótce."),
      ).toBeInTheDocument();
    });
  });
});
