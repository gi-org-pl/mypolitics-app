import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { resolvedModules } from "@/utils/result-modules/resolvedModules.fixtures";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { ResultsColumns } from "./ResultsColumns";
import { MODULES_COMPARISON } from "./ResultsColumns.fixtures";

const getColumn = (name: string) =>
  screen
    .getByRole("region", { name })
    .closest("[data-column]")
    ?.getAttribute("data-column");

describe("<ResultsColumns />", () => {
  describe("given modules that name both columns", () => {
    it("draws every module, each in the column its record names", () => {
      renderWithI18n(<ResultsColumns modules={resolvedModules} />);

      expect(screen.getAllByRole("region")).toHaveLength(
        resolvedModules.length,
      );
      expect(getColumn("Ideologie")).toBe("start");
      expect(getColumn("Partie")).toBe("start");
      expect(getColumn("Cechy")).toBe("start");
      expect(getColumn("Tożsamość")).toBe("end");
    });

    it("draws the start column before the end column", () => {
      const { container } = renderWithI18n(
        <ResultsColumns modules={resolvedModules} />,
      );

      expect(
        [...(container.firstElementChild?.children ?? [])].map((column) =>
          column.getAttribute("data-column"),
        ),
      ).toEqual(["start", "end"]);
    });
  });

  describe("given a comparison", () => {
    it("draws the same modules in the same columns, with the other side laid over them", () => {
      renderWithI18n(
        <ResultsColumns
          modules={resolvedModules}
          comparison={MODULES_COMPARISON}
        />,
      );

      expect(screen.getAllByRole("region")).toHaveLength(
        resolvedModules.length,
      );
      expect(getColumn("Ideologie")).toBe("start");
      expect(getColumn("Tożsamość")).toBe("end");
      expect(
        screen.getAllByRole("img", { name: /porównanie z Znajomy/ }).length,
      ).toBeGreaterThan(0);
    });

    it("draws no module the taker does not have, though the other side could", () => {
      renderWithI18n(
        <ResultsColumns
          modules={resolvedModules.filter(({ type }) => type !== "archetype")}
          comparison={MODULES_COMPARISON}
        />,
      );

      expect(
        screen.queryByRole("region", { name: "Tożsamość" }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole("region")).toHaveLength(
        resolvedModules.length - 1,
      );
    });
  });

  describe("given no comparison", () => {
    it("lays nothing over the modules", () => {
      renderWithI18n(<ResultsColumns modules={resolvedModules} />);

      expect(
        screen.queryByRole("img", { name: /porównanie z/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given modules that all name the same column", () => {
    it("leaves the other column empty", () => {
      const { container } = renderWithI18n(
        <ResultsColumns
          modules={resolvedModules.map((module) => ({
            ...module,
            column: "end" as const,
          }))}
        />,
      );

      expect(
        container.querySelector('[data-column="start"]'),
      ).toBeEmptyDOMElement();
      expect(
        container.querySelectorAll('[data-column="end"] > *'),
      ).toHaveLength(resolvedModules.length);
    });
  });

  describe("given no module", () => {
    it("draws no card", () => {
      renderWithI18n(<ResultsColumns modules={[]} />);

      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });
  });

  describe("the layout", () => {
    it("is done in CSS: one column of every module on a narrow sheet, columns of equal width side by side on a wide one", () => {
      const { container } = renderWithI18n(
        <ResultsColumns modules={resolvedModules} />,
      );

      expect(container.firstElementChild).toHaveClass(
        "w-full",
        "flex",
        "flex-col",
        "gap-4",
        "@[44rem]:grid",
        "@[44rem]:grid-flow-col",
        "@[44rem]:auto-cols-fr",
        "@[44rem]:items-start",
        "@[44rem]:gap-6",
      );
    });
  });
});
