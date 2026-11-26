import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { ResultsScreenContent } from "./ResultsScreenContent";
import {
  candidateResults,
  identityResults,
  LONG_CORNER_NAME,
  longCornerNameResults,
  noMatchResults,
  RESULT_ID,
} from "./ResultsScreenContent.fixtures";
import type { ResultsScreenContentProps } from "./ResultsScreenContent.types";

const renderContent = (props: ResultsScreenContentProps = identityResults) =>
  renderWithI18n(<ResultsScreenContent {...props} />);

const getTab = (name: string) => screen.getByRole("tab", { name });

describe("<ResultsScreenContent />", () => {
  describe("given a result of the identity quiz", () => {
    it("names the leader in the header, as the first heading of the page", () => {
      renderContent();

      expect(
        screen.getByRole("heading", { level: 1, name: "Zielony postępowiec" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("heading")[0]).toHaveTextContent(
        "Zielony postępowiec",
      );
      expect(screen.getByText("100% pewności")).toBeInTheDocument();
    });

    it("draws the two tabs as a tab list, with the results selected", () => {
      renderContent();

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(getTab("Twoje wyniki")).toHaveAttribute("aria-selected", "true");
      expect(getTab("Tryb porównania")).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("draws each module of the list as a region named by its title, in the panel of the results", () => {
      renderContent();

      const panel = within(
        screen.getByRole("tabpanel", { name: "Twoje wyniki" }),
      );

      for (const name of ["Ideologie", "Partie", "Tożsamość"]) {
        expect(panel.getByRole("region", { name })).toBeInTheDocument();
      }

      expect(panel.getAllByRole("region")).toHaveLength(4);
    });

    it("stands the modules in two columns, in the order of the spec", () => {
      renderContent();

      const getColumnRegions = (column: string) =>
        [...document.querySelectorAll(`[data-column="${column}"] section`)].map(
          (region) => region.getAttribute("aria-label"),
        );

      expect(getColumnRegions("start")).toEqual(["Ideologie", "Partie"]);
      expect(getColumnRegions("end")).toEqual(["Tożsamość", "Lewicowy"]);
    });

    it("shows the name of the quiz under the modules", () => {
      const { container } = renderContent();
      const quizName = screen.getByText("Quiz Tożsamościowy");

      expect(quizName).toBeVisible();
      expect(container.firstElementChild?.lastElementChild).toContainElement(
        quizName,
      );
    });

    it("keeps the comparison out of sight while the results are shown", () => {
      renderContent();

      expect(screen.getByText(RESULT_ID)).not.toBeVisible();
      expect(
        screen.queryByRole("tab", { name: "Ze znajomym" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a taker who stands in another corner of the map", () => {
    it("names the map by that corner, in full, however long its name is", () => {
      renderContent(longCornerNameResults);

      expect(
        screen.getByRole("region", { name: LONG_CORNER_NAME }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("region", { name: "Lewicowy" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("when the comparison tab is chosen", () => {
    it("selects the tab and shows the mode selector in its panel, with the identifier of the result to hand over", () => {
      renderContent();

      fireEvent.click(getTab("Tryb porównania"));

      const panel = within(
        screen.getByRole("tabpanel", { name: "Tryb porównania" }),
      );

      expect(getTab("Tryb porównania")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(panel.getByRole("tab", { name: "Ze znajomym" })).toBeVisible();
      expect(panel.getByRole("tab", { name: "Z orientacją" })).toBeVisible();
      expect(panel.getByText(RESULT_ID)).toBeVisible();
    });

    it("compares the result that is shown: with the quiz, the answers and the modules of the taker", () => {
      renderContent();

      fireEvent.click(getTab("Tryb porównania"));
      fireEvent.click(screen.getByRole("tab", { name: "Z orientacją" }));
      fireEvent.click(
        screen
          .getAllByRole("button", { name: /./ })
          .find((button) => button.closest("li")) as HTMLElement,
      );

      expect(
        within(screen.getByRole("region", { name: "Zgodność" })).getByRole(
          "img",
          { name: /: \d+%$/ },
        ),
      ).toBeInTheDocument();
    });

    it("keeps a running comparison while the taker goes to their results and back", () => {
      renderContent();

      fireEvent.click(getTab("Tryb porównania"));
      fireEvent.click(screen.getByRole("tab", { name: "Z orientacją" }));
      fireEvent.click(
        screen
          .getAllByRole("button", { name: /./ })
          .find((button) => button.closest("li")) as HTMLElement,
      );
      fireEvent.click(getTab("Twoje wyniki"));

      expect(
        screen.queryByRole("region", { name: "Zgodność" }),
      ).not.toBeInTheDocument();

      fireEvent.click(getTab("Tryb porównania"));

      expect(screen.getByRole("region", { name: "Zgodność" })).toBeVisible();
      expect(
        screen.queryByRole("tab", { name: "Ze znajomym" }),
      ).not.toBeInTheDocument();
    });

    it("hides the modules, and keeps the header and the name of the quiz", () => {
      renderContent();

      fireEvent.click(getTab("Tryb porównania"));

      expect(screen.queryByRole("region")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 1, name: "Zielony postępowiec" }),
      ).toBeVisible();
      expect(screen.getByText("Quiz Tożsamościowy")).toBeVisible();
    });

    it("shows the modules again, as they were left, when the results tab is chosen", () => {
      renderContent(candidateResults);

      const getDescriptionControl = () =>
        within(
          screen.getByRole("region", { name: "Prezydent", hidden: true }),
        ).getAllByRole("button", { hidden: true })[1];
      const isExpanded = () =>
        getDescriptionControl().getAttribute("aria-expanded");
      const before = isExpanded();

      fireEvent.click(getDescriptionControl());

      const after = isExpanded();

      fireEvent.click(getTab("Tryb porównania"));
      fireEvent.click(getTab("Twoje wyniki"));

      expect(after).not.toBe(before);
      expect(isExpanded()).toBe(after);
      expect(screen.getByRole("region", { name: "Prezydent" })).toBeVisible();
    });
  });

  describe("given a result with no match", () => {
    it("shows no match in the header, and still draws the modules that can be drawn", () => {
      renderContent(noMatchResults);

      expect(
        screen.getByRole("heading", { level: 1, name: "Brak dopasowania" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: "Ideologie" }),
      ).toBeInTheDocument();
      // The parties are tied to the leader, and nobody leads.
      expect(
        screen.queryByRole("region", { name: "Partie" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a quiz with no header record", () => {
    const props: ResultsScreenContentProps = {
      ...identityResults,
      resolved: { ...identityResults.resolved, header: undefined },
    };

    it("draws no header and no tabs, and shows the modules", () => {
      renderContent(props);

      expect(
        screen.queryByRole("heading", { level: 1 }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
      expect(screen.getByRole("region", { name: "Ideologie" })).toBeVisible();
      expect(screen.getByText(RESULT_ID)).not.toBeVisible();
    });
  });

  describe("given a quiz with no name", () => {
    it("draws no row for the name", () => {
      const { container } = renderContent({
        ...identityResults,
        survey: { ...identityResults.survey, name: undefined },
      });

      expect(screen.queryByText("Quiz Tożsamościowy")).not.toBeInTheDocument();
      expect(container.firstElementChild?.lastElementChild).toHaveAttribute(
        "hidden",
      );
    });
  });

  describe("the sheet", () => {
    it("is a container that fills the width it is given", () => {
      const { container } = renderContent();

      expect(container.firstElementChild).toHaveClass("@container", "w-full");
    });
  });
});
