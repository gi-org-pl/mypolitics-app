import { i18n } from "@lingui/core";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CompassMap } from "@/components/shared/CompassMap/CompassMap";
import { DEFAULT_LANGUAGE } from "@/constants/common";
import { DEFAULT_COMPASS_QUADRANTS } from "@/constants/results";
import { messages as enMessages } from "@/locales/en/messages";
import type { CompassPoint, NolanPathCheckpointCard } from "@/types/checkpoint";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { createCompassTrail } from "@/utils/vitest/survey/createCompassTrail";

import { SurveyCheckpointNolanPath } from "./SurveyCheckpointNolanPath";

// The map renders as it is; the spy shows what the card passes to it.
vi.mock("@/components/shared/CompassMap/CompassMap", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("@/components/shared/CompassMap/CompassMap")
    >();

  return { CompassMap: vi.fn(original.CompassMap) };
});

const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
// The three lines of the two-or-three pool, in its order, with the count.
const toPartialLines = (count: number) => [
  `Co ja tu robię? — W trakcie wykonywania quizu Twoja pozycja przeszła już przez ${count} ćwiartki kompasu!`,
  `Niezła wędrówka — Masz już za sobą ${count} ćwiartki kompasu, a quiz jeszcze trwa.`,
  `Trochę Cię nosi — Twoje odpowiedzi prowadzą już przez ${count} ćwiartki kompasu.`,
];
// The three lines of the four-quadrant pool, in its order.
const FULL_LINES = [
  "Wielka przeprawa! — Wszystkie ćwiartki kompasu są już za Tobą.",
  "Dookoła kompasu — Twoja pozycja odwiedziła już każdą z czterech ćwiartek.",
  "Komplet! — Cztery ćwiartki kompasu zaliczone, a quiz jeszcze trwa.",
];

const toDescription = (count: number, place: string) =>
  `Kompas: trasa przeszła przez ${count} z 4 ćwiartek. Twoja pozycja jest teraz ${place}.`;
const HIGHLIGHTED = "w podświetlonej ćwiartce";
const NEAR_THE_CENTRE = "blisko środka";

// Top right, across the top left, down to the bottom left: three quadrants
// when the count says so, and the taker at the moderate level.
const TRAIL = createCompassTrail([
  [0.5, 0.5],
  [0.1, 0.6],
  [-0.5, 0.5],
  [-0.54, -0.34],
]);
// The whole route of a full card: every quadrant, ending in the bottom right.
const FULL_TRAIL = createCompassTrail([
  [0.5, 0.5],
  [-0.5, 0.5],
  [-0.5, -0.5],
  [0.6, -0.7],
]);
// A second path: what came since the earlier card, all of it in one corner.
const SECOND_TRAIL = createCompassTrail([
  [0.5, -0.5],
  [0.7, -0.4],
  [0.6, -0.7],
]);
const CENTRE_TRAIL = createCompassTrail([
  [0.5, 0.5],
  [-0.5, -0.5],
  [0.1, -0.2],
]);

const createCard = (
  overrides: Partial<NolanPathCheckpointCard> = {},
): NolanPathCheckpointCard => ({
  type: "nolan-path",
  boundary: 12,
  line: { pool: "nolan-path-partial", index: 0 },
  variant: "partial",
  count: 2,
  trail: TRAIL,
  isSecondPath: false,
  ...overrides,
});

const FULL: Partial<NolanPathCheckpointCard> = {
  line: { pool: "nolan-path-full", index: 0 },
  variant: "full",
  count: 4,
  trail: FULL_TRAIL,
};

const renderCard = (overrides: Partial<NolanPathCheckpointCard> = {}) => {
  const card = createCard(overrides);
  const onReveal = vi.fn();
  const onContinue = vi.fn();
  const onOptOut = vi.fn();

  return {
    ...renderWithI18n(
      <SurveyCheckpointNolanPath
        card={card}
        onReveal={onReveal}
        onContinue={onContinue}
        onOptOut={onOptOut}
      />,
    ),
    card,
    onReveal,
    onContinue,
    onOptOut,
  };
};

const getRegion = () => screen.getByRole("region", { name: "Checkpoint" });

const getText = () => within(getRegion()).getByRole("paragraph");

