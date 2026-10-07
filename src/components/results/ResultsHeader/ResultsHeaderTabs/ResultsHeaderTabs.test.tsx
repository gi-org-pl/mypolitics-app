import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { ResultsTab } from "../ResultsHeader.types";
import { ResultsHeaderTabs } from "./ResultsHeaderTabs";

const renderTabs = (activeTab: ResultsTab = "results") => {
  const onTabChange = vi.fn();
  renderWithI18n(
    <ResultsHeaderTabs activeTab={activeTab} onTabChange={onTabChange} />,
  );

  return { onTabChange };
};

describe("<ResultsHeaderTabs />", () => {
  describe("when rendered", () => {
    it("renders a tab list with both tabs, results first", () => {
      renderTabs();

      const tabs = screen.getAllByRole("tab");

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveTextContent("Twoje wyniki");
      expect(tabs[1]).toHaveTextContent("Tryb porównania");
    });
  });

  describe("given the active tab", () => {
    it("marks it as selected", () => {
      renderTabs("comparison");

      expect(screen.getByRole("tab", { name: "Twoje wyniki" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(
        screen.getByRole("tab", { name: "Tryb porównania" }),
      ).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("when the other tab is pressed", () => {
    it("calls onTabChange with that tab", () => {
      const { onTabChange } = renderTabs();

      fireEvent.click(screen.getByRole("tab", { name: "Tryb porównania" }));

      expect(onTabChange).toHaveBeenCalledTimes(1);
      expect(onTabChange).toHaveBeenCalledWith("comparison");
    });

    it("does not switch until activeTab changes", () => {
      renderTabs();

      fireEvent.click(screen.getByRole("tab", { name: "Tryb porównania" }));

      expect(screen.getByRole("tab", { name: "Twoje wyniki" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  describe("when an arrow key is pressed on the active tab", () => {
    it("moves focus to the other tab and calls onTabChange", () => {
      const { onTabChange } = renderTabs("comparison");

      const resultsTab = screen.getByRole("tab", { name: "Twoje wyniki" });
      const comparisonTab = screen.getByRole("tab", {
        name: "Tryb porównania",
      });

      expect(comparisonTab).toHaveAttribute("tabindex", "0");
      expect(resultsTab).toHaveAttribute("tabindex", "-1");

      comparisonTab.focus();
      fireEvent.keyDown(comparisonTab, { key: "ArrowLeft" });

      expect(onTabChange).toHaveBeenCalledWith("results");
      expect(resultsTab).toHaveFocus();
    });
  });
});
