import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createAxisPair } from "@/utils/vitest/createAxisPair";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyCheckpointAxisClosenessVisual } from "./SurveyCheckpointAxisClosenessVisual";

const { start, end } = createAxisPair(
  "union",
  "Eurosceptycyzm",
  "Federacjonizm",
  69,
  31,
);
const DESCRIPTION =
  "„Eurosceptycyzm” i „Federacjonizm”: wyższy wynik po stronie „Eurosceptycyzm”";

const getBar = () => screen.getByRole("img");

describe("<SurveyCheckpointAxisClosenessVisual />", () => {
  it("renders the title as plain text, not as a chip", () => {
    renderWithI18n(
      <SurveyCheckpointAxisClosenessVisual
        title="Radykalizm"
        start={start}
        description="Skala „Radykalizm”: wysoki wynik"
      />,
    );

    const title = screen.getByText("Radykalizm");

    expect(title).toBeVisible();
    expect(title.children).toHaveLength(0);
    expect(title).toHaveClass("text-gi-primary", "font-bold", "text-left");
    expect(title).not.toHaveAttribute("style");
    expect(title.className).not.toMatch(/rounded|bg-|border/);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("puts the title before the bar", () => {
    renderWithI18n(
      <SurveyCheckpointAxisClosenessVisual
        title="Radykalizm"
        start={start}
        description="Skala „Radykalizm”: wysoki wynik"
      />,
    );

    expect(
      screen.getByText("Radykalizm").compareDocumentPosition(getBar()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("lets a long title wrap and never cuts it", () => {
    const title = "Chrześcijańsko-demokratyczny konserwatyzm ".repeat(4).trim();

    renderWithI18n(
      <SurveyCheckpointAxisClosenessVisual
        title={title}
        start={start}
        description="Opis"
      />,
    );

    expect(screen.getByText(title)).toHaveClass("wrap-break-word");
    expect(screen.getByText(title).className).not.toMatch(
      /truncate|line-clamp|whitespace-nowrap|overflow-hidden/,
    );
  });

  it("passes the entries, showValues false and the description to the bar", () => {
    renderWithI18n(
      <SurveyCheckpointAxisClosenessVisual
        title="Eurosceptycyzm"
        start={start}
        end={end}
        description={DESCRIPTION}
      />,
    );

    expect(getBar()).toHaveAccessibleName(DESCRIPTION);
    expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
      width: "69%",
    });
    expect(screen.getByTestId("universal-axis-fill-end")).toHaveStyle({
      width: "31%",
    });
    expect(screen.getByTestId("universal-axis-cap-start")).toBeInTheDocument();
    expect(screen.getByTestId("universal-axis-cap-end")).toBeInTheDocument();
    expect(screen.queryByText(/[\d%]/)).not.toBeInTheDocument();
  });

  it("keeps the marker of the bar at the middle", () => {
    renderWithI18n(
      <SurveyCheckpointAxisClosenessVisual
        title="Eurosceptycyzm"
        start={start}
        end={end}
        description={DESCRIPTION}
      />,
    );

    expect(
      screen
        .getByTestId("universal-axis-marker")
        .style.getPropertyValue("--axis-position"),
    ).toBe("50%");
  });

  it("turns the labels on only when there is an end entry", () => {
    const { unmount } = renderWithI18n(
      <SurveyCheckpointAxisClosenessVisual
        title="Eurosceptycyzm"
        start={start}
        end={end}
        description={DESCRIPTION}
      />,
    );
    const labels = screen.getByTestId("universal-axis-labels");

    expect(labels).toHaveTextContent("Eurosceptycyzm");
    expect(labels).toHaveTextContent("Federacjonizm");

    unmount();
    renderWithI18n(
      <SurveyCheckpointAxisClosenessVisual
        title="Eurosceptycyzm"
        start={start}
        description={DESCRIPTION}
      />,
    );

    expect(
      screen.queryByTestId("universal-axis-labels"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("universal-axis-cap-end"),
    ).not.toBeInTheDocument();
  });

  it("fills the width it is given", () => {
    const { container } = renderWithI18n(
      <SurveyCheckpointAxisClosenessVisual
        title="Radykalizm"
        start={start}
        description="Opis"
      />,
    );

    expect(container.firstElementChild).toHaveClass("w-full", "min-w-0");
    expect(getBar()).toHaveClass("w-full");
  });
});
