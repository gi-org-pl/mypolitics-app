import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MATCH_BAND_COLORS } from "@/constants/results";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { ArchetypeEntry } from "../Archetype.types";
import { ArchetypeLeader } from "./ArchetypeLeader";

const OWN_COLOR = "#123456";

const leader = (
  match?: number,
  orientation: Partial<ArchetypeEntry["orientation"]> = {},
): ArchetypeEntry => ({
  orientation: {
    id: "alfa",
    type: "identity",
    name: "Alfa",
    imageUrl: "alfa.png",
    color: OWN_COLOR,
    ...orientation,
  },
  match,
});

const FRIEND = createOrientation("ania", "Ania", { type: "person" });
const COMPARISON = { orientation: FRIEND, values: { alfa: 60 } };

const getFillColor = (): string =>
  screen
    .getByTestId("universal-axis-fill-start")
    .style.getPropertyValue("--axis-color");

describe("<ArchetypeLeader />", () => {
  describe("given a matched leader", () => {
    it("renders its name as a heading and its match on a bar with its image", () => {
      renderWithI18n(<ArchetypeLeader leader={leader(85)} isMatched />);

      const heading = screen.getByRole("heading", { level: 3, name: "Alfa" });

      expect(heading).toHaveClass("text-gi-primary", "truncate");
      expect(screen.getByRole("img", { name: "Alfa: 85%" })).toBeVisible();
      expect(
        screen.getByTestId("universal-axis-cap-start").querySelector("img"),
      ).toHaveAttribute("src", "alfa.png");
    });

    it("renders no marker and no labels", () => {
      renderWithI18n(<ArchetypeLeader leader={leader(85)} isMatched />);

      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-labels"),
      ).not.toBeInTheDocument();
    });

    it.each([
      [85, "match"],
      [64, "partial"],
    ] as const)("colours a match of %s by the %s band, not by its own colour", (match, band) => {
      const { container } = renderWithI18n(
        <ArchetypeLeader leader={leader(match)} isMatched />,
      );

      expect(getFillColor()).toBe(MATCH_BAND_COLORS[band]);
      expect(container.innerHTML).not.toContain(OWN_COLOR);
    });

    it("renders a name with line breaks on one line", () => {
      renderWithI18n(
        <ArchetypeLeader
          leader={leader(85, { name: "  Zielony\n  postępowiec " })}
          isMatched
        />,
      );

      expect(screen.getByTestId("archetype-leader-name").textContent).toBe(
        "Zielony postępowiec",
      );
    });

    it("draws the cap with colour only when there is no image", () => {
      renderWithI18n(
        <ArchetypeLeader
          leader={leader(85, { imageUrl: undefined })}
          isMatched
        />,
      );

      const cap = screen.getByTestId("universal-axis-cap-start");

      expect(cap.querySelector("img")).not.toBeInTheDocument();
      expect(cap.style.getPropertyValue("--axis-color")).toBe(
        MATCH_BAND_COLORS.match,
      );
    });

    it("passes the comparison value for the leader to the bar", () => {
      renderWithI18n(
        <ArchetypeLeader
          leader={leader(85)}
          isMatched
          comparison={COMPARISON}
        />,
      );

      expect(
        screen.getByRole("img", { name: "Alfa: 85%, porównanie z Ania: 60%" }),
      ).toBeVisible();
    });

    it("draws no overlay without a comparison value for the leader", () => {
      renderWithI18n(
        <ArchetypeLeader
          leader={leader(85)}
          isMatched
          comparison={{ orientation: FRIEND, values: { beta: 60 } }}
        />,
      );

      expect(
        screen.queryByTestId("universal-axis-comparison-line"),
      ).not.toBeInTheDocument();
    });

    it("draws an empty track when the match is not a number", () => {
      renderWithI18n(<ArchetypeLeader leader={leader()} isMatched />);

      expect(screen.getByRole("heading", { name: "Alfa" })).toBeVisible();
      expect(screen.getByRole("img", { name: "Brak wyniku" })).toBeVisible();
    });
  });

  describe("given a leader that is no match", () => {
    it("renders the no match wording, quiet, in place of the name", () => {
      renderWithI18n(<ArchetypeLeader leader={leader(45)} isMatched={false} />);

      const heading = screen.getByRole("heading", {
        level: 3,
        name: "Brak dopasowania",
      });

      expect(heading).toHaveClass("text-gi-primary/50");
      expect(screen.queryByText("Alfa")).not.toBeInTheDocument();
    });

    it("renders an empty track with no cap and no comparison", () => {
      renderWithI18n(
        <ArchetypeLeader
          leader={leader(45)}
          isMatched={false}
          comparison={COMPARISON}
        />,
      );

      expect(screen.getByRole("img", { name: "Brak wyniku" })).toBeVisible();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-cap-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-comparison-line"),
      ).not.toBeInTheDocument();
    });
  });
});
