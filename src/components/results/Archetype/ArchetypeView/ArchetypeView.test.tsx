import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { ArchetypeContent } from "../Archetype.types";
import { ArchetypeView } from "./ArchetypeView";

const CONTENT: ArchetypeContent = {
  isMatched: true,
  shortDescription: "Krótki opis.",
  fullDescription: "Pełny opis.",
  ranking: [
    { orientation: { id: "beta", type: "ideology", name: "Beta" }, match: 70 },
    {
      orientation: { id: "gamma", type: "ideology", name: "Gamma" },
      match: 40,
    },
  ],
  hasDescription: true,
  hasRanking: true,
};

const getRowNames = (): (string | null)[] =>
  screen.queryAllByTestId("ranked-row-name").map((name) => name.textContent);

describe("<ArchetypeView />", () => {
  describe("given the summary", () => {
    it("renders the short description under a divider", () => {
      renderWithI18n(<ArchetypeView openView="summary" content={CONTENT} />);

      expect(screen.getByRole("separator")).toBeInTheDocument();
      expect(screen.getByTestId("archetype-description").textContent).toBe(
        "Krótki opis.",
      );
      expect(getRowNames()).toEqual([]);
    });

    it("renders nothing, not even the divider, without a short description", () => {
      const { container } = renderWithI18n(
        <ArchetypeView
          openView="summary"
          content={{ ...CONTENT, shortDescription: "" }}
        />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given the full description", () => {
    it("renders it in place of the short one", () => {
      renderWithI18n(
        <ArchetypeView openView="description" content={CONTENT} />,
      );

      expect(screen.getByRole("separator")).toBeInTheDocument();
      expect(screen.getByTestId("archetype-description").textContent).toBe(
        "Pełny opis.",
      );
      expect(screen.queryByText("Krótki opis.")).not.toBeInTheDocument();
    });
  });

  describe("given the ranking", () => {
    it("renders the ranking and no description", () => {
      renderWithI18n(<ArchetypeView openView="ranking" content={CONTENT} />);

      expect(screen.getByRole("separator")).toBeInTheDocument();
      expect(getRowNames()).toEqual(["Beta", "Gamma"]);
      expect(
        screen.queryByTestId("archetype-description"),
      ).not.toBeInTheDocument();
    });

    it("passes the comparison to the rows", () => {
      renderWithI18n(
        <ArchetypeView
          openView="ranking"
          content={CONTENT}
          comparison={{
            orientation: { id: "ania", type: "person", name: "Ania" },
            values: { gamma: 90 },
          }}
        />,
      );

      expect(
        screen.getByRole("img", { name: "Gamma: 40%, porównanie z Ania: 90%" }),
      ).toBeVisible();
    });
  });
});
