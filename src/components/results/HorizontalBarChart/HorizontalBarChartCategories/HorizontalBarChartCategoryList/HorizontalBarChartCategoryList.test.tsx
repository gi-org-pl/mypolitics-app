import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";
import type { CategoryItem } from "../HorizontalBarChartCategories.types";
import { HorizontalBarChartCategoryList } from "./HorizontalBarChartCategoryList";

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

const CATEGORIES: CategoryItem[] = [
  item("economy", "Gospodarka", [entry("Beta", 65), entry("Alfa", 20)]),
  item("views", "Światopogląd", [entry("Delta", 75)]),
];

const getCategories = (): HTMLElement[] =>
  screen.getAllByTestId("horizontal-bar-chart-category");

describe("<HorizontalBarChartCategoryList />", () => {
  describe("given categories", () => {
    it("renders each one in the given order with its heading, leader bar and open control", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={CATEGORIES}
          onOpen={vi.fn()}
        />,
      );

      const [first, second] = getCategories();

      expect(screen.getByRole("list").tagName).toBe("UL");
      expect(
        within(first).getByRole("heading", { name: "Gospodarka — Beta" }),
      ).toBeInTheDocument();
      expect(
        within(first).getByRole("img", { name: "Beta: 65%" }),
      ).toBeInTheDocument();
      expect(
        within(first).getByRole("button", {
          name: "Pokaż kategorię: Gospodarka",
        }),
      ).toHaveAttribute("aria-expanded", "false");
      expect(
        within(second).getByRole("heading", { name: "Światopogląd — Delta" }),
      ).toBeInTheDocument();
      expect(screen.getAllByTestId("ranked-row-name")).toHaveLength(2);
    });

    it("renders every control quiet, with a line under it", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={CATEGORIES}
          onOpen={vi.fn()}
        />,
      );

      for (const control of screen.getAllByRole("button")) {
        expect(control).toHaveClass("bg-transparent", "border-b");
      }
    });
  });

  describe("when a control is pressed", () => {
    it("asks to open that category by its key", () => {
      const onOpen = vi.fn();

      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={CATEGORIES}
          onOpen={onOpen}
        />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Pokaż kategorię: Światopogląd" }),
      );

      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(onOpen).toHaveBeenCalledWith("views");
    });
  });

  describe("given a category with no result", () => {
    it("says so and still renders its control", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={[
            item("economy", "Gospodarka", [entry("Alfa", 0)], false),
          ]}
          onOpen={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("heading", { name: "Gospodarka — Brak wyniku" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Pokaż kategorię: Gospodarka" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a category with no entries", () => {
    it("renders it with no result and no control", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={[item("economy", "Gospodarka", [])]}
          onOpen={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("heading", { name: "Gospodarka — Brak wyniku" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a category without a name", () => {
    it("gives its control a general name", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={[item("nameless", "", [entry("Alfa", 40)])]}
          onOpen={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("button", { name: "Pokaż kategorię" }),
      ).toBeInTheDocument();
    });
  });

  describe("given registerControl", () => {
    it("registers each control under the key of its category", () => {
      const controls = new Map<string, HTMLButtonElement | null>();

      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={CATEGORIES}
          registerControl={(key) => (node) => {
            controls.set(key, node);
          }}
          onOpen={vi.fn()}
        />,
      );

      expect(controls.get("economy")).toBe(
        screen.getByRole("button", { name: "Pokaż kategorię: Gospodarka" }),
      );
      expect(controls.get("views")).toBe(
        screen.getByRole("button", { name: "Pokaż kategorię: Światopogląd" }),
      );
    });
  });

  describe("given a comparison", () => {
    it("passes it to each leader bar", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={CATEGORIES}
          comparison={{
            party: { id: "ania", name: "Ania" },
            values: { delta: 10 },
          }}
          onOpen={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("img", { name: "Delta: 75%, porównanie z Ania: 10%" }),
      ).toBeInTheDocument();
    });
  });
});
