import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CompassMapQuadrants } from "../CompassMap.types";
import { QuadrantGrid } from "./QuadrantGrid";

const quadrants: CompassMapQuadrants = {
  topLeft: { color: "#eb5760" },
  topRight: { color: "#57bfeb" },
  bottomLeft: { color: "#36db8b" },
  bottomRight: { color: "#8443e9" },
};

const getQuadrant = (key: string) =>
  screen.getByTestId(`nolan-chart-quadrant-${key}`);
const getFilled = () =>
  screen
    .getAllByTestId(/^nolan-chart-quadrant-/)
    .filter((quadrant) => quadrant.dataset.filled === "true")
    .map((quadrant) => quadrant.dataset.testid);

describe("<QuadrantGrid />", () => {
  it("renders the four quadrants in reading order, each in a pale tint of its colour", () => {
    render(<QuadrantGrid quadrants={quadrants} />);

    expect(
      screen
        .getAllByTestId(/^nolan-chart-quadrant-/)
        .map((quadrant) => quadrant.dataset.testid),
    ).toEqual([
      "nolan-chart-quadrant-topLeft",
      "nolan-chart-quadrant-topRight",
      "nolan-chart-quadrant-bottomLeft",
      "nolan-chart-quadrant-bottomRight",
    ]);
    expect(getQuadrant("topRight")).toHaveClass("bg-(--nolan-color)/10");
    expect(
      getQuadrant("topRight").style.getPropertyValue("--nolan-color"),
    ).toBe("#57bfeb");
    expect(getFilled()).toEqual([]);
  });

  describe("given a filled quadrant", () => {
    it("fills that one with its colour at full strength", () => {
      render(
        <QuadrantGrid quadrants={quadrants} filledQuadrant="bottomLeft" />,
      );

      expect(getFilled()).toEqual(["nolan-chart-quadrant-bottomLeft"]);
      expect(getQuadrant("bottomLeft")).toHaveClass("bg-(--nolan-color)");
      expect(getQuadrant("topLeft")).toHaveClass("bg-(--nolan-color)/10");
    });
  });

  describe("given a quadrant without a safe colour", () => {
    it("uses the neutral tint and fill", () => {
      render(
        <QuadrantGrid
          quadrants={{ ...quadrants, topLeft: { color: "url(x)" } }}
          filledQuadrant="bottomRight"
        />,
      );

      expect(getQuadrant("topLeft")).toHaveClass("bg-gi-dark-gray/10");
      expect(
        getQuadrant("topLeft").style.getPropertyValue("--nolan-color"),
      ).toBe("");
    });

    it("does not throw without quadrants", () => {
      render(<QuadrantGrid filledQuadrant="topLeft" />);

      expect(getQuadrant("topLeft")).toHaveClass("bg-gi-dark-gray");
      expect(getQuadrant("topRight")).toHaveClass("bg-gi-dark-gray/10");
    });
  });

  it("clips the fills to the map's rounded corners", () => {
    render(<QuadrantGrid quadrants={quadrants} />);

    expect(getQuadrant("topLeft").parentElement?.parentElement).toHaveClass(
      "absolute",
      "inset-0",
      "overflow-hidden",
      "rounded-xl",
    );
  });
});
