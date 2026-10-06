import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { ArchetypeContent, ArchetypeView } from "../Archetype.types";
import { ArchetypeFoot } from "./ArchetypeFoot";

const CONTENT: ArchetypeContent = {
  isMatched: true,
  shortDescription: "Krótki opis.",
  fullDescription: "Pełny opis.",
  ranking: [
    { orientation: { id: "beta", name: "Beta", imageUrl: "beta.png" } },
    { orientation: { id: "gamma", name: "Gamma", imageUrl: "gamma.png" } },
  ],
  hasDescription: true,
  hasRanking: true,
};

const renderFoot = (
  content: Partial<ArchetypeContent> = {},
  openView: ArchetypeView = "summary",
) => {
  const onToggle = vi.fn();

  renderWithI18n(
    <ArchetypeFoot
      openView={openView}
      content={{ ...CONTENT, ...content }}
      onToggle={onToggle}
    />,
  );

  return onToggle;
};

const getControl = (name: string): HTMLElement =>
  screen.getByRole("button", { name });

describe("<ArchetypeFoot />", () => {
  describe("given both a description and a ranking to open", () => {
    it("renders the description control first and the ranking control second", () => {
      renderFoot();

      expect(
        screen
          .getAllByRole("button")
          .map((control) => control.getAttribute("aria-label")),
      ).toEqual(["Pełny opis", "Ranking"]);
    });

    it("says that neither view is open in the summary", () => {
      renderFoot();

      expect(getControl("Pełny opis")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "false");
    });

    it("draws a line between the two controls", () => {
      renderFoot();

      expect(getControl("Ranking")).toHaveClass("border-l");
      expect(getControl("Pełny opis")).not.toHaveClass("border-l");
    });

    it("previews the ranking on its control", () => {
      renderFoot();

      expect(
        getControl("Ranking").querySelectorAll(
          '[data-testid="archetype-ranking-preview-image"]',
        ),
      ).toHaveLength(2);
    });
  });

  describe("given the full description open", () => {
    it("marks the description control as open", () => {
      renderFoot({}, "description");

      expect(getControl("Pełny opis")).toHaveAttribute("aria-expanded", "true");
      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("given the ranking open", () => {
    it("marks the ranking control as open and turns its chevron up", () => {
      renderFoot({}, "ranking");

      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "true");
      expect(getControl("Pełny opis")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(getControl("Ranking").querySelector("img.rotate-180")).not.toBe(
        null,
      );
    });

    it("keeps the chevron down while the ranking is closed", () => {
      renderFoot();

      expect(getControl("Ranking").querySelector("img.rotate-180")).toBe(null);
    });
  });

  describe("when a control is pressed", () => {
    it("asks to toggle its own view", () => {
      const onToggle = renderFoot();

      fireEvent.click(getControl("Pełny opis"));
      expect(onToggle).toHaveBeenLastCalledWith("description");

      fireEvent.click(getControl("Ranking"));
      expect(onToggle).toHaveBeenLastCalledWith("ranking");
      expect(onToggle).toHaveBeenCalledTimes(2);
    });
  });

  describe("given no description to open", () => {
    it("renders only the ranking control, with no line beside it", () => {
      renderFoot({ hasDescription: false });

      expect(screen.getAllByRole("button")).toHaveLength(1);
      expect(getControl("Ranking")).not.toHaveClass("border-l");
    });
  });

  describe("given no ranking to open", () => {
    it("renders only the description control", () => {
      renderFoot({ hasRanking: false });

      expect(screen.getAllByRole("button")).toHaveLength(1);
      expect(getControl("Pełny opis")).toBeVisible();
    });
  });

  describe("given neither", () => {
    it("renders nothing", () => {
      renderFoot({ hasDescription: false, hasRanking: false });

      expect(screen.queryByTestId("archetype-foot")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
