import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { NolanPosition, NolanQuadrants } from "../NolanChart.types";
import { getNolanPosition } from "../utils/getNolanPosition";
import { NolanMap } from "./NolanMap";

const quadrants: NolanQuadrants = {
  topLeft: { color: "#eb5760" },
  topRight: { color: "#57bfeb" },
  bottomLeft: { color: "#36db8b" },
  bottomRight: { color: "#8443e9" },
};

const CENTRE = getNolanPosition({ start: 50, end: 50 }, { start: 50, end: 50 });
const MODERATE = getNolanPosition(
  { start: 77, end: 23 },
  { start: 67, end: 33 },
);
const OTHER = getNolanPosition({ start: 0, end: 100 }, { start: 0, end: 100 });

const renderMap = (
  position: NolanPosition | null,
  otherPosition: NolanPosition | null = null,
) =>
  render(
    <NolanMap
      description="Umiarkowana zielona. Gospodarka: -0.54, Światopogląd: -0.34"
      horizontalName="Gospodarka"
      verticalName="Światopogląd"
      quadrants={quadrants}
      position={position}
      otherParty={{ id: "friend", name: "Rafał" }}
      otherPosition={otherPosition}
    />,
  );

const getFilled = () =>
  screen
    .getAllByTestId(/^nolan-chart-quadrant-/)
    .filter((quadrant) => quadrant.dataset.filled === "true")
    .map((quadrant) => quadrant.dataset.testid);

describe("<NolanMap />", () => {
  it("is one described image holding the map and both axis pills", () => {
    renderMap(MODERATE);

    const image = screen.getByRole("img", {
      name: "Umiarkowana zielona. Gospodarka: -0.54, Światopogląd: -0.34",
    });

    expect(image).toContainElement(screen.getByTestId("nolan-chart-map"));
    expect(image).toContainElement(
      screen.getByTestId("nolan-chart-axis-horizontal"),
    );
    expect(image).toContainElement(
      screen.getByTestId("nolan-chart-axis-vertical"),
    );
  });

  it("keeps the map square and rounded, without clipping what is drawn on it", () => {
    renderMap(MODERATE);

    const map = screen.getByTestId("nolan-chart-map");

    expect(map).toHaveClass("aspect-square", "rounded-xl", "relative");
    expect(map).not.toHaveClass("overflow-hidden");
  });

  describe("given a moderate or extreme position", () => {
    it("fills the taker quadrant and names each axis with its coordinate", () => {
      renderMap(MODERATE);

      expect(getFilled()).toEqual(["nolan-chart-quadrant-bottomLeft"]);
      expect(screen.getByTestId("nolan-chart-dot")).toBeInTheDocument();
      expect(
        screen.getByTestId("nolan-chart-coordinate-horizontal"),
      ).toHaveTextContent("-0.54");
      expect(
        screen.getByTestId("nolan-chart-coordinate-vertical"),
      ).toHaveTextContent("-0.34");
    });
  });

  describe("given a centre position", () => {
    it("draws the dot and fills no quadrant", () => {
      renderMap(CENTRE);

      expect(getFilled()).toEqual([]);
      expect(screen.getByTestId("nolan-chart-dot")).toBeInTheDocument();
    });
  });

  describe("given no position", () => {
    it("draws no dot, no filled quadrant and no coordinates", () => {
      renderMap(null);

      expect(getFilled()).toEqual([]);
      expect(screen.queryByTestId("nolan-chart-dot")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("nolan-chart-coordinate-horizontal"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given the other party's position", () => {
    it("draws their marker after the taker's, and never fills their quadrant", () => {
      renderMap(CENTRE, OTHER);

      expect(
        screen
          .getByTestId("nolan-chart-dot")
          .compareDocumentPosition(
            screen.getByTestId("nolan-chart-comparison"),
          ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(getFilled()).toEqual([]);
    });

    it("draws no second marker without it", () => {
      renderMap(MODERATE);

      expect(
        screen.queryByTestId("nolan-chart-comparison"),
      ).not.toBeInTheDocument();
    });
  });
});
