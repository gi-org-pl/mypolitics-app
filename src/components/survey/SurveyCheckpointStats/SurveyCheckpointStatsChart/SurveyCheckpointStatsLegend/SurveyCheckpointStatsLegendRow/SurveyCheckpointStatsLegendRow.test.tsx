import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SurveyCheckpointStatsLegendRow } from "./SurveyCheckpointStatsLegendRow";

const getRow = () => screen.getByRole("listitem");

const getDot = () => getRow().querySelector('[aria-hidden="true"]');

describe("<SurveyCheckpointStatsLegendRow />", () => {
  it("renders one row with the name it is given", () => {
    render(<SurveyCheckpointStatsLegendRow id="for" name="Za" />);

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(getRow()).toHaveTextContent(/^Za$/);
    expect(screen.getByText("Za")).toBeVisible();
  });

  it.each([
    ["for", "text-emerald-600"],
    ["against", "text-red-400"],
    ["noAnswer", "text-gi-ash"],
  ] as const)("draws the dot of %s in the colour of its slice", (id, colour) => {
    render(<SurveyCheckpointStatsLegendRow id={id} name="Nazwa" />);

    expect(getDot()).toHaveClass("bg-current", colour);
  });

  it("hides the colour dot from assistive technology", () => {
    render(<SurveyCheckpointStatsLegendRow id="against" name="Przeciw" />);

    expect(getDot()).toBeEmptyDOMElement();
    expect(getDot()).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("lets a long name wrap and never cuts it", () => {
    const name = "Brak jakiejkolwiek odpowiedzi na to pytanie";

    render(<SurveyCheckpointStatsLegendRow id="noAnswer" name={name} />);

    const text = screen.getByText(name);

    expect(text).toHaveClass("wrap-break-word");
    expect(text).not.toHaveClass("truncate");
    expect(text.className).not.toMatch(/line-clamp|whitespace-nowrap/);
  });
});
