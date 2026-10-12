import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { RankedEntry } from "../../RankedRow/RankedRow.types";
import type { RankedCategory } from "../HorizontalBarChart.types";
import { HorizontalBarChartCategories } from "./HorizontalBarChartCategories";

const entry = (name: string, value?: number): RankedEntry => ({
  orientation: createOrientation(name.toLowerCase(), name),
  value,
});

const ECONOMY: RankedCategory = {
  name: "Gospodarka",
  entries: [entry("Alfa", 20), entry("Beta", 65)],
};
const VIEWS: RankedCategory = {
  name: "Światopogląd",
  entries: [entry("Delta", 75), entry("Alfa", 10)],
};
const LAW: RankedCategory = { name: "Prawo", entries: [entry("Gamma", 30)] };

const wrap = (categories: RankedCategory[]) => (
  <I18nProvider i18n={i18n}>
    <HorizontalBarChartCategories categories={categories} />
  </I18nProvider>
);

const getNames = (): (string | null)[] =>
  screen.getAllByTestId("ranked-row-name").map((name) => name.textContent);

const press = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

describe("<HorizontalBarChartCategories />", () => {
  describe("given categories", () => {
    it("starts with the list of categories and nothing open", () => {
      renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, VIEWS]} />,
      );

      expect(getNames()).toEqual(["Gospodarka — Beta", "Światopogląd — Delta"]);
      expect(
        screen.queryByRole("button", { name: "Wróć do kategorii" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a category with one entry", () => {
    it("lists it with no control and keeps the controls of the others", () => {
      renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, LAW, VIEWS]} />,
      );

      expect(getNames()).toEqual([
        "Gospodarka — Beta",
        "Prawo — Gamma",
        "Światopogląd — Delta",
      ]);
      expect(
        screen.queryByRole("button", { name: "Pokaż kategorię: Prawo" }),
      ).not.toBeInTheDocument();
      expect(
        screen.getAllByRole("button").map((button) => button.ariaLabel),
      ).toEqual([
        "Pokaż kategorię: Gospodarka",
        "Pokaż kategorię: Światopogląd",
      ]);
    });

    it("still opens and closes the categories next to it", () => {
      renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, LAW, VIEWS]} />,
      );

      press("Pokaż kategorię: Światopogląd");

      expect(getNames()).toEqual(["Światopogląd — Delta", "Alfa"]);

      press("Wróć do kategorii");

      expect(getNames()).toHaveLength(3);
      expect(
        screen.getByRole("button", { name: "Pokaż kategorię: Światopogląd" }),
      ).toHaveFocus();
    });
  });

  describe("when a category is opened", () => {
    it("renders that category alone and moves focus to the return control", () => {
      renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, VIEWS]} />,
      );

      press("Pokaż kategorię: Światopogląd");

      expect(getNames()).toEqual(["Światopogląd — Delta", "Alfa"]);
      expect(
        screen.getByRole("button", { name: "Wróć do kategorii" }),
      ).toHaveFocus();
    });
  });

  describe("when the return control is pressed", () => {
    it("renders the list again and moves focus to the control of that category", () => {
      renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, VIEWS]} />,
      );

      press("Pokaż kategorię: Światopogląd");
      press("Wróć do kategorii");

      expect(getNames()).toHaveLength(2);
      expect(
        screen.getByRole("button", { name: "Pokaż kategorię: Światopogląd" }),
      ).toHaveFocus();
    });
  });

  describe("given an open category and a list that changes", () => {
    it("keeps the same category open when an earlier one is removed", () => {
      const { rerender } = renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, VIEWS, LAW]} />,
      );

      press("Pokaż kategorię: Światopogląd");
      rerender(wrap([VIEWS, LAW]));

      expect(getNames()).toEqual(["Światopogląd — Delta", "Alfa"]);
    });

    it("keeps the same category open when one is inserted before it", () => {
      const { rerender } = renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, VIEWS]} />,
      );

      press("Pokaż kategorię: Światopogląd");
      rerender(wrap([LAW, ECONOMY, VIEWS]));

      expect(getNames()).toEqual(["Światopogląd — Delta", "Alfa"]);
    });

    it("keeps the same category open when the list is reordered", () => {
      const { rerender } = renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, VIEWS, LAW]} />,
      );

      press("Pokaż kategorię: Światopogląd");
      rerender(wrap([LAW, VIEWS, ECONOMY]));

      expect(getNames()).toEqual(["Światopogląd — Delta", "Alfa"]);
    });

    it("shows the new entries of the open category", () => {
      const { rerender } = renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, VIEWS]} />,
      );

      press("Pokaż kategorię: Światopogląd");
      rerender(wrap([ECONOMY, { ...VIEWS, entries: [entry("Echo", 99)] }]));

      expect(getNames()).toEqual(["Światopogląd — Echo"]);
    });

    it("returns to the list when the open category is removed", () => {
      const { rerender } = renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, VIEWS, LAW]} />,
      );

      press("Pokaż kategorię: Światopogląd");
      rerender(wrap([ECONOMY, LAW]));

      expect(getNames()).toEqual(["Gospodarka — Beta", "Prawo — Gamma"]);
    });

    it("stays on the list when the removed category comes back", () => {
      const { rerender } = renderWithI18n(
        <HorizontalBarChartCategories categories={[ECONOMY, VIEWS]} />,
      );

      press("Pokaż kategorię: Światopogląd");
      rerender(wrap([ECONOMY]));
      rerender(wrap([ECONOMY, VIEWS]));

      expect(getNames()).toEqual(["Gospodarka — Beta", "Światopogląd — Delta"]);
    });
  });

  describe("given categories with ids", () => {
    it("keeps a category open when it is renamed", () => {
      const { rerender } = renderWithI18n(
        <HorizontalBarChartCategories
          categories={[ECONOMY, { ...VIEWS, id: "views" }]}
        />,
      );

      press("Pokaż kategorię: Światopogląd");
      rerender(wrap([ECONOMY, { ...VIEWS, id: "views", name: "Wartości" }]));

      expect(getNames()).toEqual(["Wartości — Delta", "Alfa"]);
    });

    it("tells apart two categories with the same name", () => {
      const twins: RankedCategory[] = [
        { ...ECONOMY, id: "first", name: "Temat" },
        { ...VIEWS, id: "second", name: "Temat" },
      ];
      const { rerender } = renderWithI18n(
        <HorizontalBarChartCategories categories={twins} />,
      );

      fireEvent.click(
        screen.getAllByRole("button", { name: "Pokaż kategorię: Temat" })[1],
      );
      rerender(wrap([twins[1], twins[0]]));

      expect(getNames()).toEqual(["Temat — Delta", "Alfa"]);
    });
  });
});
