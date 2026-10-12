import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CompassMap } from "@/components/shared/CompassMap/CompassMap";
import type { Orientation } from "@/types/orientation";
import type { NolanPosition } from "@/types/results";
import { getNolanPosition } from "@/utils/results/getNolanPosition";

import type { NolanQuadrants } from "../NolanChart.types";
import { NolanMap } from "./NolanMap";

// The map renders as it is; the spy shows what the module passes to it.
vi.mock("@/components/shared/CompassMap/CompassMap", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("@/components/shared/CompassMap/CompassMap")
    >();

  return { CompassMap: vi.fn(original.CompassMap) };
});

const DESCRIPTION =
  "Umiarkowana zielona. Gospodarka: -0.54, Światopogląd: -0.34";

const quadrants: NolanQuadrants = {
  topLeft: { color: "#eb5760" },
  topRight: { color: "#57bfeb" },
  bottomLeft: { color: "#36db8b" },
  bottomRight: { color: "#8443e9" },
};

const friend: Orientation = { id: "friend", type: "person", name: "Rafał" };

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
      description={DESCRIPTION}
      horizontalName="Gospodarka"
      verticalName="Światopogląd"
      quadrants={quadrants}
      position={position}
      otherOrientation={friend}
      otherPosition={otherPosition}
    />,
  );

const getMapProps = () => vi.mocked(CompassMap).mock.lastCall?.[0];

const getFilled = () =>
  screen
    .getAllByTestId(/^nolan-chart-quadrant-/)
    .filter((quadrant) => quadrant.dataset.filled === "true")
    .map((quadrant) => quadrant.dataset.testid);

describe("<NolanMap />", () => {
  beforeEach(() => {
    vi.mocked(CompassMap).mockClear();
  });

  it("renders CompassMap with the quadrants, the position and the other side", () => {
    renderMap(MODERATE, OTHER);

    expect(CompassMap).toHaveBeenCalledTimes(1);
    expect(getMapProps()).toMatchObject({
      quadrants,
      position: MODERATE,
      otherOrientation: friend,
      otherPosition: OTHER,
    });
  });

  it("passes no trail and no description to it", () => {
    renderMap(MODERATE, OTHER);

    expect(getMapProps()).not.toHaveProperty("trail");
    expect(getMapProps()).not.toHaveProperty("description");
  });

  it("is still one image named by its own description, with both axis names beside the map", () => {
    renderMap(MODERATE);

    const image = screen.getByRole("img", { name: DESCRIPTION });

    expect(screen.getAllByRole("img")).toEqual([image]);
    expect(image).toContainElement(screen.getByTestId("nolan-chart-map"));
    expect(image).toContainElement(
      screen.getByTestId("nolan-chart-axis-horizontal"),
    );
    expect(image).toContainElement(
      screen.getByTestId("nolan-chart-axis-vertical"),
    );
    expect(screen.getByTestId("nolan-chart-map")).not.toHaveAttribute("role");
    expect(screen.getByTestId("nolan-chart-map")).not.toHaveAttribute(
      "aria-label",
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

      expect(getMapProps()).toMatchObject({ position: null });
      expect(getFilled()).toEqual([]);
      expect(screen.queryByTestId("nolan-chart-dot")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("nolan-chart-coordinate-horizontal"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given the other side's position", () => {
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

      expect(getMapProps()).toMatchObject({ otherPosition: null });
      expect(
        screen.queryByTestId("nolan-chart-comparison"),
      ).not.toBeInTheDocument();
    });
  });
});
