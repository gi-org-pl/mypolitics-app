import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResultsQuizName } from "./ResultsQuizName";

describe("<ResultsQuizName />", () => {
  describe("given the name of a quiz", () => {
    it("shows the name", () => {
      render(<ResultsQuizName name="Quiz Tożsamościowy" />);

      expect(screen.getByText("Quiz Tożsamościowy")).toBeVisible();
    });

    it("draws the icon for the eye only", () => {
      const { container } = render(
        <ResultsQuizName name="Quiz Tożsamościowy" />,
      );

      expect(
        container.querySelector("[aria-hidden='true']"),
      ).toBeInTheDocument();
      expect(container.firstElementChild).toHaveTextContent(
        /^Quiz Tożsamościowy$/,
      );
    });

    it("collapses line breaks and spaces into one line of text", () => {
      render(<ResultsQuizName name={"  Quiz \n Tożsamościowy  "} />);

      expect(screen.getByText("Quiz Tożsamościowy")).toBeInTheDocument();
    });

    it("lets a long name wrap instead of cutting it", () => {
      render(<ResultsQuizName name="Quiz Tożsamościowy" />);

      const name = screen.getByText("Quiz Tożsamościowy");

      expect(name).toHaveClass("wrap-break-word");
      expect(name).not.toHaveClass("truncate");
    });
  });

  describe("given no name, or a blank one", () => {
    it.each([
      ["none", undefined],
      ["an empty one", ""],
      ["only spaces", "   "],
    ])("renders nothing: %s", (_, name) => {
      const { container } = render(<ResultsQuizName name={name} />);

      expect(container).toBeEmptyDOMElement();
    });
  });
});
