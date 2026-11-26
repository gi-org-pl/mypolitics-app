import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { resolvedModules } from "@/utils/result-modules/resolvedModules.fixtures";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { MODULES_COMPARISON } from "../ResultsColumns.fixtures";
import { ResultsColumn } from "./ResultsColumn";

const getRegionNames = () =>
  screen
    .getAllByRole("region")
    .map((region) => region.getAttribute("aria-label"));

describe("<ResultsColumn />", () => {
  describe("given modules that name both columns", () => {
    it("draws the modules of its column only, by position", () => {
      renderWithI18n(
        <ResultsColumn column="start" modules={resolvedModules} />,
      );

      expect(getRegionNames()).toEqual([
        "Ekologia",
        "Ideologie",
        "Partie",
        "Cechy",
      ]);
    });

    it("gives each module its place in the order of the whole list", () => {
      const { container } = renderWithI18n(
        <ResultsColumn column="end" modules={resolvedModules} />,
      );
      const slots = [...(container.firstElementChild?.children ?? [])];

      expect(slots.map((slot) => (slot as HTMLElement).style.order)).toEqual([
        "0",
        "2",
        "5",
      ]);
    });

    it("hands a comparison on to every module of the column", () => {
      renderWithI18n(
        <ResultsColumn
          column="start"
          modules={resolvedModules}
          comparison={MODULES_COMPARISON}
        />,
      );

      expect(getRegionNames()).toEqual([
        "Ekologia",
        "Ideologie",
        "Partie",
        "Cechy",
      ]);
      expect(
        screen.getAllByRole("img", { name: /porównanie z Znajomy/ }).length,
      ).toBeGreaterThanOrEqual(4);
    });

    it("says which column it is", () => {
      const { container } = renderWithI18n(
        <ResultsColumn column="end" modules={resolvedModules} />,
      );

      expect(container.firstElementChild).toHaveAttribute("data-column", "end");
    });
  });

  describe("given no module that names its column", () => {
    it("is empty, so that the layout has one column", () => {
      const { container } = renderWithI18n(
        <ResultsColumn
          column="end"
          modules={resolvedModules.filter(({ column }) => column === "start")}
        />,
      );

      expect(container.firstElementChild).toBeEmptyDOMElement();
    });
  });

  describe("the layout", () => {
    it("is done in CSS: no box of its own on a narrow sheet, a stack on a wide one, gone when nothing is drawn in it", () => {
      const { container } = renderWithI18n(
        <ResultsColumn column="start" modules={resolvedModules} />,
      );

      expect(container.firstElementChild).toHaveClass(
        "contents",
        "@[44rem]:flex",
        "@[44rem]:flex-col",
        "@[44rem]:gap-4",
        "@[44rem]:[&:not(:has(>:not(:empty)))]:hidden",
      );
    });
  });
});
