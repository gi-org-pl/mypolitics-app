import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResultsHeaderNoMatchMark } from "./ResultsHeaderNoMatchMark";

describe("<ResultsHeaderNoMatchMark />", () => {
  describe("when rendered", () => {
    it("renders a decorative question mark", () => {
      render(<ResultsHeaderNoMatchMark />);

      const mark = screen.getByTestId("results-header-question-mark");

      expect(mark.tagName).toBe("IMG");
      expect(mark).toHaveAttribute("alt", "");
    });

    it("renders no ring", () => {
      render(<ResultsHeaderNoMatchMark />);

      expect(
        screen.queryByTestId("results-header-ring"),
      ).not.toBeInTheDocument();
    });
  });
});
