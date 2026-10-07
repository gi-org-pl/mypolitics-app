import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MATCH_BAND_COLORS } from "@/constants/results";
import type { Orientation } from "@/types/orientation";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { Archetype } from "./Archetype";
import type { ArchetypeEntry, ArchetypeProps } from "./Archetype.types";

const OWN_COLOR = "#123456";
const SHORT = "Krótki opis.";
const FULL = "Pierwszy akapit.\n\nDrugi akapit.";

const archetype = (
  name: string,
  match?: number,
  orientation: Partial<Orientation> = {},
): ArchetypeEntry => ({
  orientation: {
    id: name.toLowerCase(),
    type: "identity",
    name,
    color: OWN_COLOR,
    imageUrl: `${name.toLowerCase()}.png`,
    ...orientation,
  },
  match,
});

const LEADER = archetype("Alfa", 85, {
  description: SHORT,
  fullDescription: FULL,
});

const ARCHETYPES: ArchetypeEntry[] = [
  archetype("Delta", 40),
  LEADER,
  archetype("Echo", 10),
  archetype("Beta", 70),
  archetype("Gamma", 55),
];

const NO_MATCH: ArchetypeEntry[] = [
  archetype("Delta", 20),
  archetype("Alfa", 45, { description: SHORT, fullDescription: FULL }),
  archetype("Beta", 30),
];

const FRIEND = createOrientation("ania", "Ania", { type: "person" });

const renderArchetype = (props: Partial<ArchetypeProps> = {}) =>
  renderWithI18n(
    <Archetype title="Tożsamość" archetypes={ARCHETYPES} {...props} />,
  );

const getControl = (name: string): HTMLElement =>
  screen.getByRole("button", { name });

const queryControl = (name: string): HTMLElement | null =>
  screen.queryByRole("button", { name });

const press = (name: string) => fireEvent.click(getControl(name));

const getRowNames = (): (string | null)[] =>
  screen.queryAllByTestId("ranked-row-name").map((name) => name.textContent);

const getFillColors = (): string[] =>
  screen
    .getAllByTestId("universal-axis-fill-start")
    .map((fill) => fill.style.getPropertyValue("--axis-color"));

const getPreviewSources = (): (string | null | undefined)[] =>
  screen
    .getAllByTestId("archetype-ranking-preview-image")
    .map((image) => image.querySelector("img")?.getAttribute("src"));

const withI18n = (props: Partial<ArchetypeProps>) => (
  <I18nProvider i18n={i18n}>
    <Archetype title="Tożsamość" archetypes={ARCHETYPES} {...props} />
  </I18nProvider>
);

const getDescription = (): HTMLElement =>
  screen.getByTestId("archetype-description");

