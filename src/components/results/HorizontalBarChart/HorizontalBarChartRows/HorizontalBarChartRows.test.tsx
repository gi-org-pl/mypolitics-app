import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { RankedEntry } from "../../RankedRow/RankedRow.types";
import { HorizontalBarChartRows } from "./HorizontalBarChartRows";

const entry = (name: string, value?: number): RankedEntry => ({
  orientation: createOrientation(name.toLowerCase(), name),
  value,
});

const RANKING = [entry("Alfa", 90), entry("Beta", 70), entry("Gamma")];

const getNames = (): (string | null)[] =>
  screen.getAllByTestId("ranked-row-name").map((name) => name.textContent);

describe("<HorizontalBarChartRows />", () => {
  describe("given a ranking", () => {
    it("renders one list item with a ranked row per entry, in the given order", () => {
      renderWithI18n(
        <ol>
          <HorizontalBarChartRows ranking={RANKING} />
        </ol>,
      );

      const items = screen.getAllByRole("listitem");

      expect(items).toHaveLength(3);
      expect(getNames()).toEqual(["Alfa", "Beta", "Gamma"]);
      expect(
        within(items[0]).getByRole("img", { name: "Alfa: 90%" }),
      ).toBeInTheDocument();
      expect(
        within(items[2]).getByRole("img", { name: "Brak wyniku" }),
      ).toBeInTheDocument();
    });
  });

  describe("given the same orientation twice", () => {
    it("renders it twice", () => {
      renderWithI18n(
        <ol>
          <HorizontalBarChartRows
            ranking={[entry("Alfa", 50), entry("Alfa", 20)]}
          />
        </ol>,
      );

      expect(getNames()).toEqual(["Alfa", "Alfa"]);
    });
  });

  describe("given a comparison", () => {
    it("passes each orientation its own value and leaves the others without an overlay", () => {
      renderWithI18n(
        <ol>
          <HorizontalBarChartRows
            ranking={RANKING}
            comparison={{
              orientation: { id: "ania", type: "person", name: "Ania" },
              values: { beta: 30, zulu: 50 },
            }}
          />
        </ol>,
      );

      expect(
        screen.getByRole("img", { name: "Beta: 70%, porównanie z Ania: 30%" }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByTestId("universal-axis-comparison-image"),
      ).toHaveLength(1);
    });
  });

  describe("given an empty ranking", () => {
    it("renders no list items", () => {
      renderWithI18n(
        <ol>
          <HorizontalBarChartRows ranking={[]} />
        </ol>,
      );

      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });
  });
});
