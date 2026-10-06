import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";
import { HorizontalBarChartCategoryHeading } from "./HorizontalBarChartCategoryHeading";

const LEADER: RankedEntry = {
  orientation: { id: "beta", name: "Beta" },
  value: 65,
  badge: { text: "Oficjalne" },
};
const COMPARISON = {
  party: { id: "ania", name: "Ania" },
  values: { beta: 20 },
};

describe("<HorizontalBarChartCategoryHeading />", () => {
  describe("given a name and a leader", () => {
    it("renders a heading with both, the leader badge and the leader bar", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryHeading name="Gospodarka" leader={LEADER} />,
      );

      expect(
        screen.getByRole("heading", { level: 3, name: "Gospodarka — Beta" }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("ranked-row-badge")).toHaveTextContent(
        "Oficjalne",
      );
      expect(
        screen.getByRole("img", { name: "Beta: 65%" }),
      ).toBeInTheDocument();
    });
  });

  describe("given no leader", () => {
    it("says there is no result and renders an empty track", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryHeading
          name="Gospodarka"
          leader={null}
          comparison={COMPARISON}
        />,
      );

      expect(
        screen.getByRole("heading", { name: "Gospodarka — Brak wyniku" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Brak wyniku" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-cap-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-comparison-image"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given an empty name", () => {
    it("renders the leader alone", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryHeading name="" leader={LEADER} />,
      );

      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "Beta",
      );
    });
  });

  describe("given a comparison", () => {
    it("passes the leader value to the bar", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryHeading
          name="Gospodarka"
          leader={LEADER}
          comparison={COMPARISON}
        />,
      );

      expect(
        screen.getByRole("img", { name: "Beta: 65%, porównanie z Ania: 20%" }),
      ).toBeInTheDocument();
    });
  });
});