describe("<Archetype />", () => {
  describe("given a leader that is a match", () => {
    it("renders its name as a heading and its bar in the match colour", () => {
      renderArchetype();

      expect(
        screen.getByRole("heading", { level: 3, name: "Alfa" }),
      ).toBeVisible();
      expect(screen.getByRole("img", { name: "Alfa: 85%" })).toBeVisible();
      expect(getFillColors()).toEqual([MATCH_BAND_COLORS.match]);
    });

    it("renders its image on the cap, with no marker and no labels", () => {
      renderArchetype();

      expect(
        screen.getByTestId("universal-axis-cap-start").querySelector("img"),
      ).toHaveAttribute("src", "alfa.png");
      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-labels"),
      ).not.toBeInTheDocument();
    });

    it("renders the short description", () => {
      renderArchetype();

      expect(getDescription()).toHaveTextContent(SHORT);
      expect(screen.queryByText(/Drugi akapit/)).not.toBeInTheDocument();
      expect(getRowNames()).toEqual([]);
    });

    it("counts exactly 80 as a match", () => {
      renderArchetype({ archetypes: [archetype("Alfa", 80)] });

      expect(getFillColors()).toEqual([MATCH_BAND_COLORS.match]);
    });
  });

  describe("given a leader that is a partial match", () => {
    it("renders its bar in the partial colour", () => {
      renderArchetype({
        archetypes: [archetype("Alfa", 50), archetype("Beta", 79.9)],
      });

      expect(screen.getByRole("heading", { name: "Beta" })).toBeVisible();
      expect(getFillColors()).toEqual([MATCH_BAND_COLORS.partial]);
    });
  });

  describe("given a leader that is no match", () => {
    it("renders the no match wording and an empty track", () => {
      renderArchetype({ archetypes: NO_MATCH });

      expect(
        screen.getByRole("heading", { level: 3, name: "Brak dopasowania" }),
      ).toBeVisible();
      expect(screen.queryByText("Alfa")).not.toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Brak wyniku" })).toBeVisible();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-cap-start"),
      ).not.toBeInTheDocument();
    });

    it("renders no description and no description control", () => {
      renderArchetype({ archetypes: NO_MATCH });

      expect(
        screen.queryByTestId("archetype-description"),
      ).not.toBeInTheDocument();
      expect(queryControl("Pełny opis")).not.toBeInTheDocument();
      expect(getControl("Ranking")).toBeVisible();
    });

    it("includes the leader in the ranking", () => {
      renderArchetype({ archetypes: NO_MATCH });

      press("Ranking");

      expect(getRowNames()).toEqual(["Alfa", "Beta", "Delta"]);
      expect(getFillColors()).toEqual([
        MATCH_BAND_COLORS.none,
        MATCH_BAND_COLORS.none,
        MATCH_BAND_COLORS.none,
      ]);
    });

    it("includes the leader in the preview of the ranking control", () => {
      renderArchetype({ archetypes: NO_MATCH });

      expect(getPreviewSources()).toEqual([
        "alfa.png",
        "beta.png",
        "delta.png",
      ]);
    });

    it("does not draw the comparison on the unnamed leader", () => {
      renderArchetype({
        archetypes: NO_MATCH,
        comparison: { orientation: FRIEND, values: { alfa: 60 } },
      });

      expect(
        screen.queryByTestId("universal-axis-comparison-line"),
      ).not.toBeInTheDocument();

      press("Ranking");

      expect(
        screen.getByRole("img", { name: "Alfa: 45%, porównanie z Ania: 60%" }),
      ).toBeVisible();
    });
  });

  describe("when the description control is pressed", () => {
    it("renders the full description and marks the control active", () => {
      renderArchetype();

      press("Pełny opis");

      expect(getDescription().textContent).toBe(FULL);
      expect(screen.queryByText(SHORT)).not.toBeInTheDocument();
      expect(getControl("Pełny opis")).toHaveAttribute("aria-expanded", "true");
      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "false");
    });

    it("returns to the summary when pressed again", () => {
      renderArchetype();

      press("Pełny opis");
      press("Pełny opis");

      expect(getDescription().textContent).toBe(SHORT);
      expect(getControl("Pełny opis")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });

  describe("when the ranking control is pressed", () => {
    it("renders every other archetype as a ranked row, highest first", () => {
      renderArchetype();

      press("Ranking");

      expect(getRowNames()).toEqual(["Beta", "Gamma", "Delta", "Echo"]);
      expect(
        within(screen.getByRole("list")).getAllByRole("listitem"),
      ).toHaveLength(4);
      expect(screen.getByRole("list").tagName).toBe("OL");
      expect(
        screen.queryByTestId("archetype-description"),
      ).not.toBeInTheDocument();
      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "true");
    });

    it("colours each bar by its own band, through the overridden orientation colour", () => {
      renderArchetype();

      press("Ranking");

      expect(getFillColors()).toEqual([
        MATCH_BAND_COLORS.match,
        MATCH_BAND_COLORS.partial,
        MATCH_BAND_COLORS.partial,
        MATCH_BAND_COLORS.none,
        MATCH_BAND_COLORS.none,
      ]);
    });

    it("does not pass the archetype own colour to any bar", () => {
      const { container } = renderArchetype();

      press("Ranking");

      expect(container.innerHTML).not.toContain(OWN_COLOR);
    });

    it("never cuts the ranking", () => {
      const many = Array.from({ length: 30 }, (_, index) =>
        archetype(`Typ ${index}`, index),
      );

      renderArchetype({ archetypes: [LEADER, ...many] });
      press("Ranking");

      expect(getRowNames()).toHaveLength(30);
    });

    it("returns to the summary when pressed again", () => {
      renderArchetype();

      press("Ranking");
      press("Ranking");

      expect(getRowNames()).toEqual([]);
      expect(getDescription().textContent).toBe(SHORT);
      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("when one view is open and the other control is pressed", () => {
    it("switches straight to the other view", () => {
      renderArchetype();

      press("Pełny opis");
      press("Ranking");

      expect(getRowNames()).toHaveLength(4);
      expect(
        screen.queryByTestId("archetype-description"),
      ).not.toBeInTheDocument();
      expect(getControl("Pełny opis")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "true");

      press("Pełny opis");

      expect(getRowNames()).toEqual([]);
      expect(getDescription().textContent).toBe(FULL);
      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("given the ranking control", () => {
    it("previews the first few images from the ranking and that there are more", () => {
      renderArchetype();

      expect(getPreviewSources()).toEqual([
        "beta.png",
        "gamma.png",
        "delta.png",
      ]);
      expect(
        screen.getByTestId("archetype-ranking-preview-more"),
      ).toBeVisible();
    });

    it("leaves an archetype without an image out of the preview", () => {
      renderArchetype({
        archetypes: [
          LEADER,
          archetype("Beta", 70, { imageUrl: undefined }),
          archetype("Gamma", 55),
        ],
      });

      expect(getPreviewSources()).toEqual(["gamma.png"]);
      expect(
        screen.getByTestId("archetype-ranking-preview-more"),
      ).toBeVisible();
    });

    it("shows no more sign when every archetype is previewed", () => {
      renderArchetype({ archetypes: [LEADER, archetype("Beta", 70)] });

      expect(
        screen.getAllByTestId("archetype-ranking-preview-image"),
      ).toHaveLength(1);
      expect(
        screen.queryByTestId("archetype-ranking-preview-more"),
      ).not.toBeInTheDocument();
    });

    it("renders no preview when no archetype has an image", () => {
      renderArchetype({
        archetypes: [LEADER, archetype("Beta", 70, { imageUrl: undefined })],
      });

      expect(
        screen.queryByTestId("archetype-ranking-preview"),
      ).not.toBeInTheDocument();
      expect(getControl("Ranking")).toBeVisible();
    });

    it("draws the cap of an archetype without an image with colour only", () => {
      renderArchetype({
        archetypes: [archetype("Alfa", 85, { imageUrl: undefined })],
      });

      const cap = screen.getByTestId("universal-axis-cap-start");

      expect(cap.querySelector("img")).not.toBeInTheDocument();
      expect(cap.style.getPropertyValue("--axis-color")).toBe(
        MATCH_BAND_COLORS.match,
      );
    });
  });

  describe("given the orientation has a description and a full description", () => {
    const described: ArchetypeEntry = {
      orientation: createOrientation("alfa", "Alfa", {
        description: SHORT,
        fullDescription: FULL,
      }),
      match: 85,
    };

    it("shows the description in the summary", () => {
      renderArchetype({ archetypes: [described] });

      expect(getDescription().textContent).toBe(SHORT);
    });

    it("opens the full description from the description control", () => {
      renderArchetype({ archetypes: [described] });

      press("Pełny opis");

      expect(getDescription().textContent).toBe(FULL);
      expect(getControl("Pełny opis")).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("given a leader without a full description", () => {
    it("renders no description control", () => {
      renderArchetype({
        archetypes: [
          archetype("Alfa", 85, { description: SHORT }),
          archetype("Beta", 70, { fullDescription: FULL }),
        ],
      });

      expect(queryControl("Pełny opis")).not.toBeInTheDocument();
      expect(getDescription().textContent).toBe(SHORT);
      expect(getControl("Ranking")).toBeVisible();
    });
  });

  describe("given a full description identical to the short one", () => {
    it("renders no description control", () => {
      renderArchetype({
        archetypes: [
          archetype("Alfa", 85, {
            description: `  ${SHORT}\n`,
            fullDescription: SHORT,
          }),
        ],
      });

      expect(queryControl("Pełny opis")).not.toBeInTheDocument();
      expect(getDescription().textContent).toBe(SHORT);
    });
  });

  describe("given only a full description", () => {
    it("renders an empty summary and a description control", () => {
      renderArchetype({
        archetypes: [archetype("Alfa", 85, { fullDescription: FULL })],
      });

      expect(
        screen.queryByTestId("archetype-description"),
      ).not.toBeInTheDocument();

      press("Pełny opis");

      expect(getDescription().textContent).toBe(FULL);
    });
  });

  describe("given a description that is only whitespace", () => {
    it("treats it as missing", () => {
      renderArchetype({
        archetypes: [
          archetype("Alfa", 85, {
            description: " \n\t ",
            fullDescription: "   ",
          }),
        ],
      });

      expect(
        screen.queryByTestId("archetype-description"),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("archetype-foot")).not.toBeInTheDocument();
    });
  });

  describe("given one archetype", () => {
    it("renders no ranking control", () => {
      renderArchetype({ archetypes: [LEADER] });

      expect(queryControl("Ranking")).not.toBeInTheDocument();
      expect(getControl("Pełny opis")).toBeVisible();
    });
  });

  describe("given neither control applies", () => {
    it("renders no foot", () => {
      renderArchetype({
        archetypes: [archetype("Alfa", 85, { description: SHORT })],
        onStatsClick: undefined,
        onInfoClick: undefined,
      });

      expect(screen.queryByTestId("archetype-foot")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(getDescription().textContent).toBe(SHORT);
    });

    it("renders no foot for a single archetype that is no match", () => {
      renderArchetype({ archetypes: [archetype("Alfa", 20)] });

      expect(
        screen.getByRole("heading", { name: "Brak dopasowania" }),
      ).toBeVisible();
      expect(screen.queryByTestId("archetype-foot")).not.toBeInTheDocument();
    });
  });

  describe("given a description with markup", () => {
    const MARKUP =
      '<b>Mocne</b> [link](https://example.com) <a href="https://example.com">odnośnik</a>';

    it("renders it as plain text", () => {
      renderArchetype({
        archetypes: [archetype("Alfa", 85, { description: MARKUP })],
      });

      const description = getDescription();

      expect(description.textContent).toBe(MARKUP);
      expect(description.children).toHaveLength(0);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("keeps paragraph breaks", () => {
      renderArchetype({
        archetypes: [
          archetype("Alfa", 85, {
            description: "Raz.\r\n \r\n\r\nDwa.\nTrzy.",
          }),
        ],
      });

      expect(getDescription().textContent).toBe("Raz.\n\nDwa.\nTrzy.");
      expect(getDescription()).toHaveClass("whitespace-pre-line");
    });
  });

  describe("given a comparison", () => {
    const comparison = {
      orientation: FRIEND,
      values: { alfa: 60, gamma: 90, unknown: 99 },
    };

    it("passes each archetype value to its bar", () => {
      renderArchetype({ comparison });

      expect(
        screen.getByRole("img", { name: "Alfa: 85%, porównanie z Ania: 60%" }),
      ).toBeVisible();

      press("Ranking");

      expect(
        screen.getByRole("img", { name: "Gamma: 55%, porównanie z Ania: 90%" }),
      ).toBeVisible();
    });

    it("draws a bar without an overlay when there is no value for it", () => {
      renderArchetype({ comparison });

      press("Ranking");

      expect(screen.getByRole("img", { name: "Beta: 70%" })).toBeVisible();
      expect(
        screen.getAllByTestId("universal-axis-comparison-line"),
      ).toHaveLength(2);
    });

    it("does not change the leader or the order", () => {
      renderArchetype({ comparison });

      press("Ranking");

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Alfa",
      );
      expect(getRowNames()).toEqual(["Beta", "Gamma", "Delta", "Echo"]);
    });
  });

  describe("given no archetypes", () => {
    it("renders an empty card under its title", () => {
      renderArchetype({ archetypes: [] });

      expect(
        screen.getByRole("heading", { level: 2, name: "Tożsamość" }),
      ).toBeVisible();
      expect(
        screen.queryByRole("heading", { level: 3 }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.queryByRole("separator")).not.toBeInTheDocument();
      expect(screen.queryByTestId("archetype-foot")).not.toBeInTheDocument();
    });

    it("does not throw for a missing list", () => {
      renderArchetype({
        archetypes: undefined as unknown as ArchetypeEntry[],
      });

      expect(screen.getByRole("heading", { name: "Tożsamość" })).toBeVisible();
    });
  });

  describe("given invalid input", () => {
    it("treats a missing match as zero and lists it last", () => {
      renderArchetype({
        archetypes: [
          archetype("Zeta"),
          LEADER,
          archetype("Eta", Number.NaN),
          archetype("Beta", 0),
        ],
      });

      press("Ranking");

      expect(getRowNames()).toEqual(["Beta", "Zeta", "Eta"]);
      expect(screen.getByRole("img", { name: "Zeta: 0%" })).toBeVisible();
    });

    it("clamps a match outside 0-100", () => {
      renderArchetype({
        archetypes: [archetype("Alfa", 250), archetype("Beta", -40)],
      });

      expect(screen.getByRole("img", { name: "Alfa: 100%" })).toBeVisible();

      press("Ranking");

      expect(screen.getByRole("img", { name: "Beta: 0%" })).toBeVisible();
    });

    it("renders archetypes that share an id", () => {
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});

      renderArchetype({
        archetypes: [LEADER, archetype("Beta", 70), archetype("Beta", 60)],
      });
      press("Ranking");

      expect(getRowNames()).toEqual(["Beta", "Beta"]);
      expect(errors).not.toHaveBeenCalled();

      errors.mockRestore();
    });

    it("renders an archetype without an orientation", () => {
      renderArchetype({
        archetypes: [
          LEADER,
          { match: 30 } as unknown as ArchetypeEntry,
          archetype("Beta", 70),
        ],
      });

      press("Ranking");

      expect(getRowNames()).toEqual(["Beta", ""]);
    });

    it("keeps a long name whole for assistive technology", () => {
      const longName = "Bardzo długa nazwa archetypu ".repeat(6).trim();

      renderArchetype({ archetypes: [archetype(longName, 85)] });

      const heading = screen.getByRole("heading", { level: 3, name: longName });

      expect(heading).toHaveClass("truncate");
    });
  });

  describe("when the data changes while a view is open", () => {
    it("returns to the summary when the open view has nothing left to show", () => {
      const { rerender } = renderArchetype();

      press("Ranking");
      rerender(withI18n({ archetypes: [LEADER] }));

      expect(queryControl("Ranking")).not.toBeInTheDocument();
      expect(getRowNames()).toEqual([]);
      expect(getDescription().textContent).toBe(SHORT);
      expect(getControl("Pełny opis")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("stays in the summary when the closed view becomes available again", () => {
      const { rerender } = renderArchetype();

      press("Ranking");
      rerender(withI18n({ archetypes: [LEADER] }));
      rerender(withI18n({ archetypes: ARCHETYPES }));

      expect(getRowNames()).toEqual([]);
      expect(getDescription().textContent).toBe(SHORT);
      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "false");

      press("Ranking");

      expect(getRowNames()).toEqual(["Beta", "Gamma", "Delta", "Echo"]);
    });

    it("stays in the summary when a closed description becomes available again", () => {
      const { rerender } = renderArchetype();

      press("Pełny opis");
      rerender(withI18n({ archetypes: NO_MATCH }));
      rerender(withI18n({ archetypes: ARCHETYPES }));

      expect(getDescription().textContent).toBe(SHORT);
      expect(getControl("Pełny opis")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("keeps the full description open for a new leader that has one", () => {
      const { rerender } = renderArchetype();

      press("Pełny opis");
      rerender(
        withI18n({
          archetypes: [
            LEADER,
            archetype("Omega", 95, { fullDescription: "Opis Omegi." }),
          ],
        }),
      );

      expect(screen.getByRole("heading", { name: "Omega" })).toBeVisible();
      expect(getDescription().textContent).toBe("Opis Omegi.");
      expect(getControl("Pełny opis")).toHaveAttribute("aria-expanded", "true");
    });

    it("closes the full description when the leader stops matching", () => {
      const { rerender } = renderArchetype();

      press("Pełny opis");
      rerender(withI18n({ archetypes: NO_MATCH }));

      expect(
        screen.queryByTestId("archetype-description"),
      ).not.toBeInTheDocument();
      expect(queryControl("Pełny opis")).not.toBeInTheDocument();
      expect(getControl("Ranking")).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("given the wrapper actions", () => {
    it("passes both through", () => {
      const onStatsClick = vi.fn();
      const onInfoClick = vi.fn();

      renderArchetype({ onStatsClick, onInfoClick });
      press("Statystyki: Tożsamość");
      press("Informacje: Tożsamość");

      expect(onStatsClick).toHaveBeenCalledTimes(1);
      expect(onInfoClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("gives both controls text names and says whether each view is open", () => {
      renderArchetype();

      const controls = within(screen.getByTestId("archetype-foot"))
        .getAllByRole("button")
        .map((control) => [
          control.getAttribute("aria-label"),
          control.getAttribute("aria-expanded"),
        ]);

      expect(controls).toEqual([
        ["Pełny opis", "false"],
        ["Ranking", "false"],
      ]);
    });

    it("renders both controls as native buttons, so they work from the keyboard", () => {
      renderArchetype();

      for (const name of ["Pełny opis", "Ranking"]) {
        const control = getControl(name);

        expect(control.tagName).toBe("BUTTON");
        expect(control).not.toBeDisabled();
        expect(control).not.toHaveAttribute("tabindex", "-1");
      }
    });

    it("keeps focus on the control that opened a view", () => {
      renderArchetype();
      const description = getControl("Pełny opis");
      const ranking = getControl("Ranking");

      ranking.focus();
      fireEvent.click(ranking);

      expect(getControl("Ranking")).toBe(ranking);
      expect(ranking).toHaveFocus();

      fireEvent.click(ranking);

      expect(ranking).toHaveFocus();

      description.focus();
      fireEvent.click(description);

      expect(getControl("Pełny opis")).toBe(description);
      expect(description).toHaveFocus();
    });
  });
});
