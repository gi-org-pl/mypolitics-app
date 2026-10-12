import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";
import type { CategoryItem } from "../HorizontalBarChartCategories.types";
import { HorizontalBarChartCategoryList } from "./HorizontalBarChartCategoryList";

const entry = (name: string, value?: number): RankedEntry => ({
  orientation: createOrientation(name.toLowerCase(), name),
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
  item("views", "Światopogląd", [entry("Delta", 75), entry("Alfa", 10)]),
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
            item(
              "economy",
              "Gospodarka",
              [entry("Alfa", 0), entry("Beta")],
              false,
            ),
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

  describe("given a category with one entry", () => {
    const SINGLE = item("law", "Prawo", [entry("Gamma", 30)]);

    it("renders its heading and leader bar with no control", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={[SINGLE]}
          onOpen={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("heading", { name: "Prawo — Gamma" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Gamma: 30%" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("closes it with the foot of a category that cannot be opened", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={[SINGLE, item("empty", "Pusta", [])]}
          onOpen={vi.fn()}
        />,
      );

      const [single, empty] = getCategories();

      expect(single.lastElementChild).toHaveClass("h-4", "border-b");
      expect(single.lastElementChild?.className).toBe(
        empty.lastElementChild?.className,
      );
    });

    it("leaves the controls of the other categories in place", () => {
      const onOpen = vi.fn();

      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={[...CATEGORIES, SINGLE]}
          onOpen={onOpen}
        />,
      );

      const [economy, views, law] = getCategories();

      expect(within(economy).getByRole("button")).toBeInTheDocument();
      expect(within(views).getByRole("button")).toBeInTheDocument();
      expect(within(law).queryByRole("button")).not.toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    it("registers no control for it", () => {
      const registerControl = vi.fn(() => vi.fn());

      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={[...CATEGORIES, SINGLE]}
          registerControl={registerControl}
          onOpen={vi.fn()}
        />,
      );

      expect(registerControl).toHaveBeenCalledWith("economy");
      expect(registerControl).toHaveBeenCalledWith("views");
      expect(registerControl).not.toHaveBeenCalledWith("law");
    });

    it("has no control when the entry has no result either", () => {
      renderWithI18n(
        <HorizontalBarChartCategoryList
          categories={[item("law", "Prawo", [entry("Gamma", 0)], false)]}
          onOpen={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("heading", { name: "Prawo — Brak wyniku" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
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
          categories={[
            item("nameless", "", [entry("Alfa", 40), entry("Beta", 10)]),
          ]}
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
            orientation: { id: "ania", type: "person", name: "Ania" },
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
