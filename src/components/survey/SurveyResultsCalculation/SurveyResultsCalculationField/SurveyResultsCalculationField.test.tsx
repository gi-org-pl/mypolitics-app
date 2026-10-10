import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SurveyResultsCalculationField } from "./SurveyResultsCalculationField";

const renderField = (isMoving: boolean) =>
  render(
    <SurveyResultsCalculationField isMoving={isMoving}>
      <p>Prostujemy osie</p>
    </SurveyResultsCalculationField>,
  );

const getRings = (container: HTMLElement) =>
  container.querySelector("[data-moving]") as HTMLElement;

describe("<SurveyResultsCalculationField />", () => {
  describe("given something to stand on it", () => {
    it("shows it", () => {
      renderField(true);

      expect(screen.getByText("Prostujemy osie")).toBeVisible();
    });

    it("keeps it in a box that moves its height, so a stack that outgrows the field does not make what is under it jump", () => {
      renderField(true);

      const box = screen.getByText("Prostujemy osie").parentElement
        ?.parentElement as HTMLElement;

      expect(box).toHaveClass("data-[animating=true]:overflow-y-clip");
      expect(box.parentElement).toHaveClass("min-h-106.25");
    });

    it("hides the rings from assistive technology", () => {
      const { container } = renderField(true);

      expect(getRings(container)).toHaveAttribute("aria-hidden", "true");
      expect(getRings(container)).toBeEmptyDOMElement();
    });
  });

  describe("given a run under way", () => {
    it("moves the rings, and keeps them still under reduced motion", () => {
      const { container } = renderField(true);

      expect(getRings(container)).toHaveAttribute("data-moving", "true");
      expect(getRings(container)).toHaveClass(
        "animate-[survey-rings-drift_3s_linear_infinite]",
        "motion-reduce:animate-none",
      );
    });

    it("defines the drift it names", () => {
      const { container } = renderField(true);

      expect(container.querySelector("style")).toHaveTextContent(
        "@keyframes survey-rings-drift",
      );
    });
  });

  describe("given no run under way", () => {
    it("keeps the rings still", () => {
      const { container } = renderField(false);

      expect(getRings(container)).toHaveAttribute("data-moving", "false");
      expect(getRings(container)).not.toHaveClass(
        "animate-[survey-rings-drift_3s_linear_infinite]",
      );
    });
  });
});
