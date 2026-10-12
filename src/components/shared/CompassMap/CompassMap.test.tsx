import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getNolanPosition } from "@/utils/results/getNolanPosition";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { CompassMap } from "./CompassMap";
import type { CompassMapProps, CompassMapQuadrants } from "./CompassMap.types";

const DESCRIPTION = "Kompas: trasa przeszła przez 2 z 4 ćwiartek.";

const quadrants: CompassMapQuadrants = {
  topLeft: { color: "#eb5760" },
  topRight: { color: "#57bfeb" },
  bottomLeft: { color: "#36db8b" },
  bottomRight: { color: "#8443e9" },
};

const friend = createOrientation("friend", "Rafał", {
  type: "person",
  imageUrl: "https://example.com/friend.png",
});

const CENTRE = getNolanPosition({ start: 50, end: 50 }, { start: 50, end: 50 });
const MODERATE = getNolanPosition(
  { start: 77, end: 23 },
  { start: 67, end: 33 },
);
const EXTREME = getNolanPosition(
  { start: 0, end: 100 },
  { start: 0, end: 100 },
);

const renderMap = (props: Partial<CompassMapProps> = {}) =>
  render(<CompassMap quadrants={quadrants} position={MODERATE} {...props} />);

const getMap = () => screen.getByTestId("nolan-chart-map");

const getQuadrant = (key: string) =>
  screen.getByTestId(`nolan-chart-quadrant-${key}`);

const getFilled = () =>
  screen
    .getAllByTestId(/^nolan-chart-quadrant-/)
    .filter((quadrant) => quadrant.dataset.filled === "true")
    .map((quadrant) => quadrant.dataset.testid);

const isBefore = (first: Element, second: Element): boolean =>
  Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

