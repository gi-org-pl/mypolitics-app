import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { ResultsHeaderLinkButton } from "./ResultsHeaderLinkButton";

const LONG_TEXT =
  "Przeczytaj cały program tej orientacji na stronie autora, zanim wybierzesz";

describe("<ResultsHeaderLinkButton />", () => {
  describe("given an address and a label", () => {
    it("renders a link that opens in a new tab and says so", () => {
      renderWithI18n(
        <ResultsHeaderLinkButton
          href="https://example.org/a"
          label="Program"
        />,
      );

      const link = screen.getByRole("link", {
        name: "Program (otwiera się w nowej karcie)",
      });

      expect(link).toHaveTextContent("Program");
      expect(link).toHaveAttribute("href", "https://example.org/a");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders an anchor, not a button", () => {
      renderWithI18n(
        <ResultsHeaderLinkButton
          href="https://example.org/a"
          label="Program"
        />,
      );

      expect(screen.getByRole("link").tagName).toBe("A");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a label longer than the room", () => {
    it("truncates it to one line and keeps it complete", () => {
      renderWithI18n(
        <ResultsHeaderLinkButton
          href="https://example.org"
          label={LONG_TEXT}
        />,
      );

      expect(screen.getByText(LONG_TEXT)).toHaveClass("truncate");
      expect(
        screen.getByRole("link", {
          name: `${LONG_TEXT} (otwiera się w nowej karcie)`,
        }),
      ).toBeInTheDocument();
    });
  });
});
