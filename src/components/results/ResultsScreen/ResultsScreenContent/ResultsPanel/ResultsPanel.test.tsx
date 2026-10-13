import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResultsPanel } from "./ResultsPanel";
import type { ResultsPanelProps } from "./ResultsPanel.types";

const renderPanel = (props: Partial<ResultsPanelProps> = {}) =>
  render(
    <>
      <button type="button" id="tab-results">
        Twoje wyniki
      </button>
      <button type="button" id="tab-comparison">
        Tryb porównania
      </button>
      <ResultsPanel tab="results" isActive hasTabs {...props}>
        <p>Treść zakładki</p>
      </ResultsPanel>
    </>,
  );

describe("<ResultsPanel />", () => {
  describe("given the panel of the active tab", () => {
    it("is the tab panel of its tab, named by that tab, with its content", () => {
      renderPanel();

      const panel = screen.getByRole("tabpanel", { name: "Twoje wyniki" });

      expect(panel).toHaveAttribute("id", "panel-results");
      expect(panel).toHaveAttribute("aria-labelledby", "tab-results");
      expect(panel).toContainElement(screen.getByText("Treść zakładki"));
      expect(panel).toBeVisible();
    });

    it("draws the line that closes the tabs above it", () => {
      renderPanel();

      expect(screen.getByRole("tabpanel")).toHaveClass(
        "border-t",
        "border-gi-dark-ash",
      );
    });

    it("takes the identity of the tab it is given", () => {
      renderPanel({ tab: "comparison" });

      expect(
        screen.getByRole("tabpanel", { name: "Tryb porównania" }),
      ).toHaveAttribute("id", "panel-comparison");
    });
  });

  describe("given the panel of the other tab", () => {
    it("stays in the page, hidden", () => {
      renderPanel({ isActive: false });

      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
      expect(screen.getByText("Treść zakładki")).toBeInTheDocument();
      expect(screen.getByText("Treść zakładki")).not.toBeVisible();
    });
  });

  describe("given a result with no tabs", () => {
    it("is no tab panel, and points at no tab", () => {
      renderPanel({ hasTabs: false });

      const panel = screen.getByText("Treść zakładki").parentElement;

      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
      expect(panel).not.toHaveAttribute("id");
      expect(panel).not.toHaveAttribute("aria-labelledby");
      expect(panel).not.toHaveClass("border-t");
      expect(panel).toBeVisible();
    });
  });
});