describe("<CompassMap />", () => {
  it("is as wide as its parent, square and rounded, without clipping what is drawn on it", () => {
    renderMap();

    expect(getMap()).toHaveClass(
      "relative",
      "aspect-square",
      "w-full",
      "rounded-xl",
    );
    expect(getMap()).not.toHaveClass("overflow-hidden");
  });

  it("draws every quadrant in a pale tint of its colour", () => {
    renderMap({ position: null });

    expect(getQuadrant("topLeft")).toHaveClass("bg-(--nolan-color)/10");
    expect(getQuadrant("topLeft").style.getPropertyValue("--nolan-color")).toBe(
      "#eb5760",
    );
    expect(
      getQuadrant("bottomRight").style.getPropertyValue("--nolan-color"),
    ).toBe("#8443e9");
  });

  describe("given a position at the moderate or the extreme level", () => {
    it.each([
      { name: "moderate", position: MODERATE, quadrant: "bottomLeft" },
      { name: "extreme", position: EXTREME, quadrant: "topRight" },
    ])("fills the quadrant of the position: $name", ({
      position,
      quadrant,
    }) => {
      renderMap({ position });

      expect(getFilled()).toEqual([`nolan-chart-quadrant-${quadrant}`]);
      expect(getQuadrant(quadrant)).toHaveClass("bg-(--nolan-color)");
    });

    it("renders the dot and its halo", () => {
      renderMap({ position: MODERATE });

      const dot = screen.getByTestId("nolan-chart-dot");
      const halo = screen.getByTestId("nolan-chart-halo");

      expect(getMap()).toContainElement(dot);
      expect(getMap()).toContainElement(halo);
      expect(dot.style.getPropertyValue("--nolan-x")).toBe("23%");
      expect(dot.style.getPropertyValue("--nolan-y")).toBe("67%");
      expect(isBefore(halo, dot)).toBe(true);
    });
  });

  describe("given a position at the centre level", () => {
    it("fills no quadrant", () => {
      renderMap({ position: CENTRE });

      expect(getFilled()).toEqual([]);
    });

    it("renders the dot", () => {
      renderMap({ position: CENTRE });

      expect(screen.getByTestId("nolan-chart-dot")).toBeInTheDocument();
      expect(screen.getByTestId("nolan-chart-halo")).toBeInTheDocument();
    });
  });

  describe("given no position", () => {
    it("renders no dot and fills no quadrant", () => {
      renderMap({ position: null });

      expect(getFilled()).toEqual([]);
      expect(screen.queryByTestId("nolan-chart-dot")).not.toBeInTheDocument();
      expect(screen.queryByTestId("nolan-chart-halo")).not.toBeInTheDocument();
    });
  });

  describe("given a position in a corner of the map", () => {
    it("places the dot exactly and leaves it unclipped", () => {
      renderMap({ position: EXTREME });

      const dot = screen.getByTestId("nolan-chart-dot");

      expect(dot.style.getPropertyValue("--nolan-x")).toBe("100%");
      expect(dot.style.getPropertyValue("--nolan-y")).toBe("0%");
      expect(dot.parentElement).toBe(getMap());
    });
  });

  describe("given a trail", () => {
    const trail = [
      { x: 0.6, y: 0.7 },
      { x: -0.2, y: 0.4 },
      { x: -0.54, y: -0.34 },
    ];

    it("renders the line after the quadrants and before the halo and the dot", () => {
      renderMap({ position: MODERATE, trail });

      const line = screen.getByTestId("compass-map-trail");

      expect(getMap()).toContainElement(line);
      expect(isBefore(getQuadrant("bottomRight"), line)).toBe(true);
      expect(isBefore(line, screen.getByTestId("nolan-chart-halo"))).toBe(true);
      expect(isBefore(line, screen.getByTestId("nolan-chart-dot"))).toBe(true);
    });

    it("ends the line where the dot is", () => {
      renderMap({ position: MODERATE, trail });

      expect(screen.getByTestId("compass-map-trail").getAttribute("d")).toMatch(
        / 23 67$/,
      );
      expect(
        screen
          .getByTestId("nolan-chart-dot")
          .style.getPropertyValue("--nolan-x"),
      ).toBe("23%");
      expect(
        screen
          .getByTestId("nolan-chart-dot")
          .style.getPropertyValue("--nolan-y"),
      ).toBe("67%");
    });

    it("draws the other side of a comparison on top of the line", () => {
      renderMap({ trail, otherOrientation: friend, otherPosition: EXTREME });

      expect(
        isBefore(
          screen.getByTestId("compass-map-trail"),
          screen.getByTestId("nolan-chart-comparison"),
        ),
      ).toBe(true);
    });

    it("draws the line without a position too", () => {
      renderMap({ position: null, trail });

      expect(screen.getByTestId("compass-map-trail")).toBeInTheDocument();
      expect(screen.queryByTestId("nolan-chart-dot")).not.toBeInTheDocument();
    });

    it("stays one image named by the description", () => {
      renderMap({ trail, description: DESCRIPTION });

      expect(screen.getAllByRole("img")).toEqual([getMap()]);
      expect(getMap()).toHaveAccessibleName(DESCRIPTION);
    });
  });

  describe("given no trail", () => {
    it.each([
      { name: "absent", trail: undefined },
      { name: "empty", trail: [] },
      { name: "a single point", trail: [{ x: 0.2, y: 0.2 }] },
    ])("renders no line: $name", ({ trail }) => {
      renderMap({ trail });

      expect(screen.queryByTestId("compass-map-trail")).not.toBeInTheDocument();
      expect(getMap().querySelector("svg")).toBeNull();
    });
  });

  describe("given the other side of a comparison", () => {
    it("renders its image on the hatched disc", () => {
      renderMap({ otherOrientation: friend, otherPosition: EXTREME });

      const disc = screen.getByTestId("nolan-chart-comparison");

      expect(disc.style.getPropertyValue("--nolan-x")).toBe("100%");
      expect(disc.style.getPropertyValue("--nolan-y")).toBe("0%");
      expect(
        screen.getByTestId("nolan-chart-comparison-image").querySelector("img"),
      ).toHaveAttribute("src", friend.imageUrl);
    });

    it("draws it on top of everything", () => {
      renderMap({ otherOrientation: friend, otherPosition: EXTREME });

      expect(
        isBefore(
          screen.getByTestId("nolan-chart-dot"),
          screen.getByTestId("nolan-chart-comparison"),
        ),
      ).toBe(true);
    });

    it("still fills only the quadrant of the position", () => {
      renderMap({
        position: MODERATE,
        otherOrientation: friend,
        otherPosition: EXTREME,
      });

      expect(getFilled()).toEqual(["nolan-chart-quadrant-bottomLeft"]);
    });

    it("fills no quadrant for it when the position is at the centre level", () => {
      renderMap({
        position: CENTRE,
        otherOrientation: friend,
        otherPosition: EXTREME,
      });

      expect(getFilled()).toEqual([]);
    });
  });

  describe("given no other side", () => {
    it("renders no second marker", () => {
      renderMap();

      expect(
        screen.queryByTestId("nolan-chart-comparison"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a description", () => {
    it("is one image named by the description", () => {
      renderMap({ description: DESCRIPTION });

      expect(screen.getAllByRole("img")).toEqual([getMap()]);
      expect(screen.getByRole("img", { name: DESCRIPTION })).toBe(getMap());
    });
  });

  describe("given no description", () => {
    it.each([
      undefined,
      "",
    ])("has no role and no name of its own: %j", (description) => {
      renderMap({ description });

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(getMap()).not.toHaveAttribute("role");
      expect(getMap()).not.toHaveAttribute("aria-label");
    });
  });

  describe("given a quadrant without a colour or with a value that is not a colour", () => {
    it.each([
      { name: "no colour", quadrant: {} },
      { name: "not a colour", quadrant: { color: "url(x)" } },
    ])("uses the neutral fallback for that quadrant: $name", ({ quadrant }) => {
      const { unmount } = renderMap({
        quadrants: { ...quadrants, topLeft: quadrant },
        position: null,
      });

      expect(getQuadrant("topLeft")).toHaveClass("bg-gi-dark-gray/10");
      expect(
        getQuadrant("topLeft").style.getPropertyValue("--nolan-color"),
      ).toBe("");
      expect(getQuadrant("topRight")).toHaveClass("bg-(--nolan-color)/10");

      unmount();
      renderMap({
        quadrants: { ...quadrants, bottomLeft: quadrant },
        position: MODERATE,
      });

      expect(getQuadrant("bottomLeft")).toHaveClass("bg-gi-dark-gray");
    });

    it("uses it for every quadrant without quadrants", () => {
      renderMap({ quadrants: undefined, position: MODERATE });

      expect(getQuadrant("bottomLeft")).toHaveClass("bg-gi-dark-gray");
      expect(getQuadrant("topRight")).toHaveClass("bg-gi-dark-gray/10");
    });
  });

  it("exposes no focusable element", () => {
    renderMap({
      description: DESCRIPTION,
      otherOrientation: friend,
      otherPosition: EXTREME,
    });

    expect(
      getMap().querySelectorAll(
        "a, button, input, select, textarea, [tabindex], [contenteditable]",
      ),
    ).toHaveLength(0);
    expect(getMap()).not.toHaveAttribute("tabindex");
  });
});
