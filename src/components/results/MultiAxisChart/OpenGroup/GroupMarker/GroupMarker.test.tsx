import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AXIS_LINE_BACKGROUND_CLASS_NAME } from "@/constants/axis";

import { GroupMarker } from "./GroupMarker";

const getPosition = () =>
  screen
    .getByTestId("multi-axis-chart-marker")
    .style.getPropertyValue("--axis-position");

describe("<GroupMarker />", () => {
  describe("given no marker", () => {
    it("renders the line in the middle", () => {
      render(<GroupMarker />);

      expect(getPosition()).toBe("50%");
    });
  });

  describe("given a marker position", () => {
    it("renders the line at that position", () => {
      render(<GroupMarker marker={40} />);

      expect(getPosition()).toBe("40%");
    });

    it("clamps the position as the bar does", () => {
      const { unmount } = render(<GroupMarker marker={140} />);

      expect(getPosition()).toBe("100%");

      unmount();
      render(<GroupMarker marker={Number.NaN} />);

      expect(getPosition()).toBe("50%");
    });
  });

  describe("given marker is false", () => {
    it("renders nothing", () => {
      const { container } = render(<GroupMarker marker={false} />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("placement", () => {
    it("sits where each bar would draw its own marker", () => {
      render(<GroupMarker />);

      const line = screen.getByTestId("multi-axis-chart-marker");

      expect(line).toHaveClass(
        "left-[clamp(0px,calc(var(--axis-position)-0.5px),calc(100%-1px))]",
        "w-px",
        "inset-y-0",
      );
      expect(line.parentElement).toHaveClass("absolute", "inset-x-5");
    });

    it("has the opaque colour of the track border, so that the fills it crosses do not change it", () => {
      render(<GroupMarker />);

      const line = screen.getByTestId("multi-axis-chart-marker");

      expect(line).toHaveClass(AXIS_LINE_BACKGROUND_CLASS_NAME);
      expect(line).not.toHaveClass("bg-gi-primary/30");
    });

    it("runs from the headline bar above its container to the last bar, whatever the heading height", () => {
      render(<GroupMarker />);

      expect(
        screen.getByTestId("multi-axis-chart-marker").parentElement,
      ).toHaveClass("-top-15", "bottom-4");
    });

    it("is decorative and lets presses through", () => {
      render(<GroupMarker />);

      const lane = screen.getByTestId("multi-axis-chart-marker").parentElement;

      expect(lane).toHaveAttribute("aria-hidden", "true");
      expect(lane).toHaveClass("pointer-events-none");
    });
  });
});
