import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { StatsSliceNames } from "../../SurveyCheckpointStats.types";
import { SurveyCheckpointStatsLegend } from "./SurveyCheckpointStatsLegend";

const NAMES: StatsSliceNames = {
  for: "Za",
  against: "Przeciw",
  noAnswer: "Brak odpowiedzi",
};

const getRows = () => screen.getAllByRole("listitem");

describe("<SurveyCheckpointStatsLegend />", () => {
  it('renders three rows in the order "Za", "Przeciw", "Brak odpowiedzi"', () => {
    render(<SurveyCheckpointStatsLegend names={NAMES} />);

    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(getRows().map((row) => row.textContent)).toEqual([
      "Za",
      "Przeciw",
      "Brak odpowiedzi",
    ]);
  });

  it("keeps the row of a count of zero", () => {
    // The legend is not given the counts at all: its rows cannot depend on
    // them.
    render(<SurveyCheckpointStatsLegend names={NAMES} />);

    expect(getRows()).toHaveLength(3);
  });

  it("shows the names it is given", () => {
    render(
      <SurveyCheckpointStatsLegend
        names={{ for: "For", against: "Against", noAnswer: "No answer" }}
      />,
    );

    expect(getRows().map((row) => row.textContent)).toEqual([
      "For",
      "Against",
      "No answer",
    ]);
  });

  it("draws each dot in the colour of its slice", () => {
    render(<SurveyCheckpointStatsLegend names={NAMES} />);

    expect(
      getRows().map((row) => row.querySelector("[aria-hidden]")?.className),
    ).toEqual([
      expect.stringContaining("text-emerald-600"),
      expect.stringContaining("text-red-400"),
      expect.stringContaining("text-gi-ash"),
    ]);
  });

  it("hides the colour dots from assistive technology", () => {
    render(<SurveyCheckpointStatsLegend names={NAMES} />);

    for (const row of getRows()) {
      expect(row.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    }

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows no percentage", () => {
    render(<SurveyCheckpointStatsLegend names={NAMES} />);

    expect(screen.getByRole("list").textContent).not.toMatch(/[\d%]/);
  });
});
