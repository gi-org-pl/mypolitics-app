import { fireEvent, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";
import type { CategoryItem } from "../HorizontalBarChartCategories.types";
import { HorizontalBarChartOpenCategory } from "./HorizontalBarChartOpenCategory";

const entry = (name: string, value?: number): RankedEntry => ({
  orientation: { id: name.toLowerCase(), name },
  value,
});

const item = (
  key: string,
  name: string,
  ranking: RankedEntry[],
  hasResult = true,
): CategoryItem => ({
  key,
  name,
  ranking,
  leader: hasResult ? (ranking[0] ?? null) : null,
  rest: hasResult ? ranking.slice(1) : ranking,
});

const CATEGORY = item("economy", "Gospodarka", [
  entry("Beta", 65),
  entry("Gamma", 60),
  entry("Alfa", 20),
]);
const COMPARISON = {
  party: { id: "ania", name: "Ania" },
  values: { beta: 20, gamma: 45 },
};

const getNames = (): (string | null)[] =>
  screen.getAllByTestId("ranked-row-name").map((name) => name.textContent);

describe("<HorizontalBarChartOpenCategory />", () => {
  describe("given a category with a leader", () => {
    it("renders one ordered list with the heading as its first row, then the rest", () => {
      renderWithI18n(
        <HorizontalBarChartOpenCategory
          category={CATEGORY}
          onClose={vi.fn()}
        />,
      );

      const list = screen.getByRole("list");
      const rows = within(list).getAllByRole("listitem");

      expect(list.tagName).toBe("OL");
      expect(rows).toHaveLength(3);
      expect(
        within(rows[0]).getByRole("heading", { name: "Gospodarka — Beta" }),
      ).toBeInTheDocument();
      expect(getNames()).toEqual(["Gospodarka — Beta", "Gamma", "Alfa"]);
    });

    it("renders a return control that says the category is open", () => {
      renderWithI18n(
        <HorizontalBarChartOpenCategory
          category={CATEGORY}
          onClose={vi.fn()}
        />,
      );

      const control = screen.getByRole("button", { name: "Wróć do kategorii" });

      expect(control).toHaveAttribute("aria-expanded", "true");
      expect(control).not.toHaveClass("bg-transparent");
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  });

  describe("when the return control is pressed", () => {
    it("asks to close", () => {
      const onClose = vi.fn();

      renderWithI18n(
        <HorizontalBarChartOpenCategory
          category={CATEGORY}
          onClose={onClose}
        />,
      );
      fireEvent.click(screen.getByRole("button"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a category with no result", () => {
    it("renders the heading outside the list and every entry inside it", () => {
      renderWithI18n(
        <HorizontalBarChartOpenCategory
          category={item(
            "economy",
            "Gospodarka",
            [entry("Alfa", 0), entry("Beta")],
            false,
          )}
          comparison={COMPARISON}
          onClose={vi.fn()}
        />,
      );

      const list = screen.getByRole("list");
      const heading = screen.getByRole("heading", {
        name: "Gospodarka — Brak wyniku",
      });

      expect(list).not.toContainElement(heading);
      expect(within(list).getAllByRole("listitem")).toHaveLength(2);
      expect(getNames()).toEqual(["Gospodarka — Brak wyniku", "Alfa", "Beta"]);
    });
  });

  describe("given a category with the leader alone", () => {
    it("renders the leader and the return control", () => {
      renderWithI18n(
        <HorizontalBarChartOpenCategory
          category={item("views", "Światopogląd", [entry("Delta", 75)])}
          onClose={vi.fn()}
        />,
      );

      expect(getNames()).toEqual(["Światopogląd — Delta"]);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("given a comparison", () => {
    it("passes it to the leader and to the rest", () => {
      renderWithI18n(
        <HorizontalBarChartOpenCategory
          category={CATEGORY}
          comparison={COMPARISON}
          onClose={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("img", { name: "Beta: 65%, porównanie z Ania: 20%" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Gamma: 60%, porównanie z Ania: 45%" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Alfa: 20%" }),
      ).toBeInTheDocument();
    });
  });

  describe("given controlRef", () => {
    it("passes it to the return control", () => {
      const ref = createRef<HTMLButtonElement>();

      renderWithI18n(
        <HorizontalBarChartOpenCategory
          category={CATEGORY}
          controlRef={ref}
          onClose={vi.fn()}
        />,
      );

      expect(ref.current).toBe(screen.getByRole("button"));
    });
  });
});
