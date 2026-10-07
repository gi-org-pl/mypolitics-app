import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { NolanPosition } from "../../NolanChart.types";
import { TakerDot } from "./TakerDot";

const at = (x: number, y: number) => ({ x, y }) as NolanPosition;

const getPoint = (testId: string) => {
  const element = screen.getByTestId(testId);

  return [
    element.style.getPropertyValue("--nolan-x"),
    element.style.getPropertyValue("--nolan-y"),
  ];
};

describe("<TakerDot />", () => {
  it("renders the dot and its halo at the position", () => {
    render(<TakerDot position={at(-0.54, -0.34)} />);

    expect(getPoint("nolan-chart-dot")).toEqual(["23%", "67%"]);
    expect(getPoint("nolan-chart-halo")).toEqual(["23%", "67%"]);
    expect(screen.getByTestId("nolan-chart-dot")).toHaveClass(
      "left-(--nolan-x)",
      "top-(--nolan-y)",
      "-translate-1/2",
      "size-6",
    );
  });

  describe.each([
    ["top left", -1, 1, "0%", "0%"],
    ["top right", 1, 1, "100%", "0%"],
    ["bottom left", -1, -1, "0%", "100%"],
    ["bottom right", 1, -1, "100%", "100%"],
    ["right edge", 1, 0, "100%", "50%"],
  ])("given the %s", (_name, x, y, left, top) => {
    it("places the dot exactly, without clamping", () => {
      render(<TakerDot position={at(x, y)} />);

      expect(getPoint("nolan-chart-dot")).toEqual([left, top]);
    });
  });

  it("leaves the dot unclipped and keeps the halo clipped to the map", () => {
    const { container } = render(<TakerDot position={at(1, -1)} />);

    expect(screen.getByTestId("nolan-chart-dot").parentElement).toBe(container);
    expect(screen.getByTestId("nolan-chart-halo").parentElement).toHaveClass(
      "absolute",
      "inset-0",
      "overflow-hidden",
      "rounded-xl",
    );
  });

  it("draws the dot above the halo", () => {
    render(<TakerDot position={at(0, 0)} />);

    expect(
      screen
        .getByTestId("nolan-chart-halo")
        .compareDocumentPosition(screen.getByTestId("nolan-chart-dot")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
