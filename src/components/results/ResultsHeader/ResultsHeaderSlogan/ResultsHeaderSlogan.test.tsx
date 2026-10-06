import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResultsHeaderSlogan } from "./ResultsHeaderSlogan";

const LONG_TEXT =
  "Wolność, równość i solidarność dla każdego, kto chce budować wspólną przyszłość";

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
    it("truncates it to one line and keeps it complete", () => {
      render(<ResultsHeaderSlogan text={LONG_TEXT} />);

      const text = screen.getByText(LONG_TEXT);

      expect(text).toHaveClass("truncate");
      expect(text).toHaveTextContent(LONG_TEXT);
    });
  });
});
