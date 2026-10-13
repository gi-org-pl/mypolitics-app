import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import {
  friendComparison,
  moduleTaker,
  orientationComparison,
} from "../../ResultsComparison.fixtures";
import type { ComparisonViewProps } from "../../ResultsComparison.types";
import { ComparisonResults } from "./ComparisonResults";

const renderResults = (props: Partial<ComparisonViewProps> = {}) =>
  renderWithI18n(
    <ComparisonResults
      {...moduleTaker}
      comparison={friendComparison}
      {...props}
    />,
  );

const getRegionNames = () =>
  screen.getAllByRole("region").map((region) => region.ariaLabel);

const getMarks = () => screen.queryAllByRole("img", { name: /porównanie z/ });

describe("<ComparisonResults />", () => {
  describe("given a comparison with a friend", () => {
    it("draws every module of the taker, laid out as on their results", () => {
      renderResults();

      expect(screen.getAllByRole("region")).toHaveLength(
        moduleTaker.resolved.modules.length,
      );
      expect(getRegionNames()).toEqual(
        expect.arrayContaining(["Tożsamość", "Ideologie", "Partie", "Cechy"]),
      );
      expect(
        screen
          .getByRole("region", { name: "Tożsamość" })
          .closest("[data-column]"),
      ).toHaveAttribute("data-column", "end");
    });

    it("lays the friend over the bars, named as the friend", () => {
      renderResults();

      expect(getMarks().length).toBeGreaterThan(0);

      for (const mark of getMarks()) {
        expect(mark).toHaveAccessibleName(/porównanie z Znajomy: \d+%$/);
      }
    });

    it("hands each module what the friend scored, not what the taker did", () => {
      renderResults();

      const parties = within(screen.getByRole("region", { name: "Partie" }));

      expect(
        parties.getByRole("img", { name: "porównanie z Znajomy: 75%" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", {
          name: "Ekologia: 100%, porównanie z Znajomy: 100%",
        }),
      ).toBeInTheDocument();
    });

    it("draws no header: it stays the taker's, above the tabs", () => {
      renderResults();

      expect(
        screen.queryByRole("heading", { level: 1 }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a module the result of the taker does not draw", () => {
    it("does not draw it for the friend either", () => {
      renderResults({
        resolved: {
          ...moduleTaker.resolved,
          modules: moduleTaker.resolved.modules.filter(
            ({ type }) => type !== "horizontal_bar",
          ),
        },
      });

      expect(
        screen.queryByRole("region", { name: "Partie" }),
      ).not.toBeInTheDocument();
      expect(friendComparison.modules?.map(({ type }) => type)).toContain(
        "horizontal_bar",
      );
    });
  });

  describe("given a module the result of the friend does not draw", () => {
    it("draws it for the taker alone", () => {
      renderResults({
        comparison: {
          ...friendComparison,
          modules: friendComparison.modules?.filter(
            ({ type }) => type !== "single_axis",
          ),
        },
      });

      expect(
        screen.getByRole("img", { name: "Ekologia: 100%" }),
      ).toBeInTheDocument();
    });
  });

  describe("given an other side with no result", () => {
    it("draws the modules with nothing laid over them", () => {
      renderResults({ comparison: orientationComparison });

      expect(screen.getAllByRole("region")).toHaveLength(
        moduleTaker.resolved.modules.length,
      );
      expect(getMarks()).toHaveLength(0);
    });
  });
});
