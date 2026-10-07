import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MATCH_BAND_COLORS } from "@/constants/results";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { ArchetypeEntry } from "../../Archetype.types";
import { ArchetypeRanking } from "./ArchetypeRanking";

const OWN_COLOR = "#123456";

const archetype = (name: string, match?: number): ArchetypeEntry => ({
  orientation: createOrientation(name.toLowerCase(), name, {
    color: OWN_COLOR,
  }),
  match,
});

const RANKING = [
  archetype("Alfa", 85),
  archetype("Beta", 70),
  archetype("Gamma", 50),
  archetype("Delta", 49),
];

const getRowNames = (): (string | null)[] =>
  screen.getAllByTestId("ranked-row-name").map((name) => name.textContent);

describe("<ArchetypeRanking />", () => {
  describe("given a ranking", () => {
    it("renders an ordered list with one ranked row per archetype, in the given order", () => {
      renderWithI18n(<ArchetypeRanking ranking={RANKING} />);

      const list = screen.getByRole("list");

      expect(list.tagName).toBe("OL");
      expect(within(list).getAllByRole("listitem")).toHaveLength(4);
      expect(getRowNames()).toEqual(["Alfa", "Beta", "Gamma", "Delta"]);
      expect(screen.getByRole("img", { name: "Beta: 70%" })).toBeVisible();
    });

    it("colours each bar by its own band, never by the archetype own colour", () => {
      const { container } = renderWithI18n(
        <ArchetypeRanking ranking={RANKING} />,
      );

      expect(
        screen
          .getAllByTestId("universal-axis-fill-start")
          .map((fill) => fill.style.getPropertyValue("--axis-color")),
      ).toEqual([
        MATCH_BAND_COLORS.match,
        MATCH_BAND_COLORS.partial,
        MATCH_BAND_COLORS.partial,
        MATCH_BAND_COLORS.none,
      ]);
      expect(container.innerHTML).not.toContain(OWN_COLOR);
    });

    it("never cuts the list", () => {
      renderWithI18n(
        <ArchetypeRanking
          ranking={Array.from({ length: 40 }, (_, index) =>
            archetype(`Typ ${index}`, index),
          )}
        />,
      );

      expect(getRowNames()).toHaveLength(40);
    });
  });

  describe("given a comparison", () => {
    it("passes each archetype its own value and leaves the others without an overlay", () => {
      renderWithI18n(
        <ArchetypeRanking
          ranking={RANKING}
          comparison={{
            orientation: { id: "ania", type: "person", name: "Ania" },
            values: { gamma: 90, unknown: 10 },
          }}
        />,
      );

      expect(
        screen.getByRole("img", { name: "Gamma: 50%, porównanie z Ania: 90%" }),
      ).toBeVisible();
      expect(screen.getByRole("img", { name: "Beta: 70%" })).toBeVisible();
      expect(
        screen.getAllByTestId("universal-axis-comparison-line"),
      ).toHaveLength(1);
    });
  });

  describe("given archetypes that share an id", () => {
    it("renders each of them", () => {
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});

      renderWithI18n(
        <ArchetypeRanking
          ranking={[archetype("Beta", 70), archetype("Beta", 60)]}
        />,
      );

      expect(getRowNames()).toEqual(["Beta", "Beta"]);
      expect(errors).not.toHaveBeenCalled();

      errors.mockRestore();
    });
  });

  describe("given an archetype without an orientation", () => {
    it("renders its row without a name", () => {
      renderWithI18n(
        <ArchetypeRanking
          ranking={[
            archetype("Beta", 70),
            { match: 30 } as unknown as ArchetypeEntry,
          ]}
        />,
      );

      expect(getRowNames()).toEqual(["Beta", ""]);
    });
  });

  describe("given an empty ranking", () => {
    it("renders an empty list", () => {
      renderWithI18n(<ArchetypeRanking ranking={[]} />);

      expect(screen.getByRole("list")).toBeEmptyDOMElement();
    });
  });
});
