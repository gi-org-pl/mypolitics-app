import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

const Card = ({ isBroken = false }: { isBroken?: boolean }) => {
  if (isBroken) {
    throw new Error("The chart cannot be drawn");
  }

  return <p>Jesteś na półmetku</p>;
};

describe("<ErrorBoundary />", () => {
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
        <ErrorBoundary onError={onError}>
          <Card />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Jesteś na półmetku")).toBeVisible();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe("given a card that throws while rendering", () => {
    it("shows nothing of the card or of the failure", () => {
      const { container } = render(
        <ErrorBoundary onError={vi.fn()}>
          <p>Wykres</p>
          <Card isBroken />
        </ErrorBoundary>,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("reports the failure once", () => {
      const onError = vi.fn();
      const { rerender } = render(
        <ErrorBoundary onError={onError}>
          <Card isBroken />
        </ErrorBoundary>,
      );

      rerender(
        <ErrorBoundary onError={onError}>
          <Card isBroken />
        </ErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("does not try the card again", () => {
      const { container, rerender } = render(
        <ErrorBoundary onError={vi.fn()}>
          <Card isBroken />
        </ErrorBoundary>,
      );

      rerender(
        <ErrorBoundary onError={vi.fn()}>
          <Card />
        </ErrorBoundary>,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given nobody asks to be told of the failure", () => {
    it("shows nothing of what failed and keeps what stands beside it", () => {
      render(
        <div>
          <p>Obok</p>
          <ErrorBoundary>
            <Card isBroken />
          </ErrorBoundary>
        </div>,
      );

      expect(screen.getByText("Obok")).toBeVisible();
      expect(screen.queryByText("Jesteś na półmetku")).not.toBeInTheDocument();
    });
  });
});
