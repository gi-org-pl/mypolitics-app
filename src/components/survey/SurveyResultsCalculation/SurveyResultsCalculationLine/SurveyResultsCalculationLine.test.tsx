import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SurveyResultsCalculationLine } from "./SurveyResultsCalculationLine";

const TEXT = "Szukamy Twojej ćwiartki";

const renderLine = (isCurrent: boolean) =>
  render(
    <ul>
      <SurveyResultsCalculationLine text={TEXT} isCurrent={isCurrent} />
    </ul>,
  );

const getLine = () => screen.getByRole("listitem");

const querySpinner = () => getLine().querySelector("[aria-hidden='true']");

describe("<SurveyResultsCalculationLine />", () => {
  describe("given the current line", () => {
    it("draws the current line with a spinner", () => {
      renderLine(true);

      expect(getLine()).toHaveTextContent(TEXT);
      expect(getLine()).toHaveAttribute("data-current", "true");
      expect(querySpinner()).toBeInTheDocument();
    });

    it("draws it in the accent colour", () => {
      renderLine(true);

      expect(getLine()).toHaveClass("text-cyan-500");
      expect(getLine()).not.toHaveClass("text-gi-primary");
    });

    it("hides the spinner from assistive technology", () => {
      renderLine(true);

      expect(querySpinner()).toHaveAttribute("aria-hidden", "true");
      expect(querySpinner()).toBeEmptyDOMElement();
      expect(getLine()).toHaveAccessibleName("");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("turns the spinner, and keeps it still under reduced motion", () => {
      renderLine(true);

      expect(querySpinner()).toHaveClass(
        "animate-spin",
        "motion-reduce:animate-none",
      );
    });
  });

  describe("given a finished line", () => {
    it("draws a finished line without one", () => {
      renderLine(false);

      expect(getLine()).toHaveTextContent(TEXT);
      expect(getLine()).toHaveAttribute("data-current", "false");
      expect(querySpinner()).not.toBeInTheDocument();
      expect(getLine()).toHaveClass("text-gi-primary");
    });
  });

  describe("given a text longer than the field is wide", () => {
    it("wraps it inside the pill and never cuts it", () => {
      renderLine(true);

      expect(getLine()).toHaveClass("max-w-full", "wrap-break-word");
      expect(getLine()).not.toHaveClass("truncate");
    });
  });

  describe("when it arrives", () => {
    it("fades in, and is simply there under reduced motion", () => {
      renderLine(false);

      expect(getLine()).toHaveClass(
        "starting:opacity-0",
        "transition-opacity",
        "motion-reduce:transition-none",
      );
    });
  });
});
