import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import type { RankedEntry } from "../RankedRow/RankedRow.types";
import { HorizontalBarChart } from "./HorizontalBarChart";
import type {
  HorizontalBarChartProps,
  RankedCategory,
} from "./HorizontalBarChart.types";

const entry = (
  name: string,
  value?: number,
  badge?: RankedEntry["badge"],
): RankedEntry => ({
  orientation: createOrientation(name.toLowerCase(), name),
  value,
  badge,
});

const hidden = (name: string, value?: number): RankedEntry => ({
  orientation: createOrientation(name.toLowerCase(), name, { isHidden: true }),
  value,
});

const ENTRIES: RankedEntry[] = [
  entry("Delta", 40),
  entry("Alfa", 90),
  entry("Echo", 10),
  entry("Beta", 70),
  entry("Gamma", 55),
];

const CATEGORIES: RankedCategory[] = [
  {
    name: "Gospodarka",
    entries: [
      entry("Alfa", 20),
      entry("Beta", 65, { text: "Oficjalne" }),
      entry("Gamma", 60),
      entry("Delta", 30),
      entry("Echo", 5),
    ],
  },
  { name: "Światopogląd", entries: [entry("Delta", 75), entry("Alfa", 10)] },
];

const FRIEND = createOrientation("ania", "Ania", { type: "person" });

const renderChart = (props: Partial<HorizontalBarChartProps> = {}) =>
  renderWithI18n(<HorizontalBarChart title="Kandydaci" {...props} />);

const getNames = (): (string | null)[] =>
  screen.getAllByTestId("ranked-row-name").map((name) => name.textContent);

const getCategories = (): HTMLElement[] =>
  screen.getAllByTestId("horizontal-bar-chart-category");

const press = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

