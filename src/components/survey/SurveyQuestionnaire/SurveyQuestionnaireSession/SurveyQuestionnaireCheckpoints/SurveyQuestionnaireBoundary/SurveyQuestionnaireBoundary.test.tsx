import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SurveyQuestionnaireBoundary } from "./SurveyQuestionnaireBoundary";

const Card = ({ isBroken = false }: { isBroken?: boolean }) => {
  if (isBroken) {
    throw new Error("The chart cannot be drawn");
  }

  return <p>Jesteś na półmetku</p>;
};

describe("<SurveyQuestionnaireBoundary />", () => {
  beforeEach(() => {
    // React reports the caught error to the console; the test keeps it quiet.
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("given a card that draws", () => {
    it("shows the card and reports nothing", () => {
      const onError = vi.fn();

      render(
        <SurveyQuestionnaireBoundary onError={onError}>
          <Card />
        </SurveyQuestionnaireBoundary>,
      );

      expect(screen.getByText("Jesteś na półmetku")).toBeVisible();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe("given a card that throws while rendering", () => {
    it("shows nothing of the card or of the failure", () => {
      const { container } = render(
        <SurveyQuestionnaireBoundary onError={vi.fn()}>
          <p>Wykres</p>
          <Card isBroken />
        </SurveyQuestionnaireBoundary>,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("reports the failure once", () => {
      const onError = vi.fn();
      const { rerender } = render(
        <SurveyQuestionnaireBoundary onError={onError}>
          <Card isBroken />
        </SurveyQuestionnaireBoundary>,
      );

      rerender(
        <SurveyQuestionnaireBoundary onError={onError}>
          <Card isBroken />
        </SurveyQuestionnaireBoundary>,
      );

      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("does not try the card again", () => {
      const { container, rerender } = render(
        <SurveyQuestionnaireBoundary onError={vi.fn()}>
          <Card isBroken />
        </SurveyQuestionnaireBoundary>,
      );

      rerender(
        <SurveyQuestionnaireBoundary onError={vi.fn()}>
          <Card />
        </SurveyQuestionnaireBoundary>,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
