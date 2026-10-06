import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResultsHeaderRing } from "./ResultsHeaderRing";

const IMAGE_URL = "https://example.org/liberalism.png";

describe("<ResultsHeaderRing />", () => {
  describe("given a confidence", () => {
    it("draws an arc as long as the confidence", () => {
      render(<ResultsHeaderRing confidence={86.6} band="match" />);

      const arc = screen.getByTestId("results-header-ring-arc");

      expect(arc).toHaveAttribute("pathLength", "100");
      expect(arc).toHaveAttribute("stroke-dasharray", "86.6 100");
    });

    it("hides the decorative ring from assistive technology", () => {
      render(<ResultsHeaderRing confidence={80} band="match" />);

      expect(screen.getByTestId("results-header-ring")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });

  describe("given the match band", () => {
    it("draws the ring in the match colour", () => {
      render(<ResultsHeaderRing confidence={80} band="match" />);

      expect(
        screen.getByTestId("results-header-ring").parentElement,
      ).toHaveClass("text-gi-green");
    });
  });

  describe("given the partial band", () => {
    it("draws the ring in the partial colour", () => {
      render(<ResultsHeaderRing confidence={75} band="partial" />);

      expect(
        screen.getByTestId("results-header-ring").parentElement,
      ).toHaveClass("text-gi-orange");
    });
  });

  describe("given an image", () => {
    it("renders it inside the ring", () => {
      render(
        <ResultsHeaderRing confidence={80} band="match" imageUrl={IMAGE_URL} />,
      );

      expect(
        screen.getByTestId("results-header-image").querySelector("img"),
      ).toHaveAttribute("src", IMAGE_URL);
      expect(
        screen.queryByTestId("results-header-image-placeholder"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given no image", () => {
    it("renders a neutral placeholder inside the ring", () => {
      render(<ResultsHeaderRing confidence={80} band="match" />);

      expect(
        screen.getByTestId("results-header-image-placeholder").parentElement,
      ).toContainElement(screen.getByTestId("results-header-ring"));
      expect(
        screen.queryByTestId("results-header-image"),
      ).not.toBeInTheDocument();
    });
  });
});
