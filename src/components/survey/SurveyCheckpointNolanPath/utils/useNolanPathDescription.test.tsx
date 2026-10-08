import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { messages as enMessages } from "@/locales/en/messages";
import type { NolanPathCheckpointCard } from "@/types/checkpoint";
import { createCompassTrail } from "@/utils/vitest/createCompassTrail";

import { useNolanPathDescription } from "./useNolanPathDescription";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

// Top right, then bottom left: the taker stands at the moderate level.
const MODERATE_TRAIL = createCompassTrail([
  [0.5, 0.5],
  [-0.54, -0.34],
]);
const EXTREME_TRAIL = createCompassTrail([
  [-0.5, -0.5],
  [1, 1],
]);
const CENTRE_TRAIL = createCompassTrail([
  [0.5, 0.5],
  [-0.5, -0.5],
  [0.1, -0.2],
]);
// A second path: every point lies in one corner of the map.
const CORNER_TRAIL = createCompassTrail([
  [0.5, -0.5],
  [0.7, -0.4],
  [0.6, -0.7],
]);

const createCard = (
  overrides: Partial<NolanPathCheckpointCard> = {},
): NolanPathCheckpointCard => ({
  type: "nolan-path",
  boundary: 12,
  line: { pool: "nolan-path-partial", index: 0 },
  variant: "partial",
  count: 2,
  trail: MODERATE_TRAIL,
  isSecondPath: false,
  ...overrides,
});

const describeCard = (overrides: Partial<NolanPathCheckpointCard> = {}) =>
  renderHook(() => useNolanPathDescription(createCard(overrides)), { wrapper })
    .result.current;

const highlighted = (count: number) =>
  `Kompas: trasa przeszła przez ${count} z 4 ćwiartek. Twoja pozycja jest teraz w podświetlonej ćwiartce.`;

const nearTheCentre = (count: number) =>
  `Kompas: trasa przeszła przez ${count} z 4 ćwiartek. Twoja pozycja jest teraz blisko środka.`;

describe("useNolanPathDescription()", () => {
  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
  });

  describe("given a current position at the moderate or the extreme level", () => {
    it.each([
      { name: "moderate", trail: MODERATE_TRAIL, count: 2 as const },
      { name: "extreme", trail: EXTREME_TRAIL, count: 3 as const },
    ])("says how many of the four quadrants and that the position is in the highlighted quadrant: $name", ({
      trail,
      count,
    }) => {
      expect(describeCard({ trail, count })).toBe(highlighted(count));
    });
  });

  describe("given a current position at the centre level", () => {
    it("says how many of the four quadrants and that the position is near the centre", () => {
      expect(describeCard({ trail: CENTRE_TRAIL, count: 2 })).toBe(
        nearTheCentre(2),
      );
      expect(describeCard({ trail: CENTRE_TRAIL, count: 3 })).toBe(
        nearTheCentre(3),
      );
    });
  });

  describe("given a second path card", () => {
    it("uses the count of the card, not the quadrants the line lies in", () => {
      expect(
        describeCard({
          variant: "full",
          count: 4,
          isSecondPath: true,
          line: { pool: "nolan-path-full", index: 0 },
          trail: CORNER_TRAIL,
        }),
      ).toBe(highlighted(4));
    });
  });

  it("reads a count above 4 as 4 and below 0 as 0", () => {
    expect(describeCard({ count: 7 as 4 })).toBe(highlighted(4));
    expect(describeCard({ count: -1 as 2 })).toBe(highlighted(0));
    expect(describeCard({ count: 7 as 4, trail: CENTRE_TRAIL })).toBe(
      nearTheCentre(4),
    );
  });

  it("reads a count that is not a number as 0", () => {
    expect(describeCard({ count: Number.NaN as 2 })).toBe(highlighted(0));
    expect(describeCard({ count: undefined as unknown as 2 })).toBe(
      highlighted(0),
    );
  });

  it("names no quadrant and gives no coordinate", () => {
    const descriptions = [
      describeCard(),
      describeCard({ trail: EXTREME_TRAIL, count: 3 }),
      describeCard({ trail: CENTRE_TRAIL }),
    ];

    for (const description of descriptions) {
      // The count and the four are the only numbers.
      expect(description.match(/-?\d+(?:[.,]\d+)?/g)).toHaveLength(2);
      expect(description).not.toMatch(
        /lew|praw|gór|doln|czerwon|niebiesk|zielon|fiolet|umiarkowan|skrajn/i,
      );
    }
  });

  it("does not throw for a trail it cannot stand on", () => {
    expect(describeCard({ trail: [] })).toBe(nearTheCentre(2));
    expect(describeCard({ trail: undefined as unknown as never[] })).toBe(
      nearTheCentre(2),
    );
  });

  describe("given the app is in English", () => {
    it("says the same in English", () => {
      act(() => {
        i18n.load("en", enMessages);
        i18n.activate("en");
      });

      expect(describeCard({ count: 3 })).toBe(
        "Compass: the route has passed through 3 of 4 quadrants. Your position is now in the highlighted quadrant.",
      );
      expect(describeCard({ trail: CENTRE_TRAIL })).toBe(
        "Compass: the route has passed through 2 of 4 quadrants. Your position is now near the centre.",
      );
    });
  });
});
