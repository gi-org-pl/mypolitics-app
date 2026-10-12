import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { StatsCheckpointCard } from "@/types/checkpoint";

import type { StatsSliceNames } from "../SurveyCheckpointStats.types";
import { SurveyCheckpointStatsChart } from "./SurveyCheckpointStatsChart";

const DESCRIPTION = "Za: 10%, Przeciw: 60%, Brak odpowiedzi: 30%";
const NAMES: StatsSliceNames = {
  for: "Za",
  against: "Przeciw",
  noAnswer: "Brak odpowiedzi",
};

type Counts = StatsCheckpointCard["counts"];

const renderChart = (
  counts: Counts = { for: 100, against: 600, noAnswer: 300 },
) =>
  render(
    <SurveyCheckpointStatsChart
      counts={counts}
      description={DESCRIPTION}
      names={NAMES}
    />,
  );

const getPie = () => screen.getByRole("img", { name: DESCRIPTION });

const getLegend = () => screen.getByRole("list");

const isBefore = (first: Element, second: Element): boolean =>
  Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

describe("<SurveyCheckpointStatsChart />", () => {
  it("renders the pie, then the legend", () => {
    renderChart();

    expect(getPie()).toBeVisible();
    expect(getLegend()).toBeVisible();
    expect(isBefore(getPie(), getLegend())).toBe(true);
  });

  it("sizes the slices of the pie by the counts", () => {
    renderChart();

    expect(
      [...getPie().querySelectorAll("path")].map((shape) =>
        shape.getAttribute("d"),
      ),
    ).toEqual([
      "M 48 48 L 48 0 A 48 48 0 0 1 76.21 9.17 Z",
      "M 48 48 L 76.21 9.17 A 48 48 0 1 1 2.35 62.83 Z",
      "M 48 48 L 2.35 62.83 A 48 48 0 0 1 48 0 Z",
    ]);
  });

  it("hands the legend the names it is given", () => {
    renderChart();

    expect(
      screen.getAllByRole("listitem").map((row) => row.textContent),
    ).toEqual(["Za", "Przeciw", "Brak odpowiedzi"]);
  });

  it("draws no slice for a count of zero and keeps its legend row", () => {
    renderChart({ for: 0, against: 700, noAnswer: 300 });

    expect(getPie().querySelectorAll("path")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("lets the legend move under the pie where the two do not fit side by side", () => {
    const { container } = renderChart();

    expect(container.firstElementChild).toHaveClass("flex", "flex-wrap");
    expect(container.firstElementChild).not.toHaveClass("overflow-hidden");
  });

  it("fills the width of its parent and keeps the pie and the legend centred", () => {
    const { container } = renderChart();

    expect(container.firstElementChild).toHaveClass(
      "w-full",
      "min-w-0",
      "justify-center",
    );
  });

  it.each([
    ["three counts of zero", { for: 0, against: 0, noAnswer: 0 }],
    ["a negative count", { for: -1, against: 600, noAnswer: 300 }],
    [
      "a count that is not a number",
      { for: 100, against: Number.NaN, noAnswer: 300 },
    ],
  ])("renders nothing when there is no slice to draw: %s", (_, counts) => {
    const { container } = renderChart(counts);

    expect(container).toBeEmptyDOMElement();
  });
});
