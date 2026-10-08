import { type I18n, setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { messages as enMessages } from "@/locales/en/messages";
import { messages as plMessages } from "@/locales/pl/messages";
import type {
  AxisClosenessCheckpointCard,
  AxisClosenessDoubleCheckpointCard,
  AxisClosenessSingleCheckpointCard,
} from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { SurveyCheckpointAxisCloseness } from "./SurveyCheckpointAxisCloseness";

const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const SINGLE_DESCRIPTION = "Skala „Radykalizm”: wysoki wynik";

// The lines of the two pools, in the order the pools hold them, with the
// names of the cards below in their slots.
const SINGLE_LINES = [
  "To już wiemy — Twój wynik na skali „Radykalizm” jest wysoki!",
  "Tu nie ma wątpliwości — Na skali „Radykalizm” wypadasz wysoko.",
  "Jedno jest jasne — Skala „Radykalizm”: jak dotąd wysoki wynik.",
];
const DOUBLE_LINES = [
  "Tego już jesteśmy pewni — Twój wynik po stronie „Eurosceptycyzm” jest wyższy niż po stronie „Federacjonizm”!",
  "To widać coraz wyraźniej — „Eurosceptycyzm” czy „Federacjonizm”? Na tym etapie quizu bliżej Ci do pierwszej z tych stron.",
  "Szala się przechyla — Jak dotąd strona „Eurosceptycyzm” wyprzedza u Ciebie stronę „Federacjonizm”.",
];

// The catalogs of the app, as `root.tsx` loads them.
const createI18n = (locale: "pl" | "en" = "pl"): I18n =>
  setupI18n({ locale, messages: { en: enMessages, pl: plMessages } });

const radicalism = createOrientation("radicalism", "Radykalizm", {
  imageUrl: "https://example.com/radicalism.svg",
  color: "#924747",
});

const createSingleCard = (
  orientation: Orientation = radicalism,
  value = 80,
  index = 0,
): AxisClosenessSingleCheckpointCard => ({
  type: "axis-closeness",
  variant: "single",
  boundary: 5,
  axisId: "radicalism",
  entry: { orientation, value },
  line: { pool: "axis-closeness-single", index },
});

const createDoubleCard = (
  startValue = 69,
  endValue = 31,
  overrides: Partial<AxisClosenessDoubleCheckpointCard> = {},
): AxisClosenessDoubleCheckpointCard => {
  const { start, end } = createAxisPair(
    "union",
    "Eurosceptycyzm",
    "Federacjonizm",
    startValue,
    endValue,
  );

  return {
    type: "axis-closeness",
    variant: "double",
    boundary: 5,
    axisId: "union",
    start,
    end,
    leadingSide: endValue > startValue ? "end" : "start",
    line: { pool: "axis-closeness-double", index: 0 },
    ...overrides,
  };
};

const renderCard = (
  card: AxisClosenessCheckpointCard,
  i18n: I18n = createI18n(),
) => {
  const onReveal = vi.fn();
  const onContinue = vi.fn();
  const onOptOut = vi.fn();

  return {
    ...render(
      <I18nProvider i18n={i18n}>
        <SurveyCheckpointAxisCloseness
          card={card}
          onReveal={onReveal}
          onContinue={onContinue}
          onOptOut={onOptOut}
        />
      </I18nProvider>,
    ),
    i18n,
    onReveal,
    onContinue,
    onOptOut,
  };
};

const getRegion = () => screen.getByRole("region", { name: "Checkpoint" });

const queryRegion = () => screen.queryByRole("region", { name: "Checkpoint" });

const getBar = () => within(getRegion()).getByRole("img");

const getText = () => within(getRegion()).getByRole("paragraph");

// The title is the first text of the card that is the name alone: under a
// double-sided bar the name is written once more.
const getTitle = (name: string) => within(getRegion()).getAllByText(name)[0];

const getButton = (name: string) => screen.getByRole("button", { name });

const isBefore = (first: Element, second: Element): boolean =>
  (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING) !==
  0;

const getFillWidth = (side: "start" | "end"): string =>
  screen.getByTestId(`universal-axis-fill-${side}`).style.width;

describe("<SurveyCheckpointAxisCloseness />", () => {
  describe("given the single variant", () => {
    it('renders exactly one region named "Checkpoint"', () => {
      renderCard(createSingleCard());

      expect(screen.getAllByRole("region")).toHaveLength(1);
      expect(getRegion()).toBeVisible();
    });

    it("shows the name of the orientation as the title, before the bar", () => {
      renderCard(createSingleCard());

      expect(getTitle("Radykalizm")).toBeVisible();
      expect(isBefore(getTitle("Radykalizm"), getBar())).toBe(true);
      expect(isBefore(getBar(), getText())).toBe(true);
    });

    it("draws a one-sided bar from the start cap, with no names under it", () => {
      renderCard(createSingleCard());

      expect(screen.getByTestId("universal-axis-cap-start")).toHaveClass(
        "left-0",
      );
      expect(
        screen.queryByTestId("universal-axis-cap-end"),
      ).not.toBeInTheDocument();
      expect(getFillWidth("start")).toBe("80%");
      expect(
        screen.queryByTestId("universal-axis-fill-end"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-labels"),
      ).not.toBeInTheDocument();
      expect(within(getRegion()).getAllByText("Radykalizm")).toHaveLength(1);
    });

    it("keeps the marker at the middle", () => {
      renderCard(createSingleCard());

      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("50%");
    });

    it("draws no number on or next to the fill", () => {
      const { unmount } = renderCard(createSingleCard());

      expect(
        screen.getByTestId("universal-axis-fill-start"),
      ).toBeEmptyDOMElement();
      expect(screen.queryByTestId(/universal-axis-value/)).toBeNull();
      expect(within(getRegion()).queryByText(/\d/)).not.toBeInTheDocument();

      unmount();
      // A fill too small to hold a number has none after it either.
      renderCard(createSingleCard(radicalism, 5));

      expect(getFillWidth("start")).toBe("5%");
      expect(screen.queryByTestId(/universal-axis-value/)).toBeNull();
    });

    it("describes the bar in words: the name and that the score is high, with no digit", () => {
      renderCard(createSingleCard());

      expect(getBar()).toHaveAccessibleName(SINGLE_DESCRIPTION);
      expect(getBar().getAttribute("aria-label")).not.toMatch(/[\d%]/);
    });

    it("shows the lead-in and the statement of the card's line, with the name in it", () => {
      renderCard(createSingleCard());

      expect(getText()).toHaveTextContent(SINGLE_LINES[0]);
    });

    it('shows "Dalej" and "Wyłącz checkpointy", and no options', () => {
      renderCard(createSingleCard());

      expect(
        within(getRegion())
          .getAllByRole("button")
          .map((button) => button.textContent),
      ).toEqual([CONTINUE, OPT_OUT]);
    });
  });

  describe("given the double variant with the start side leading", () => {
    it("shows the name of the start side as the title", () => {
      renderCard(createDoubleCard());

      expect(getTitle("Eurosceptycyzm")).toBeVisible();
      expect(isBefore(getTitle("Eurosceptycyzm"), getBar())).toBe(true);
      expect(getBar()).not.toContainElement(getTitle("Eurosceptycyzm"));
    });

    it("draws a double-sided bar with each side named under its cap", () => {
      renderCard(createDoubleCard());

      const labels = screen.getByTestId("universal-axis-labels");

      expect(screen.getByTestId("universal-axis-cap-start")).toHaveClass(
        "left-0",
      );
      expect(screen.getByTestId("universal-axis-cap-end")).toHaveClass(
        "right-0",
      );
      expect(getFillWidth("start")).toBe("69%");
      expect(getFillWidth("end")).toBe("31%");
      expect(within(labels).getByText("Eurosceptycyzm")).toBeVisible();
      expect(within(labels).getByText("Federacjonizm")).toHaveClass(
        "text-right",
      );
    });

    it("draws no number on either side", () => {
      renderCard(createDoubleCard());

      expect(
        screen.getByTestId("universal-axis-fill-start"),
      ).toBeEmptyDOMElement();
      expect(
        screen.getByTestId("universal-axis-fill-end"),
      ).toBeEmptyDOMElement();
      expect(within(getRegion()).queryByText(/\d/)).not.toBeInTheDocument();
    });

    it("describes the bar in words: both names and which side is ahead, with no digit", () => {
      renderCard(createDoubleCard());

      expect(getBar()).toHaveAccessibleName(
        "„Eurosceptycyzm” i „Federacjonizm”: wyższy wynik po stronie „Eurosceptycyzm”",
      );
      expect(getBar().getAttribute("aria-label")).not.toMatch(/[\d%]/);
    });

    it("shows the statement with the leading name first and the other one second", () => {
      renderCard(createDoubleCard());

      expect(getText()).toHaveTextContent(DOUBLE_LINES[0]);
    });
  });

  describe("given the double variant with the end side leading", () => {
    it("shows the name of the end side as the title", () => {
      renderCard(createDoubleCard(31, 69));

      expect(isBefore(getTitle("Federacjonizm"), getBar())).toBe(true);
      expect(getBar()).not.toContainElement(getTitle("Federacjonizm"));
      expect(getText()).toHaveTextContent(
        "Tego już jesteśmy pewni — Twój wynik po stronie „Federacjonizm” jest wyższy niż po stronie „Eurosceptycyzm”!",
      );
    });

    it("keeps the start side on the start cap and the end side on the end cap", () => {
      renderCard(createDoubleCard(31, 69));

      const [startLabel, endLabel] = Array.from(
        screen.getByTestId("universal-axis-labels").children,
      );

      expect(getFillWidth("start")).toBe("31%");
      expect(getFillWidth("end")).toBe("69%");
      expect(startLabel).toHaveTextContent("Eurosceptycyzm");
      expect(endLabel).toHaveTextContent("Federacjonizm");
      expect(getBar()).toHaveAccessibleName(
        "„Eurosceptycyzm” i „Federacjonizm”: wyższy wynik po stronie „Federacjonizm”",
      );
    });
  });

  describe("given values that do not reach 100 together, and values that exceed it", () => {
    it("draws the bar and names the leading side the card gives", () => {
      const { unmount } = renderCard(createDoubleCard(45, 20));

      // The gap stays in the middle.
      expect(getFillWidth("start")).toBe("45%");
      expect(getFillWidth("end")).toBe("20%");
      expect(getTitle("Eurosceptycyzm")).toBeVisible();

      unmount();
      // Scaled by the bar; the title is still the side the card says leads.
      renderCard(createDoubleCard(60, 90));

      expect(getFillWidth("start")).toBe("40%");
      expect(getFillWidth("end")).toBe("60%");
      expect(isBefore(getTitle("Federacjonizm"), getBar())).toBe(true);
    });

    it("draws a value outside 0-100 clamped, and a missing one as a cap with no fill", () => {
      const { unmount } = renderCard(createSingleCard(radicalism, 140));

      expect(getFillWidth("start")).toBe("100%");

      unmount();
      renderCard({ ...createSingleCard(), entry: { orientation: radicalism } });

      expect(screen.getByTestId("universal-axis-cap-start")).toBeVisible();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(getBar()).toHaveAccessibleName(SINGLE_DESCRIPTION);
    });
  });

  describe("given each line of the two pools", () => {
    it.each(
      SINGLE_LINES.map((line, index) => [index, line] as const),
    )("shows line %i of the single pool with the name in it", (index, line) => {
      renderCard(createSingleCard(radicalism, 80, index));

      expect(getText()).toHaveTextContent(line);
      expect(getText().textContent).toBe(line.replace(" — ", " — "));
    });

    it.each(
      DOUBLE_LINES.map((line, index) => [index, line] as const),
    )("shows line %i of the double pool with the names in it", (index, line) => {
      renderCard(
        createDoubleCard(69, 31, {
          line: { pool: "axis-closeness-double", index },
        }),
      );

      expect(getText()).toHaveTextContent(line);
    });
  });

  describe("given a name with line breaks, a long name, and a name with quotation marks", () => {
    const name = `Państwo „minimum”  w wydaniu \n ${"bardzo ".repeat(25)}długim`;
    const shownName = `Państwo „minimum” w wydaniu ${"bardzo ".repeat(25)}długim`;

    it("shows the title on one piece of text, in full, as written", () => {
      renderCard(createSingleCard({ ...radicalism, name }));

      const title = getTitle(shownName);

      expect(title).toBeVisible();
      expect(title.children).toHaveLength(0);
      expect(title.className).not.toMatch(/truncate|line-clamp|nowrap/);
      expect(getText()).toHaveTextContent(
        `To już wiemy — Twój wynik na skali „${shownName}” jest wysoki!`,
      );
    });

    it("keeps the full name in the description of the bar", () => {
      renderCard(createSingleCard({ ...radicalism, name }));

      expect(getBar()).toHaveAccessibleName(
        `Skala „${shownName}”: wysoki wynik`,
      );
    });

    it("keeps the full names of a double-sided bar in its description", () => {
      const card = createDoubleCard();

      renderCard({
        ...card,
        start: { ...card.start, orientation: { ...radicalism, name } },
      });

      expect(getBar()).toHaveAccessibleName(
        `„${shownName}” i „Federacjonizm”: wyższy wynik po stronie „${shownName}”`,
      );
      expect(
        within(screen.getByTestId("universal-axis-labels")).getByText(
          shownName,
        ),
      ).toHaveClass("truncate");
    });
  });

  describe("given an orientation without an image, or without a colour", () => {
    it("draws the cap as the bar does: in the colour alone, or in the neutral one", () => {
      const { unmount } = renderCard(
        createSingleCard({ ...radicalism, imageUrl: undefined }),
      );
      const cap = screen.getByTestId("universal-axis-cap-start");

      expect(cap).toHaveClass("bg-(--axis-color)");
      expect(cap.style.getPropertyValue("--axis-color")).toBe("#924747");

      unmount();
      renderCard(
        createSingleCard({
          ...radicalism,
          imageUrl: undefined,
          color: undefined,
        }),
      );

      expect(screen.getByTestId("universal-axis-cap-start")).toHaveClass(
        "bg-gi-dark-gray",
      );
    });
  });

  describe("given the app is in English", () => {
    it("shows the line and the description in English, with the names unchanged", () => {
      const { unmount } = renderCard(createSingleCard(), createI18n("en"));

      expect(getText()).toHaveTextContent(
        "This much we know — Your score on the “Radykalizm” scale is high!",
      );
      expect(getBar()).toHaveAccessibleName(
        "The “Radykalizm” scale: a high score",
      );
      expect(getTitle("Radykalizm")).toBeVisible();

      unmount();
      renderCard(createDoubleCard(31, 69), createI18n("en"));

      expect(getText()).toHaveTextContent(
        "Of this we are sure — Your score on the “Federacjonizm” side is higher than on the “Eurosceptycyzm” side!",
      );
      expect(getBar()).toHaveAccessibleName(
        "“Eurosceptycyzm” and “Federacjonizm”: the higher score is on the “Federacjonizm” side",
      );
    });
  });

  describe("when the language changes while the card is up", () => {
    it("shows the same line and the description in the other language", () => {
      const { i18n, onContinue } = renderCard(
        createSingleCard(radicalism, 80, 1),
      );

      expect(getText()).toHaveTextContent(SINGLE_LINES[1]);

      act(() => i18n.activate("en"));

      expect(getText()).toHaveTextContent(
        "No doubt about this one — On the “Radykalizm” scale you score high.",
      );
      expect(getBar()).toHaveAccessibleName(
        "The “Radykalizm” scale: a high score",
      );
      expect(getTitle("Radykalizm")).toBeVisible();
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("when the card stays open and is drawn again", () => {
    it("changes nothing on it", () => {
      const card = createDoubleCard();
      const { container, rerender, i18n, onContinue } = renderCard(card);
      const markup = container.innerHTML;

      rerender(
        <I18nProvider i18n={i18n}>
          <SurveyCheckpointAxisCloseness
            card={card}
            onReveal={vi.fn()}
            onContinue={onContinue}
            onOptOut={vi.fn()}
          />
        </I18nProvider>,
      );

      expect(container.innerHTML).toBe(markup);
    });
  });

  describe("given a card whose title name is missing", () => {
    it("renders nothing and calls onContinue once", () => {
      const { container, onContinue, onOptOut } = renderCard(
        createSingleCard({ ...radicalism, name: "  " }),
      );

      expect(queryRegion()).not.toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("given a card whose text cannot be built", () => {
    it("renders nothing and calls onContinue once", () => {
      const card = createDoubleCard();
      // The title has its name, the other side of the statement has none.
      const { container, onContinue, unmount } = renderCard({
        ...card,
        end: {
          ...card.end,
          orientation: { ...card.end.orientation, name: undefined },
        },
      });

      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);

      unmount();

      // A line that does not exist.
      const missingLine = renderCard(createSingleCard(radicalism, 80, 99));

      expect(missingLine.container).toBeEmptyDOMElement();
      expect(missingLine.onContinue).toHaveBeenCalledTimes(1);
    });

    it("renders nothing, without throwing, for a card that cannot be read", () => {
      const { container, onContinue } = renderCard({
        ...createSingleCard(),
        entry: undefined,
      } as unknown as AxisClosenessCheckpointCard);

      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('when "Dalej" is activated', () => {
    it("calls onContinue once", () => {
      const { onContinue, onOptOut } = renderCard(createSingleCard());

      fireEvent.click(getButton(CONTINUE));

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe('when "Wyłącz checkpointy" is activated', () => {
    it("calls onOptOut once", () => {
      const { onContinue, onOptOut } = renderCard(createDoubleCard());

      fireEvent.click(getButton(OPT_OUT));

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("exposes the bar as a single image and adds no focusable element", () => {
      renderCard(createDoubleCard());

      expect(within(getRegion()).getAllByRole("img")).toHaveLength(1);
      expect(
        getBar().querySelectorAll(
          "a, button, input, select, textarea, [tabindex]",
        ),
      ).toHaveLength(0);
      // The frame's own: the text it puts the focus on, and its two buttons.
      expect(
        Array.from(
          getRegion().querySelectorAll(
            "a, button, input, select, textarea, [tabindex]",
          ),
        ),
      ).toEqual([getText(), getButton(CONTINUE), getButton(OPT_OUT)]);
    });

    it("shows no percentage anywhere on the card", () => {
      const { unmount } = renderCard(createSingleCard());

      expect(getRegion().textContent).not.toMatch(/[\d%]/);
      expect(getRegion().innerHTML).not.toMatch(/aria-label="[^"]*[\d%]/);

      unmount();
      renderCard(createDoubleCard());

      expect(getRegion().textContent).not.toMatch(/[\d%]/);
      expect(getRegion().innerHTML).not.toMatch(/aria-label="[^"]*[\d%]/);
    });

    it("has no info button, no chip and no explanation of the axis", () => {
      renderCard(
        createSingleCard({
          ...radicalism,
          description: "Opis orientacji",
          explanation: "Wyjaśnienie osi",
        }),
      );

      expect(within(getRegion()).getAllByRole("button")).toHaveLength(2);
      expect(screen.queryByText("Opis orientacji")).not.toBeInTheDocument();
      expect(screen.queryByText("Wyjaśnienie osi")).not.toBeInTheDocument();
    });
  });

  it("never calls onReveal", () => {
    const { onReveal } = renderCard(createSingleCard());

    fireEvent.click(getButton(CONTINUE));
    fireEvent.click(getButton(OPT_OUT));

    expect(onReveal).not.toHaveBeenCalled();
  });
});
