import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AxisEntry } from "@/types/axis";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyCheckpointPositionPuzzleVisual } from "./SurveyCheckpointPositionPuzzleVisual";

const NAME = "Zielony postępowiec";
const HIDDEN = "Ukryta postać jest blisko Ciebie";
const COLOR = "oklch(0.4189 0.076 219.48)";
const PLACEHOLDER = "survey-checkpoint-position-puzzle-placeholder";

const HIDDEN_ENTRY: AxisEntry = {
  orientation: { id: "", type: "other", color: COLOR },
  value: 79,
};

const LEADER_ENTRY: AxisEntry = {
  orientation: createOrientation("green", NAME, {
    color: "#27ae60",
    imageUrl: "https://example.com/green.png",
  }),
  value: 79,
};

const getBar = () => screen.getByRole("img", { name: /blisko Ciebie/ });

describe("<SurveyCheckpointPositionPuzzleVisual />", () => {
  describe("given no name", () => {
    it("renders the placeholder, hidden from assistive technology", () => {
      renderWithI18n(
        <SurveyCheckpointPositionPuzzleVisual
          entry={HIDDEN_ENTRY}
          description={HIDDEN}
        />,
      );

      const placeholder = screen.getByTestId(PLACEHOLDER);

      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveAttribute("aria-hidden", "true");
      expect(placeholder).toBeEmptyDOMElement();
      expect(placeholder).toHaveClass("h-4", "max-w-full", "bg-gi-ash");
      expect(placeholder).not.toHaveAttribute("style");
    });

    it("renders it for a name of only space too", () => {
      renderWithI18n(
        <SurveyCheckpointPositionPuzzleVisual
          name={" \n "}
          entry={HIDDEN_ENTRY}
          description={HIDDEN}
        />,
      );

      expect(screen.getByTestId(PLACEHOLDER)).toBeInTheDocument();
    });

    it("puts the placeholder before the bar", () => {
      renderWithI18n(
        <SurveyCheckpointPositionPuzzleVisual
          entry={HIDDEN_ENTRY}
          description={HIDDEN}
        />,
      );

      expect(
        screen.getByTestId(PLACEHOLDER).compareDocumentPosition(getBar()) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe("given a name", () => {
    it("renders the name as text and no placeholder", () => {
      renderWithI18n(
        <SurveyCheckpointPositionPuzzleVisual
          name={NAME}
          entry={LEADER_ENTRY}
          description={`${NAME} jest blisko Ciebie`}
        />,
      );

      const name = screen.getByText(NAME);

      expect(name).toBeVisible();
      expect(name.children).toHaveLength(0);
      expect(name).not.toHaveAttribute("aria-hidden");
      expect(name).toHaveClass("text-gi-primary", "font-bold", "text-left");
      expect(screen.queryByTestId(PLACEHOLDER)).not.toBeInTheDocument();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    });

    it("puts the name before the bar", () => {
      renderWithI18n(
        <SurveyCheckpointPositionPuzzleVisual
          name={NAME}
          entry={LEADER_ENTRY}
          description={`${NAME} jest blisko Ciebie`}
        />,
      );

      expect(
        screen.getByText(NAME).compareDocumentPosition(getBar()) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("does not truncate a long name", () => {
      const name = "Chrześcijańsko-demokratyczny konserwatysta "
        .repeat(4)
        .trim();

      renderWithI18n(
        <SurveyCheckpointPositionPuzzleVisual
          name={name}
          entry={LEADER_ENTRY}
          description="Opis"
        />,
      );

      expect(screen.getByText(name)).toHaveClass("wrap-break-word", "w-full");
      expect(screen.getByText(name).className).not.toMatch(
        /truncate|line-clamp|whitespace-nowrap|overflow-hidden/,
      );
    });

    it("puts a name with line breaks on one line", () => {
      renderWithI18n(
        <SurveyCheckpointPositionPuzzleVisual
          name={"Zielony \n  postępowiec"}
          entry={LEADER_ENTRY}
          description="Opis"
        />,
      );

      expect(screen.getByText(NAME)).toBeVisible();
    });

    it("lets the name come in with a transition that reduced motion removes", () => {
      renderWithI18n(
        <SurveyCheckpointPositionPuzzleVisual
          name={NAME}
          entry={LEADER_ENTRY}
          description="Opis"
        />,
      );

      expect(screen.getByText(NAME)).toHaveClass(
        "transition-opacity",
        "motion-reduce:transition-none",
      );
    });
  });

  it("renders one one-sided bar with no marker and no number", () => {
    const { container } = renderWithI18n(
      <SurveyCheckpointPositionPuzzleVisual
        entry={HIDDEN_ENTRY}
        description={HIDDEN}
      />,
    );

    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
      width: "79%",
    });
    expect(screen.getByTestId("universal-axis-cap-start")).toBeInTheDocument();
    expect(screen.queryByTestId("universal-axis-fill-end")).toBeNull();
    expect(screen.queryByTestId("universal-axis-cap-end")).toBeNull();
    expect(screen.queryByTestId("universal-axis-marker")).toBeNull();
    expect(screen.queryByTestId(/universal-axis-value/)).toBeNull();
    expect(screen.queryByTestId("universal-axis-labels")).toBeNull();
    expect(screen.queryByTestId("universal-axis-mask")).toBeNull();
    expect(container.textContent).not.toMatch(/[\d%]/);
  });

  it("draws the bar from the entry it is given: its colour and its image", () => {
    const { unmount } = renderWithI18n(
      <SurveyCheckpointPositionPuzzleVisual
        entry={HIDDEN_ENTRY}
        description={HIDDEN}
      />,
    );

    expect(
      screen
        .getByTestId("universal-axis-fill-start")
        .style.getPropertyValue("--axis-color"),
    ).toBe(COLOR);
    expect(
      screen.getByTestId("universal-axis-cap-start"),
    ).toBeEmptyDOMElement();
    expect(screen.queryByRole("presentation")).toBeNull();

    unmount();
    const { container } = renderWithI18n(
      <SurveyCheckpointPositionPuzzleVisual
        name={NAME}
        entry={LEADER_ENTRY}
        description={`${NAME} jest blisko Ciebie`}
      />,
    );

    expect(
      screen
        .getByTestId("universal-axis-fill-start")
        .style.getPropertyValue("--axis-color"),
    ).toBe("#27ae60");
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/green.png",
    );
  });

  it("names the bar by the description it is given", () => {
    const { unmount } = renderWithI18n(
      <SurveyCheckpointPositionPuzzleVisual
        entry={HIDDEN_ENTRY}
        description={HIDDEN}
      />,
    );

    expect(screen.getByRole("img")).toHaveAccessibleName(HIDDEN);

    unmount();
    renderWithI18n(
      <SurveyCheckpointPositionPuzzleVisual
        name={NAME}
        entry={LEADER_ENTRY}
        description={`${NAME} jest blisko Ciebie`}
      />,
    );

    expect(getBar()).toHaveAccessibleName(`${NAME} jest blisko Ciebie`);
  });

  it("fills the width it is given", () => {
    const { container } = renderWithI18n(
      <SurveyCheckpointPositionPuzzleVisual
        entry={HIDDEN_ENTRY}
        description={HIDDEN}
      />,
    );

    expect(container.firstElementChild).toHaveClass("w-full", "min-w-0");
    expect(screen.getByRole("img")).toHaveClass("w-full");
  });
});
