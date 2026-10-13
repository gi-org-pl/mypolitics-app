import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResultsHeaderLowMatchNotice } from "./ResultsHeaderLowMatchNotice";

const TEXT =
  "Twoje poglądy nie są wystarczająco podobne do żadnej tożsamości (mniej niż 50% pewności).";

const getNotice = () => screen.getByTestId("results-header-low-match-notice");

describe("<ResultsHeaderLowMatchNotice />", () => {
  describe("given a text", () => {
    it("renders it as a paragraph", () => {
      render(<ResultsHeaderLowMatchNotice text={TEXT} />);

      expect(getNotice().tagName).toBe("P");
      expect(getNotice()).toHaveTextContent(TEXT);
    });

    it("draws it in the colour of the band of no match, on a tint of that colour", () => {
      render(<ResultsHeaderLowMatchNotice text={TEXT} />);

      expect(getNotice()).toHaveClass("text-gi-red", "bg-current/10");
    });

    it("wraps the text and never cuts it", () => {
      render(<ResultsHeaderLowMatchNotice text={TEXT} />);

      expect(screen.getByText(TEXT)).toHaveClass("wrap-break-word");
      expect(screen.getByText(TEXT).className).not.toMatch(
        /truncate|line-clamp/,
      );
    });
  });
});
