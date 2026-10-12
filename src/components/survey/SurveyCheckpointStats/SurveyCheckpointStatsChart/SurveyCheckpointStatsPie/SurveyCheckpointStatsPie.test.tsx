import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { StatsSlice } from "../../SurveyCheckpointStats.types";
import { SurveyCheckpointStatsPie } from "./SurveyCheckpointStatsPie";

const DESCRIPTION = "Za: 10%, Przeciw: 60%, Brak odpowiedzi: 30%";
const FULL_CIRCLE = "M 48 0 A 48 48 0 1 1 48 96 A 48 48 0 1 1 48 0 Z";

const SLICES: StatsSlice[] = [
  { id: "for", from: 0, to: 0.1 },
  { id: "against", from: 0.1, to: 0.7 },
  { id: "noAnswer", from: 0.7, to: 1 },
];

const renderPie = (slices = SLICES) =>
  render(
    <SurveyCheckpointStatsPie slices={slices} description={DESCRIPTION} />,
  );

const getPie = () => screen.getByRole("img", { name: DESCRIPTION });

const getShapes = () => [...getPie().querySelectorAll("path")];

describe("<SurveyCheckpointStatsPie />", () => {
  it("is exposed as a single image with the description it is given", () => {
    renderPie();

    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(getPie()).toHaveAccessibleName(DESCRIPTION);
    expect(getPie().tagName).toBe("svg");
  });

  it("draws one shape per slice, in the order for, against, no answer", () => {
    renderPie();

    expect(getShapes().map((shape) => shape.getAttribute("class"))).toEqual([
      expect.stringContaining("text-emerald-600"),
      expect.stringContaining("text-red-400"),
      expect.stringContaining("text-gi-ash"),
    ]);
    expect(getShapes().map((shape) => shape.getAttribute("d"))).toEqual([
      "M 48 48 L 48 0 A 48 48 0 0 1 76.21 9.17 Z",
      "M 48 48 L 76.21 9.17 A 48 48 0 1 1 2.35 62.83 Z",
      "M 48 48 L 2.35 62.83 A 48 48 0 0 1 48 0 Z",
    ]);
  });

  it("fills every shape with the colour of its slice", () => {
    renderPie();

    for (const shape of getShapes()) {
      expect(shape).toHaveClass("fill-current");
    }
  });

  it("draws no shape for a count of zero", () => {
    // A count of zero gives no slice: the two that are left are drawn.
    renderPie([
      { id: "against", from: 0, to: 0.7 },
      { id: "noAnswer", from: 0.7, to: 1 },
    ]);

    expect(getShapes()).toHaveLength(2);
    expect(getPie().querySelector(".text-emerald-600")).toBeNull();
  });

  it("draws a full circle when one count holds everything", () => {
    renderPie([{ id: "against", from: 0, to: 1 }]);

    expect(getShapes()).toHaveLength(1);
    expect(getShapes()[0]).toHaveAttribute("d", FULL_CIRCLE);
    expect(getShapes()[0]).toHaveClass("text-red-400");
  });

  it("keeps the whole circle inside its own box", () => {
    renderPie();

    // The circle touches the edges of the box and never goes past them, so
    // a slice at either end of the scale is not cut.
    expect(getPie()).toHaveAttribute("viewBox", "0 0 96 96");
    expect(getPie()).not.toHaveClass("overflow-hidden");
  });

  it("marks no slice as the taker's", () => {
    renderPie();

    const [first, ...others] = getShapes().map((shape) =>
      [...shape.attributes]
        .map(({ name }) => name)
        .sort()
        .join(),
    );

    // Every shape has the same attributes: a path and a colour, nothing more.
    expect(first).toBe("class,d");
    expect(others).toEqual([first, first]);
    expect(getPie().querySelectorAll("*")).toHaveLength(3);
  });

  it("writes no number", () => {
    renderPie();

    expect(getPie().textContent).toBe("");
    expect(getPie().querySelector("text, title, desc")).toBeNull();
  });

  it("is not interactive and not focusable", () => {
    renderPie();

    expect(getPie()).not.toHaveAttribute("tabindex");
    expect(getPie().querySelector("a, button, [tabindex]")).toBeNull();
  });
});