const getMap = () => within(getRegion()).getByRole("img");

const getButton = (name: string) => screen.getByRole("button", { name });

const getMapProps = () => vi.mocked(CompassMap).mock.lastCall?.[0];

const getFilled = () =>
  screen
    .getAllByTestId(/^nolan-chart-quadrant-/)
    .filter((quadrant) => quadrant.dataset.filled === "true")
    .map((quadrant) => quadrant.dataset.testid);

const isBefore = (first: Element, second: Element): boolean =>
  Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

describe("<SurveyCheckpointNolanPath />", () => {
  beforeEach(() => {
    vi.mocked(CompassMap).mockClear();
  });

  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
  });

  describe("given a partial card with a count of 2", () => {
    it("renders one checkpoint frame with the map, the lead-in and the statement of the card's line", () => {
      renderCard();

      expect(
        screen.getAllByRole("region", { name: "Checkpoint" }),
      ).toHaveLength(1);
      expect(within(getRegion()).getAllByRole("img")).toHaveLength(1);
      expect(within(getRegion()).getAllByRole("paragraph")).toHaveLength(1);
      expect(getText()).toHaveTextContent(toPartialLines(2)[0]);
      expect(
        within(getText()).getByText("Co ja tu robię?", { exact: false }),
      ).toBe(getText().firstElementChild);
      expect(isBefore(getMap(), getText())).toBe(true);
    });

    it("shows the count 2 in the statement", () => {
      renderCard();

      expect(getText()).toHaveTextContent("przez 2 ćwiartki kompasu");
      // The count is the only number in the text of the card.
      expect(getRegion().textContent?.match(/\d+/g)).toEqual(["2"]);
    });

    it('renders "Dalej" and "Wyłącz checkpointy"', () => {
      renderCard();

      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual([CONTINUE, OPT_OUT]);
    });

    it("describes the map with 2 of 4 quadrants", () => {
      renderCard();

      expect(getMap()).toHaveAccessibleName(toDescription(2, HIGHLIGHTED));
    });
  });

  describe("given a partial card with a count of 3", () => {
    it("shows the count 3 in the statement", () => {
      renderCard({ count: 3 });

      expect(getText()).toHaveTextContent(toPartialLines(3)[0]);
      expect(getMap()).toHaveAccessibleName(toDescription(3, HIGHLIGHTED));
    });
  });

  describe("given each line of the two-or-three pool", () => {
    it.each(
      toPartialLines(3).map((line, index) => ({ line, index })),
    )("shows that line with the count in it: $line", ({ line, index }) => {
      renderCard({ count: 3, line: { pool: "nolan-path-partial", index } });

      expect(getText()).toHaveTextContent(line);
    });
  });

  describe("given a full card", () => {
    it.each(
      FULL_LINES.map((line, index) => ({ line, index })),
    )("shows a line of the four-quadrant pool: $line", ({ line, index }) => {
      renderCard({ ...FULL, line: { pool: "nolan-path-full", index } });

      expect(getText()).toHaveTextContent(line);
      expect(getRegion().textContent).not.toMatch(/\d/);
    });

    it("draws the whole trail of the card and describes the map with 4 of 4", () => {
      const { card } = renderCard(FULL);

      expect(getMapProps()?.trail).toBe(card.trail);
      expect(getMap()).toHaveAccessibleName(toDescription(4, HIGHLIGHTED));
      expect(getFilled()).toEqual(["nolan-chart-quadrant-bottomRight"]);
    });
  });

  describe("given a full card that is a second path", () => {
    it("passes the trail of the card to the map unchanged", () => {
      const { card } = renderCard({
        ...FULL,
        isSecondPath: true,
        trail: SECOND_TRAIL,
      });

      expect(getMapProps()?.trail).toBe(card.trail);
      expect(card.trail).toEqual(SECOND_TRAIL);
      expect(screen.getByTestId("compass-map-trail").getAttribute("d")).toMatch(
        /^M75 75C.+ 80 85$/,
      );
    });

    it("says 4 of 4 in the description of the map", () => {
      renderCard({ ...FULL, isSecondPath: true, trail: SECOND_TRAIL });

      expect(getMap()).toHaveAccessibleName(toDescription(4, HIGHLIGHTED));
      expect(getText()).toHaveTextContent(FULL_LINES[0]);
    });
  });

  describe("the map", () => {
    it("is rendered once", () => {
      renderCard();

      expect(CompassMap).toHaveBeenCalledTimes(1);
      expect(screen.getAllByTestId("nolan-chart-map")).toEqual([getMap()]);
    });

    it("gets the default quadrant colours", () => {
      renderCard();

      expect(getMapProps()?.quadrants).toBe(DEFAULT_COMPASS_QUADRANTS);
      expect(
        screen
          .getByTestId("nolan-chart-quadrant-topLeft")
          .style.getPropertyValue("--nolan-color"),
      ).toBe(DEFAULT_COMPASS_QUADRANTS.topLeft.color);
    });

    it("gets the whole trail of the card", () => {
      const { card } = renderCard();

      expect(getMapProps()?.trail).toBe(card.trail);
      expect(screen.getByTestId("compass-map-trail").getAttribute("d")).toMatch(
        /^M75 25C.+ 23 67$/,
      );
    });

    it("gets the last point of the trail as the position", () => {
      const { card } = renderCard();

      expect(getMapProps()?.position).toBe(card.trail.at(-1));
      expect(
        screen
          .getByTestId("nolan-chart-dot")
          .style.getPropertyValue("--nolan-x"),
      ).toBe("23%");
      expect(
        screen
          .getByTestId("nolan-chart-dot")
          .style.getPropertyValue("--nolan-y"),
      ).toBe("67%");
      expect(screen.getByTestId("nolan-chart-halo")).toBeInTheDocument();
    });

    it("fills the quadrant of a last point at the moderate or the extreme level", () => {
      renderCard();

      expect(getFilled()).toEqual(["nolan-chart-quadrant-bottomLeft"]);
    });

    it("gets no other side of a comparison", () => {
      renderCard();

      expect(getMapProps()).not.toHaveProperty("otherOrientation");
      expect(getMapProps()).not.toHaveProperty("otherPosition");
      expect(
        screen.queryByTestId("nolan-chart-comparison"),
      ).not.toBeInTheDocument();
    });

    it("is one image, with no title, no axis name and no coordinate around it", () => {
      renderCard();

      expect(getMapProps()?.description).toBe(toDescription(2, HIGHLIGHTED));
      expect(screen.getAllByRole("img")).toEqual([getMap()]);
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(
        document.querySelector(
          '[data-testid^="nolan-chart-title"], [data-testid^="nolan-chart-axis"], [data-testid^="nolan-chart-coordinate"]',
        ),
      ).toBeNull();
      expect(getMap()).toHaveTextContent("");
    });

    it("is no wider than in the design and shrinks with the card", () => {
      renderCard();

      expect(getMap().parentElement).toHaveClass("w-full", "max-w-61.25");
      expect(getMap()).toHaveClass("w-full", "aspect-square");
    });

    it("exposes no focusable element", () => {
      renderCard();

      // The paragraph takes the focus from the frame's script only.
      expect(
        [
          ...getRegion().querySelectorAll(
            "button, a, input, select, textarea, [tabindex]",
          ),
        ].map((element) => element.textContent),
      ).toEqual([getText().textContent, CONTINUE, OPT_OUT]);
      expect(getMap().querySelector("[tabindex]")).toBeNull();
    });
  });

  describe("given a trail whose last point is at the centre level", () => {
    it("fills no quadrant", () => {
      renderCard({ trail: CENTRE_TRAIL });

      expect(getFilled()).toEqual([]);
      expect(screen.getByTestId("nolan-chart-dot")).toBeInTheDocument();
      expect(screen.getByTestId("compass-map-trail")).toBeInTheDocument();
    });

    it("says the position is near the centre", () => {
      renderCard({ trail: CENTRE_TRAIL });

      expect(getMap()).toHaveAccessibleName(toDescription(2, NEAR_THE_CENTRE));
    });
  });

  describe("given a trail with a single distinct point", () => {
    it.each([
      { name: "one point", trail: TRAIL.slice(-1) },
      { name: "one place twice", trail: [TRAIL[3], { ...TRAIL[3], done: 5 }] },
    ])("renders the map with the dot and no line: $name", ({ trail }) => {
      const { onContinue } = renderCard({ trail });

      expect(getMap()).toBeInTheDocument();
      expect(screen.getByTestId("nolan-chart-dot")).toBeInTheDocument();
      expect(screen.queryByTestId("compass-map-trail")).not.toBeInTheDocument();
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("given an empty trail", () => {
    it("renders nothing and calls onContinue once", () => {
      const { container, onContinue, onOptOut } = renderCard({ trail: [] });

      expect(container).toBeEmptyDOMElement();
      expect(CompassMap).not.toHaveBeenCalled();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("given a trail whose last point is not a number", () => {
    it.each([
      { name: "x", last: { ...TRAIL[3], x: Number.NaN } },
      { name: "y", last: { ...TRAIL[3], y: Number.NaN } },
      { name: "x as text", last: { ...TRAIL[3], x: "0.5" } },
      { name: "no point", last: null },
    ])("renders nothing and calls onContinue once: $name", ({ last }) => {
      const { container, onContinue, onOptOut } = renderCard({
        trail: [...TRAIL.slice(0, 3), last as CompassPoint],
      });

      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("given a point before the last that is not a number", () => {
    it("draws the card and leaves the point out of the line", () => {
      const { onContinue } = renderCard({
        trail: [TRAIL[0], { ...TRAIL[1], x: Number.NaN }, TRAIL[3]],
      });

      expect(screen.getByTestId("compass-map-trail").getAttribute("d")).toMatch(
        /^M75 25C[^C]+ 23 67$/,
      );
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("given a line that does not exist in the pools", () => {
    it.each([
      {
        name: "past the end of the pool",
        line: { pool: "nolan-path-partial", index: 3 },
      },
      {
        name: "the pool of the other version",
        line: { pool: "nolan-path-full", index: 0 },
      },
      { name: "the pool of another card", line: { pool: "halfway", index: 0 } },
    ] satisfies {
      name: string;
      line: NolanPathCheckpointCard["line"];
    }[])("renders nothing and calls onContinue once: $name", ({ line }) => {
      const { container, onContinue, onOptOut } = renderCard({ line });

      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("given a partial card whose count the line cannot print", () => {
    it.each([
      1,
      4,
      Number.NaN,
    ])("renders nothing and calls onContinue once: %s", (count) => {
      const { container, onContinue } = renderCard({ count: count as 2 });

      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("given the app is in English", () => {
    it("shows the line and describes the map in English", () => {
      act(() => {
        i18n.load("en", enMessages);
        i18n.activate("en");
      });
      renderCard({ count: 3 });

      expect(getText()).toHaveTextContent(/3 quadrants of the compass/);
      expect(getMap()).toHaveAccessibleName(
        "Compass: the route has passed through 3 of 4 quadrants. Your position is now in the highlighted quadrant.",
      );
    });
  });

  describe('when "Dalej" is activated', () => {
    it("calls onContinue once", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(CONTINUE));

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe('when "Wyłącz checkpointy" is activated', () => {
    it("calls onOptOut once", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(OPT_OUT));

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  it("never calls onReveal", () => {
    const { onReveal } = renderCard();

    fireEvent.click(getButton(CONTINUE));
    fireEvent.click(getButton(OPT_OUT));

    expect(onReveal).not.toHaveBeenCalled();
  });

  it("names no quadrant anywhere on the card", () => {
    // The words a quadrant is named with: a side, a colour, a level.
    const NAMES =
      /(?<!\p{L})(lew|praw|górn|doln|czerwon|niebiesk|zielon|fiolet|umiarkowan|skrajn|centrum)/iu;

    for (const overrides of [
      {},
      { count: 3 as const },
      FULL,
      { ...FULL, isSecondPath: true, trail: SECOND_TRAIL },
      { trail: CENTRE_TRAIL },
    ]) {
      const { unmount } = renderCard(overrides);

      expect(getRegion().textContent).not.toMatch(NAMES);
      expect(getMap().getAttribute("aria-label")).not.toMatch(NAMES);
      expect(getRegion().querySelector("[title]")).toBeNull();

      unmount();
    }
  });
});
