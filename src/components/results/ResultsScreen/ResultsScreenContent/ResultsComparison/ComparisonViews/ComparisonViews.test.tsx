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
import { ComparisonQuestions } from "./ComparisonQuestions/ComparisonQuestions";
import { ComparisonResults } from "./ComparisonResults/ComparisonResults";
import { ComparisonViews } from "./ComparisonViews";
import {
  COMPARISON_VIEW_CONTENT,
  COMPARISON_VIEW_LABELS,
} from "./ComparisonViews.constants";

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

const queryQuestions = () => screen.queryByRole("list", { name: "Pytania" });

describe("<ComparisonViews />", () => {
  describe("given a comparison with one view: an orientation", () => {
    it("shows that view: the questions", () => {
      renderViews(orientationComparison);

      expect(queryQuestions()).toBeVisible();
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });

    it("draws no switch, and is no tab panel", () => {
      renderViews(orientationComparison);

      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    });
  });

  describe("given a comparison with no view", () => {
    it("draws nothing", () => {
      const { container } = renderViews({
        ...orientationComparison,
        views: [],
        view: undefined,
      });

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given a comparison with two views: a friend", () => {
    it("draws the switch as a tab list, the results first and chosen", () => {
      renderViews();

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

    it("shows the results in the panel of their tab: every module with the friend laid over it", () => {
      renderViews();

      const panel = screen.getByRole("tabpanel", { name: "Wyniki" });

      expect(panel).toHaveAttribute("id", "panel-compared-results");
      expect(panel).toContainElement(
        screen.getByRole("region", { name: "Tożsamość" }),
      );
      expect(screen.getAllByRole("region")).toHaveLength(
        moduleTaker.resolved.modules.length,
      );
      expect(
        screen.getAllByRole("img", { name: /porównanie z Znajomy/ }).length,
      ).toBeGreaterThan(0);
      expect(queryQuestions()).not.toBeInTheDocument();
    });

    it("draws a line under the switch that reaches the edges of the sheet", () => {
      renderViews();

      expect(screen.getByRole("tablist").nextElementSibling).toHaveClass(
        "-mx-(--results-panel-padding)",
        "border-t",
      );
    });

    it("says which view was chosen when the other tab is pressed", () => {
      const { onViewChange } = renderViews();

      fireEvent.click(screen.getByRole("tab", { name: "Pytania" }));

      expect(onViewChange).toHaveBeenCalledExactlyOnceWith(
        ComparisonView.Questions,
      );
    });

    it("shows the questions in the panel of their tab, in place of the modules", () => {
      renderViews({ ...friendComparison, view: ComparisonView.Questions });

      const panel = screen.getByRole("tabpanel", { name: "Pytania" });

      expect(panel).toHaveAttribute("id", "panel-compared-questions");
      expect(panel).toContainElement(queryQuestions());
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });
  });

  describe("the tables of the views", () => {
    it("name every view", () => {
      expect(Object.keys(COMPARISON_VIEW_LABELS).sort()).toEqual(
        Object.values(ComparisonView).sort(),
      );
    });

    it("draw every view: the results and the questions", () => {
      expect(COMPARISON_VIEW_CONTENT).toEqual({
        [ComparisonView.Results]: ComparisonResults,
        [ComparisonView.Questions]: ComparisonQuestions,
      });
    });
  });
});
