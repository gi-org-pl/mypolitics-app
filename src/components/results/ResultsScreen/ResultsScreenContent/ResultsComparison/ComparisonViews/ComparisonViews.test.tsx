import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import {
  friendComparison,
  moduleTaker,
  orientationComparison,
} from "../ResultsComparison.fixtures";
import {
  type ComparingState,
  ComparisonView,
} from "../ResultsComparison.types";
import { ComparisonViews } from "./ComparisonViews";
import {
  COMPARISON_VIEW_CONTENT,
  COMPARISON_VIEW_LABELS,
} from "./ComparisonViews.constants";

// A comparison with both views on its switch, as it will be once the list of
// questions is drawn.
const twoViews: ComparingState = {
  ...friendComparison,
  views: [ComparisonView.Results, ComparisonView.Questions],
};

const renderViews = (comparison: ComparingState = friendComparison) => {
  const onViewChange = vi.fn();
  const view = renderWithI18n(
    <ComparisonViews
      {...moduleTaker}
      comparison={comparison}
      onViewChange={onViewChange}
    />,
  );

  return { ...view, onViewChange };
};

describe("<ComparisonViews />", () => {
  describe("given a comparison with one view", () => {
    it("shows that view", () => {
      renderViews();

      expect(screen.getAllByRole("region")).toHaveLength(
        moduleTaker.resolved.modules.length,
      );
      expect(
        screen.getAllByRole("img", { name: /porównanie z Znajomy/ }).length,
      ).toBeGreaterThan(0);
    });

    it("draws no switch, and is no tab panel", () => {
      renderViews();

      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    });
  });

  describe("given a comparison with no view", () => {
    it("draws nothing", () => {
      const { container } = renderViews(orientationComparison);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given a comparison with two views", () => {
    it("draws the switch as a tab list, the results first and chosen", () => {
      renderViews(twoViews);

      expect(
        screen.getByRole("tablist", { name: "Widok porównania" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
        "Wyniki",
        "Pytania",
      ]);
      expect(screen.getByRole("tab", { name: "Wyniki" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("shows the chosen view in the panel of its tab", () => {
      renderViews(twoViews);

      const panel = screen.getByRole("tabpanel", { name: "Wyniki" });

      expect(panel).toHaveAttribute("id", "panel-compared-results");
      expect(panel).toContainElement(
        screen.getByRole("region", { name: "Tożsamość" }),
      );
    });

    it("draws a line under the switch that reaches the edges of the sheet", () => {
      renderViews(twoViews);

      expect(screen.getByRole("tablist").nextElementSibling).toHaveClass(
        "-mx-(--results-panel-padding)",
        "border-t",
      );
    });

    it("says which view was chosen when the other tab is pressed", () => {
      const { onViewChange } = renderViews(twoViews);

      fireEvent.click(screen.getByRole("tab", { name: "Pytania" }));

      expect(onViewChange).toHaveBeenCalledExactlyOnceWith(
        ComparisonView.Questions,
      );
    });

    it("shows an empty panel for a view that has nothing to draw yet", () => {
      renderViews({ ...twoViews, view: ComparisonView.Questions });

      expect(
        screen.getByRole("tabpanel", { name: "Pytania" }),
      ).toBeEmptyDOMElement();
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });
  });

  describe("the tables of the views", () => {
    it("name every view", () => {
      expect(Object.keys(COMPARISON_VIEW_LABELS).sort()).toEqual(
        Object.values(ComparisonView).sort(),
      );
    });

    it("draw the results, and nothing for the questions yet", () => {
      expect(Object.keys(COMPARISON_VIEW_CONTENT)).toEqual([
        ComparisonView.Results,
      ]);
    });
  });
});
