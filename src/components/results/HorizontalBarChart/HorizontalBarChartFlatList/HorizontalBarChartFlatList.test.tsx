import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { RankedEntry } from "../../RankedRow/RankedRow.types";
import { HorizontalBarChartFlatList } from "./HorizontalBarChartFlatList";

const RANKING: RankedEntry[] = [
  ["Alfa", 90],
  ["Beta", 70],
  ["Gamma", 55],
  ["Delta", 40],
].map(([name, value]) => ({
  orientation: createOrientation(String(name).toLowerCase(), String(name)),
  value: Number(value),
}));

const getNames = (): (string | null)[] =>
  screen.getAllByTestId("ranked-row-name").map((name) => name.textContent);

describe("<HorizontalBarChartFlatList />", () => {
  describe("given a ranking longer than visibleRows", () => {
    it("renders the top rows in an ordered list and a quiet open control", () => {
      renderWithI18n(<HorizontalBarChartFlatList ranking={RANKING} />);

      const control = screen.getByRole("button", { name: "Pokaż wszystkie" });

      expect(screen.getByRole("list").tagName).toBe("OL");
      expect(getNames()).toEqual(["Alfa", "Beta", "Gamma"]);
      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(control).toHaveClass("bg-transparent");
    });

    describe("when the control is pressed", () => {
      it("renders every row and a filled close control", () => {
        renderWithI18n(<HorizontalBarChartFlatList ranking={RANKING} />);

        fireEvent.click(screen.getByRole("button"));

        const control = screen.getByRole("button", { name: "Pokaż mniej" });

        expect(getNames()).toEqual(["Alfa", "Beta", "Gamma", "Delta"]);
        expect(control).toHaveAttribute("aria-expanded", "true");
        expect(control).not.toHaveClass("bg-transparent");
      });
    });

    describe("when the close control is pressed", () => {
      it("folds the list again", () => {
        renderWithI18n(<HorizontalBarChartFlatList ranking={RANKING} />);

        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByRole("button"));

        expect(getNames()).toEqual(["Alfa", "Beta", "Gamma"]);
        expect(
          screen.getByRole("button", { name: "Pokaż wszystkie" }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("given a custom visibleRows", () => {
    it("folds the list there", () => {
      renderWithI18n(
        <HorizontalBarChartFlatList ranking={RANKING} visibleRows={1} />,
      );

      expect(getNames()).toEqual(["Alfa"]);
    });
  });

  describe("given a ranking no longer than visibleRows", () => {
    it("renders every row and no control", () => {
      renderWithI18n(
        <HorizontalBarChartFlatList ranking={RANKING} visibleRows={4} />,
      );

      expect(getNames()).toHaveLength(4);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a comparison", () => {
    it("passes it to the rows", () => {
      renderWithI18n(
        <HorizontalBarChartFlatList
          ranking={RANKING}
          comparison={{
            orientation: { id: "ania", type: "person", name: "Ania" },
            values: { alfa: 30 },
          }}
        />,
      );

      expect(
        screen.getByRole("img", { name: "Alfa: 90%, porównanie z Ania: 30%" }),
      ).toBeInTheDocument();
    });
  });
});
