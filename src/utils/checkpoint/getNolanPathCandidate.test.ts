import { describe, expect, it } from "vitest";

import type {
  CheckpointCard,
  CheckpointTriggerInput,
  RunningCompass,
} from "@/types/checkpoint";
import type { NolanQuadrantKey } from "@/types/results";

import {
  createCompass,
  createCompassPoint,
  createRecord,
  createState,
  createTriggerInput,
  fullPathCard,
  halfwayCard,
  partialPathCard,
} from "./getNextCheckpoint.fixtures";
import { getNolanPathCandidate } from "./getNolanPathCandidate";

// The boundary `done` of a quiz of 60 questions, with a trail that has one
// point per quadrant given, reached at boundaries 1, 2, 3, ...
const toInput = (
  quadrants: NolanQuadrantKey[],
  done = 20,
  cards: CheckpointCard[] = [],
  compass: RunningCompass | null = createCompass(quadrants),
): CheckpointTriggerInput =>
  createTriggerInput({
    state: createState(done, 60, { compass }),
    record: createRecord(cards),
  });

const TWO: NolanQuadrantKey[] = ["topLeft", "topLeft", "topRight"];
const THREE: NolanQuadrantKey[] = [...TWO, "bottomRight"];
const FOUR: NolanQuadrantKey[] = [...THREE, "topRight", "bottomLeft"];

// The partial card as the engine would have shown it after the trail `TWO`.
const shownPartialCard = {
  ...partialPathCard,
  trail: createCompass(TWO).trail,
};

describe("getNolanPathCandidate()", () => {
  it("returns nothing for a quiz without a compass", () => {
    expect(getNolanPathCandidate(toInput([], 20, [], null))).toBeUndefined();
  });

  it("returns nothing with fewer than 2 quadrants visited", () => {
    expect(getNolanPathCandidate(toInput([]))).toBeUndefined();
    expect(
      getNolanPathCandidate(toInput(["topLeft", "topLeft", "topLeft"])),
    ).toBeUndefined();
  });

  it("does not count a quadrant the trail only touched at the centre level", () => {
    const trail = [
      createCompassPoint(1, "topLeft"),
      { ...createCompassPoint(2, "topRight", 0.02), level: "centre" as const },
    ];

    expect(
      getNolanPathCandidate(
        toInput([], 20, [], { trail, quadrantsVisited: ["topLeft"] }),
      ),
    ).toBeUndefined();
  });

  it("returns nothing before 10 questions are done", () => {
    expect(getNolanPathCandidate(toInput(FOUR, 9))).toBeUndefined();
    expect(getNolanPathCandidate(toInput(FOUR, 10))).toBeDefined();
  });

  describe("given 2 or 3 quadrants and no path card shown", () => {
    it("returns the partial version with the count and the whole trail", () => {
      expect(getNolanPathCandidate(toInput(TWO))).toEqual({
        type: "nolan-path",
        boundary: 20,
        variant: "partial",
        count: 2,
        trail: createCompass(TWO).trail,
        isSecondPath: false,
      });
      expect(getNolanPathCandidate(toInput(THREE))).toMatchObject({
        variant: "partial",
        count: 3,
        trail: createCompass(THREE).trail,
        isSecondPath: false,
      });
    });

    it("is not held back by other cards shown", () => {
      expect(
        getNolanPathCandidate(toInput(TWO, 20, [halfwayCard])),
      ).toMatchObject({ variant: "partial", count: 2 });
    });
  });

  describe("given 4 quadrants and no path card shown", () => {
    it("returns the full version with the whole trail", () => {
      expect(getNolanPathCandidate(toInput(FOUR))).toEqual({
        type: "nolan-path",
        boundary: 20,
        variant: "full",
        count: 4,
        trail: createCompass(FOUR).trail,
        isSecondPath: false,
      });
    });
  });

  describe("given 4 quadrants and the partial version shown", () => {
    it("returns the full version as a second path", () => {
      expect(
        getNolanPathCandidate(
          toInput(FOUR, 30, [shownPartialCard, halfwayCard]),
        ),
      ).toMatchObject({
        type: "nolan-path",
        boundary: 30,
        variant: "full",
        count: 4,
        isSecondPath: true,
      });
    });

    it("starts the trail at the point the partial card ended on", () => {
      const { trail } = createCompass(FOUR);
      const candidate = getNolanPathCandidate(
        toInput(FOUR, 30, [shownPartialCard]),
      );

      // The partial card ended on the third point of the trail.
      expect(candidate?.trail).toEqual(trail.slice(2));
      expect(candidate?.trail[0]).toEqual(shownPartialCard.trail.at(-1));
      expect(candidate?.trail.at(-1)).toEqual(trail.at(-1));
    });

    it("returns the whole trail when that point is no longer on the trail", () => {
      // The taker stepped back behind the point and answered differently: the
      // third point of the trail is now somewhere else.
      const steppedBack: NolanQuadrantKey[] = [
        "topLeft",
        "topLeft",
        "bottomLeft",
        "bottomRight",
        "topRight",
      ];
      const candidate = getNolanPathCandidate(
        toInput(steppedBack, 30, [shownPartialCard]),
      );

      expect(candidate).toMatchObject({ variant: "full", isSecondPath: true });
      expect(candidate?.trail).toEqual(createCompass(steppedBack).trail);
    });

    it("returns the whole trail when the partial card holds no trail", () => {
      const candidate = getNolanPathCandidate(
        toInput(FOUR, 30, [{ ...partialPathCard, trail: [] }]),
      );

      expect(candidate).toMatchObject({ variant: "full", isSecondPath: true });
      expect(candidate?.trail).toEqual(createCompass(FOUR).trail);
    });
  });

  describe("given 3 quadrants and the partial version shown at 2", () => {
    it("returns nothing", () => {
      expect(
        getNolanPathCandidate(toInput(THREE, 30, [shownPartialCard])),
      ).toBeUndefined();
      expect(
        getNolanPathCandidate(toInput(TWO, 30, [shownPartialCard])),
      ).toBeUndefined();
    });
  });

  describe("given the full version shown", () => {
    it("returns nothing", () => {
      expect(
        getNolanPathCandidate(toInput(FOUR, 50, [fullPathCard])),
      ).toBeUndefined();
      expect(
        getNolanPathCandidate(
          toInput(FOUR, 50, [shownPartialCard, fullPathCard]),
        ),
      ).toBeUndefined();
      // The taker stepped back to three quadrants: the partial version is
      // never shown after the full one.
      expect(
        getNolanPathCandidate(toInput(THREE, 50, [fullPathCard])),
      ).toBeUndefined();
    });
  });

  describe("given a state that claims more quadrants than a compass has", () => {
    it("returns nothing", () => {
      const compass: RunningCompass = {
        ...createCompass(FOUR),
        quadrantsVisited: [
          "topLeft",
          "topRight",
          "bottomRight",
          "bottomLeft",
          "topLeft",
        ],
      };

      expect(
        getNolanPathCandidate(toInput([], 20, [], compass)),
      ).toBeUndefined();
    });
  });
});
