import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResultsHeaderSlogan } from "./ResultsHeaderSlogan";

const LONG_TEXT =
  "Wolność, równość i solidarność dla każdego, kto chce budować wspólną przyszłość";
// The longest slogan of the identity quiz, 42 characters.
const REAL_SLOGAN = "Pracownicy wszystkich narodów łączcie się!";

describe("<ResultsHeaderSlogan />", () => {
  describe("given a text", () => {
    it("renders it as a non-interactive chip", () => {
      render(<ResultsHeaderSlogan text="Wolność i równość" />);

      const slogan = screen.getByTestId("results-header-slogan");

      expect(slogan).toHaveTextContent("Wolność i równość");
      expect(slogan.querySelector("a, button")).toBeNull();
      expect(slogan).not.toHaveAttribute("tabindex");
    });

    it("renders a decorative icon", () => {
      render(<ResultsHeaderSlogan text="Wolność i równość" />);

      expect(
        screen.getByTestId("results-header-slogan").querySelector("img"),
      ).toHaveAttribute("alt", "");
    });
  });

  describe("given a text longer than the room", () => {
    it.each([
      [REAL_SLOGAN],
      [LONG_TEXT],
    ])("wraps it onto more lines and never cuts it: %s", (slogan) => {
      render(<ResultsHeaderSlogan text={slogan} />);

      const text = screen.getByText(slogan);

      expect(text).toHaveClass("wrap-break-word", "min-w-0");
      expect(text.className).not.toMatch(/truncate|line-clamp|nowrap/);
      expect(text).toHaveTextContent(slogan);
    });

    it("keeps the icon beside the first line", () => {
      render(<ResultsHeaderSlogan text={LONG_TEXT} />);

      const slogan = screen.getByTestId("results-header-slogan");

      expect(slogan).toHaveClass("items-start");
      expect(slogan.querySelector("img")).toHaveClass("shrink-0");
    });
  });
});