describe("<HorizontalBarChart />", () => {
  describe("given a flat list longer than visibleRows", () => {
    it("renders the top rows and an open control", () => {
      renderChart({ entries: ENTRIES });

      expect(getNames()).toEqual(["Alfa", "Beta", "Gamma"]);
      expect(
        screen.getByRole("button", { name: "Pokaż wszystkie" }),
      ).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByRole("button", { name: "Pokaż mniej" }),
      ).not.toBeInTheDocument();
    });

    it("renders each row as a bar with no marker", () => {
      renderChart({ entries: ENTRIES });

      expect(screen.getByRole("img", { name: "Alfa: 90%" })).toBeVisible();
      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
    });

    describe("when the control is pressed", () => {
      it("renders every row and a close control", () => {
        renderChart({ entries: ENTRIES });

        press("Pokaż wszystkie");

        expect(getNames()).toEqual(["Alfa", "Beta", "Gamma", "Delta", "Echo"]);
        expect(
          screen.getByRole("button", { name: "Pokaż mniej" }),
        ).toHaveAttribute("aria-expanded", "true");
        expect(
          screen.queryByRole("button", { name: "Pokaż wszystkie" }),
        ).not.toBeInTheDocument();
      });

      it("keeps focus on the control", () => {
        renderChart({ entries: ENTRIES });
        const control = screen.getByRole("button", { name: "Pokaż wszystkie" });

        control.focus();
        fireEvent.click(control);

        expect(screen.getByRole("button", { name: "Pokaż mniej" })).toBe(
          control,
        );
        expect(control).toHaveFocus();
      });
    });

    describe("when the close control is pressed", () => {
      it("folds the list again", () => {
        renderChart({ entries: ENTRIES });

        press("Pokaż wszystkie");
        press("Pokaż mniej");

        expect(getNames()).toEqual(["Alfa", "Beta", "Gamma"]);
        expect(
          screen.getByRole("button", { name: "Pokaż wszystkie" }),
        ).toHaveAttribute("aria-expanded", "false");
      });
    });
  });

  describe("given a flat list no longer than visibleRows", () => {
    it("renders every row and no control", () => {
      renderChart({ entries: ENTRIES.slice(0, 3) });

      expect(getNames()).toEqual(["Alfa", "Delta", "Echo"]);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a custom visibleRows", () => {
    it("folds the list there", () => {
      renderChart({ entries: ENTRIES, visibleRows: 4 });

      expect(getNames()).toEqual(["Alfa", "Beta", "Gamma", "Delta"]);
    });
  });

  describe("given an invalid visibleRows", () => {
    it.each([
      0,
      -2,
      2.5,
      Number.NaN,
      "4" as unknown as number,
    ])("falls back to 3 for %s", (visibleRows) => {
      renderChart({ entries: ENTRIES, visibleRows });

      expect(getNames()).toEqual(["Alfa", "Beta", "Gamma"]);
    });
  });

  describe("given entries in any order", () => {
    it("keeps the given order for equal values and puts missing values last", () => {
      renderChart({
        visibleRows: 10,
        entries: [
          entry("Alfa"),
          entry("Beta", 50),
          entry("Gamma", 50),
          entry("Delta"),
          entry("Echo", 80),
        ],
      });

      expect(getNames()).toEqual(["Echo", "Beta", "Gamma", "Alfa", "Delta"]);
    });

    it("renders the same orientation twice when it is given twice", () => {
      renderChart({ entries: [entry("Alfa", 50), entry("Alfa", 20)] });

      expect(getNames()).toEqual(["Alfa", "Alfa"]);
    });

    it("renders an entry without an orientation under an empty name", () => {
      renderChart({
        entries: [{ value: 40 } as RankedEntry, entry("Alfa", 5)],
      });

      expect(getNames()).toEqual(["", "Alfa"]);
    });

    it("renders a badge with its row without moving it", () => {
      renderChart({
        entries: [entry("Alfa", 20, { text: "Oficjalne" }), entry("Beta", 50)],
      });

      const [first, second] = screen.getAllByRole("listitem");

      expect(getNames()).toEqual(["Beta", "Alfa"]);
      expect(
        within(first).queryByTestId("ranked-row-badge"),
      ).not.toBeInTheDocument();
      expect(within(second).getByTestId("ranked-row-badge")).toHaveTextContent(
        "Oficjalne",
      );
    });
  });

  describe("given categories", () => {
    it("renders each category with its name, leader and the leader bar", () => {
      renderChart({ categories: CATEGORIES });

      const [first, second] = getCategories();

      expect(
        within(first).getByRole("heading", {
          level: 3,
          name: "Gospodarka — Beta",
        }),
      ).toBeInTheDocument();
      expect(within(first).getByTestId("ranked-row-badge")).toHaveTextContent(
        "Oficjalne",
      );
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
      expect(
        within(second).getByRole("img", { name: "Delta: 75%" }),
      ).toBeInTheDocument();
      expect(getNames()).toHaveLength(2);
    });

    it("keeps the categories in the given order", () => {
      renderChart({ categories: [...CATEGORIES].reverse() });

      expect(getNames()).toEqual(["Światopogląd — Delta", "Gospodarka — Beta"]);
    });

    it("never cuts the list of categories", () => {
      renderChart({
        visibleRows: 1,
        categories: [...CATEGORIES, ...CATEGORIES, ...CATEGORIES],
      });

      expect(getCategories()).toHaveLength(6);
      expect(
        screen.queryByRole("button", { name: "Pokaż wszystkie" }),
      ).not.toBeInTheDocument();
    });

    it("ignores entries when both are passed", () => {
      renderChart({ entries: ENTRIES, categories: CATEGORIES });

      expect(getCategories()).toHaveLength(2);
      expect(
        screen.queryByRole("button", { name: "Pokaż wszystkie" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Echo")).not.toBeInTheDocument();
    });

    describe("when a category is opened", () => {
      it("renders that category alone, with its full ranking", () => {
        renderChart({ categories: CATEGORIES });

        press("Pokaż kategorię: Gospodarka");

        expect(getNames()).toEqual([
          "Gospodarka — Beta",
          "Gamma",
          "Delta",
          "Alfa",
          "Echo",
        ]);
        expect(
          screen.queryByTestId("horizontal-bar-chart-category"),
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/Światopogląd/)).not.toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Wróć do kategorii" }),
        ).toHaveAttribute("aria-expanded", "true");
        expect(screen.getAllByRole("button")).toHaveLength(1);
      });

      it("keeps the leader as the first row of the ranking", () => {
        renderChart({ categories: CATEGORIES });

        press("Pokaż kategorię: Gospodarka");

        const rows = within(screen.getByRole("list")).getAllByRole("listitem");

        expect(screen.getByRole("list").tagName).toBe("OL");
        expect(rows).toHaveLength(5);
        expect(
          within(rows[0]).getByRole("heading", { name: "Gospodarka — Beta" }),
        ).toBeInTheDocument();
      });

      it("does not apply the fold inside it", () => {
        renderChart({ categories: CATEGORIES, visibleRows: 1 });

        press("Pokaż kategorię: Gospodarka");

        expect(getNames()).toHaveLength(5);
      });

      it("moves focus to the control that returns to the list", () => {
        renderChart({ categories: CATEGORIES });

        press("Pokaż kategorię: Gospodarka");

        expect(
          screen.getByRole("button", { name: "Wróć do kategorii" }),
        ).toHaveFocus();
      });
    });

    describe("when the return control is pressed", () => {
      it("renders the list of categories again", () => {
        renderChart({ categories: CATEGORIES });

        press("Pokaż kategorię: Światopogląd");
        press("Wróć do kategorii");

        expect(getNames()).toEqual([
          "Gospodarka — Beta",
          "Światopogląd — Delta",
        ]);
        expect(
          screen.queryByRole("button", { name: "Wróć do kategorii" }),
        ).not.toBeInTheDocument();
      });

      it("moves focus to the control of the category that was open", () => {
        renderChart({ categories: CATEGORIES });

        press("Pokaż kategorię: Światopogląd");
        press("Wróć do kategorii");

        expect(
          screen.getByRole("button", { name: "Pokaż kategorię: Światopogląd" }),
        ).toHaveFocus();
      });
    });

    describe("when the open category is no longer passed", () => {
      it("renders the list of categories", () => {
        const { rerender } = renderChart({ categories: CATEGORIES });

        press("Pokaż kategorię: Światopogląd");
        rerender(
          <I18nProvider i18n={i18n}>
            <HorizontalBarChart
              title="Kandydaci"
              categories={CATEGORIES.slice(0, 1)}
            />
          </I18nProvider>,
        );

        expect(getNames()).toEqual(["Gospodarka — Beta"]);
      });
    });
  });

  describe("given an open category and categories that change", () => {
    const LAW: RankedCategory = {
      name: "Prawo",
      entries: [entry("Gamma", 30)],
    };

    const rerenderWith = (
      rerender: (ui: React.ReactElement) => void,
      categories: RankedCategory[],
    ) =>
      rerender(
        <I18nProvider i18n={i18n}>
          <HorizontalBarChart title="Kandydaci" categories={categories} />
        </I18nProvider>,
      );

    it("keeps the same category open when an earlier one is removed", () => {
      const { rerender } = renderChart({ categories: [...CATEGORIES, LAW] });

      press("Pokaż kategorię: Światopogląd");
      rerenderWith(rerender, [CATEGORIES[1], LAW]);

      expect(getNames()).toEqual(["Światopogląd — Delta", "Alfa"]);
    });

    it("keeps the same category open when one is inserted before it", () => {
      const { rerender } = renderChart({ categories: CATEGORIES });

      press("Pokaż kategorię: Światopogląd");
      rerenderWith(rerender, [LAW, ...CATEGORIES]);

      expect(getNames()).toEqual(["Światopogląd — Delta", "Alfa"]);
    });

    it("keeps the same category open when the list is reordered", () => {
      const { rerender } = renderChart({ categories: [...CATEGORIES, LAW] });

      press("Pokaż kategorię: Gospodarka");
      rerenderWith(rerender, [LAW, CATEGORIES[1], CATEGORIES[0]]);

      expect(getNames()[0]).toBe("Gospodarka — Beta");
      expect(getNames()).toHaveLength(5);
    });

    it("returns to the list when the open category is removed", () => {
      const { rerender } = renderChart({ categories: [...CATEGORIES, LAW] });

      press("Pokaż kategorię: Gospodarka");
      rerenderWith(rerender, [CATEGORIES[1], LAW]);

      expect(getNames()).toEqual(["Światopogląd — Delta", "Prawo — Gamma"]);
      expect(
        screen.queryByRole("button", { name: "Wróć do kategorii" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a category with no value above zero", () => {
    const WITHOUT_RESULT: RankedCategory[] = [
      { name: "Gospodarka", entries: [entry("Alfa", 0), entry("Beta")] },
    ];

    it("says there is no result and renders an empty track", () => {
      renderChart({ categories: WITHOUT_RESULT });

      expect(
        screen.getByRole("heading", { name: "Gospodarka — Brak wyniku" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Brak wyniku" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-cap-start"),
      ).not.toBeInTheDocument();
    });

    it("can still be opened", () => {
      renderChart({ categories: WITHOUT_RESULT });

      press("Pokaż kategorię: Gospodarka");

      expect(getNames()).toEqual(["Gospodarka — Brak wyniku", "Alfa", "Beta"]);
      expect(
        within(screen.getByRole("list")).getAllByRole("listitem"),
      ).toHaveLength(2);
      expect(
        screen.getByRole("button", { name: "Wróć do kategorii" }),
      ).toHaveFocus();
    });
  });

  describe("given a category with no entries", () => {
    it("renders it with no result and no control", () => {
      renderChart({
        categories: [
          { name: "Gospodarka", entries: [] },
          { name: "Prawo" } as RankedCategory,
        ],
      });

      expect(getNames()).toEqual([
        "Gospodarka — Brak wyniku",
        "Prawo — Brak wyniku",
      ]);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a category without a name", () => {
    it("renders the leader alone and a control with a general name", () => {
      renderChart({
        categories: [{ entries: [entry("Alfa", 40), entry("Beta", 10)] }],
      });

      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "Alfa",
      );
      expect(
        screen.getByRole("button", { name: "Pokaż kategorię" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a category with one entry", () => {
    const SINGLE: RankedCategory = {
      name: "Prawo",
      entries: [entry("Gamma", 30)],
    };

    it("renders its heading and leader bar and no control to open it", () => {
      renderChart({ categories: [SINGLE, ...CATEGORIES] });

      const [law] = getCategories();

      expect(
        within(law).getByRole("heading", { name: "Prawo — Gamma" }),
      ).toBeInTheDocument();
      expect(
        within(law).getByRole("img", { name: "Gamma: 30%" }),
      ).toBeInTheDocument();
      expect(within(law).queryByRole("button")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Pokaż kategorię: Prawo" }),
      ).not.toBeInTheDocument();
    });

    it("keeps the control of every category that has more entries", () => {
      renderChart({ categories: [SINGLE, ...CATEGORIES] });

      expect(
        screen.getByRole("button", { name: "Pokaż kategorię: Gospodarka" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Pokaż kategorię: Światopogląd" }),
      ).toBeInTheDocument();
    });

    it("has no control when that entry has no result", () => {
      renderChart({
        categories: [{ name: "Prawo", entries: [entry("Gamma", 0)] }],
      });

      expect(
        screen.getByRole("heading", { name: "Prawo — Brak wyniku" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Pokaż kategorię/ }),
      ).not.toBeInTheDocument();
    });

    it("counts only the entries that are drawn", () => {
      renderChart({
        categories: [
          { name: "Prawo", entries: [entry("Gamma", 30), hidden("Zulu", 90)] },
        ],
      });

      expect(
        screen.getByRole("heading", { name: "Prawo — Gamma" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Pokaż kategorię/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a comparison", () => {
    const comparison = {
      orientation: FRIEND,
      values: { alfa: 30, gamma: 80, zulu: 50 },
    };

    it("passes each orientation value to its row", () => {
      renderChart({ entries: ENTRIES, comparison });

      expect(
        screen.getByRole("img", { name: "Alfa: 90%, porównanie z Ania: 30%" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Gamma: 55%, porównanie z Ania: 80%" }),
      ).toBeInTheDocument();
    });

    it("renders rows without a comparison value with no overlay", () => {
      renderChart({ entries: ENTRIES, comparison });

      const row = screen.getAllByRole("listitem")[1];

      expect(
        within(row).getByRole("img", { name: "Beta: 70%" }),
      ).toBeInTheDocument();
      expect(
        within(row).queryByTestId("universal-axis-comparison-image"),
      ).not.toBeInTheDocument();
    });

    it("does not change the order", () => {
      renderChart({ entries: ENTRIES, comparison, visibleRows: 10 });

      expect(getNames()).toEqual(["Alfa", "Beta", "Gamma", "Delta", "Echo"]);
    });

    it("ignores values for orientations not in the list", () => {
      renderChart({ entries: ENTRIES, comparison, visibleRows: 10 });

      expect(
        screen.getAllByTestId("universal-axis-comparison-image"),
      ).toHaveLength(2);
      expect(screen.queryByText(/zulu/i)).not.toBeInTheDocument();
    });

    it("passes the value to a category leader and to the opened ranking", () => {
      renderChart({
        categories: CATEGORIES,
        comparison: { orientation: FRIEND, values: { beta: 20, gamma: 45 } },
      });

      expect(
        screen.getByRole("img", { name: "Beta: 65%, porównanie z Ania: 20%" }),
      ).toBeInTheDocument();

      press("Pokaż kategorię: Gospodarka");

      expect(
        screen.getByRole("img", { name: "Gamma: 60%, porównanie z Ania: 45%" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a hidden orientation in a flat list", () => {
    it("does not draw its row and does not count it against the fold", () => {
      renderChart({
        entries: [
          entry("Delta", 40),
          hidden("Alfa", 90),
          entry("Beta", 70),
          entry("Gamma", 55),
        ],
      });

      expect(getNames()).toEqual(["Beta", "Gamma", "Delta"]);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a category whose best entry is hidden", () => {
    const categories: RankedCategory[] = [
      {
        name: "Gospodarka",
        entries: [entry("Alfa", 20), hidden("Beta", 65), entry("Gamma", 60)],
      },
    ];

    it("leads the category with the best entry that is shown", () => {
      renderChart({ categories });

      expect(
        screen.getByRole("heading", { level: 3, name: "Gospodarka — Gamma" }),
      ).toBeInTheDocument();

      press("Pokaż kategorię: Gospodarka");

      expect(getNames()).toEqual(["Gospodarka — Gamma", "Alfa"]);
    });
  });

  describe("given only hidden orientations", () => {
    it("draws the empty state", () => {
      renderChart({ entries: [hidden("Alfa", 90), hidden("Beta", 70)] });

      expect(
        screen.getByRole("heading", { level: 2, name: "Kandydaci" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a comparison value for a hidden orientation", () => {
    it("ignores it", () => {
      renderChart({
        entries: [entry("Alfa", 90), hidden("Beta", 70), entry("Gamma", 55)],
        comparison: { orientation: FRIEND, values: { alfa: 30, beta: 20 } },
      });

      expect(getNames()).toEqual(["Alfa", "Gamma"]);
      expect(
        screen.getAllByTestId("universal-axis-comparison-image"),
      ).toHaveLength(1);
      expect(
        screen.getByRole("img", { name: "Alfa: 90%, porównanie z Ania: 30%" }),
      ).toBeInTheDocument();
    });
  });

  describe("given no entries", () => {
    it.each<[string, Partial<HorizontalBarChartProps>]>([
      ["no entries", {}],
      ["an empty list", { entries: [] }],
      ["an empty list of categories", { categories: [], entries: ENTRIES }],
    ])("renders an empty card under its title for %s", (_, props) => {
      renderChart(props);

      expect(
        screen.getByRole("heading", { level: 2, name: "Kandydaci" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByRole("separator")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given the wrapper actions", () => {
    it("passes both through", () => {
      const onStatsClick = vi.fn();
      const onInfoClick = vi.fn();

      renderChart({ entries: ENTRIES, onStatsClick, onInfoClick });

      press("Statystyki: Kandydaci");
      press("Informacje: Kandydaci");

      expect(onStatsClick).toHaveBeenCalledTimes(1);
      expect(onInfoClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("renders the rows as an ordered list", () => {
      renderChart({ entries: ENTRIES });

      const list = screen.getByRole("list");

      expect(list.tagName).toBe("OL");
      expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    });

    it("says on each control whether the list is open", () => {
      renderChart({ categories: CATEGORIES });

      for (const control of screen.getAllByRole("button")) {
        expect(control).toHaveAttribute("aria-expanded", "false");
      }

      press("Pokaż kategorię: Gospodarka");

      expect(
        screen.getByRole("button", { name: "Wróć do kategorii" }),
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("renders the controls as keyboard-operable buttons", () => {
      renderChart({ entries: ENTRIES });

      const control = screen.getByRole("button", { name: "Pokaż wszystkie" });

      expect(control.tagName).toBe("BUTTON");
      expect(control).not.toHaveAttribute("tabindex", "-1");
      expect(control).toBeEnabled();
    });
  });
});
