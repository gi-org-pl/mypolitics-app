import { describe, expect, it } from "vitest";

import {
  LOGO_ANIMATION_MS,
  LOGO_BEATS,
  LOGO_ROW_DELAY_MS,
  LOGO_ROWS,
} from "../HeaderLogo.constants";
import { getLogoRowState } from "./getLogoRowState";

const [firstBeat, secondBeat, lastBeat] = LOGO_BEATS;

describe("getLogoRowState()", () => {
  describe("given the start of the animation", () => {
    it.each(
      LOGO_ROWS.map((row, index) => [index, row.gapAtRest]),
    )("has row %i at rest, in the blue family", (rowIndex, gapAtRest) => {
      expect(getLogoRowState(rowIndex, 0)).toEqual({
        gapStart: gapAtRest,
        family: "blue",
      });
    });
  });

  describe("given the end of the animation", () => {
    it.each(
      LOGO_ROWS.map((row, index) => [index, row.gapAtRest]),
    )("has row %i back at rest, in the blue family", (rowIndex, gapAtRest) => {
      expect(getLogoRowState(rowIndex, LOGO_ANIMATION_MS)).toEqual({
        gapStart: gapAtRest,
        family: "blue",
      });
    });
  });

  describe("given the end of the first beat", () => {
    it("has the gap at the beat's place, in the quiz family", () => {
      expect(
        getLogoRowState(0, firstBeat.startMs + firstBeat.durationMs),
      ).toEqual({ gapStart: firstBeat.gapByRow[0], family: "quiz" });
    });
  });

  describe("given a moment just before and just after the middle of a beat", () => {
    it("switches the colour family in one step, halfway", () => {
      const middle = firstBeat.startMs + firstBeat.durationMs / 2;

      expect(getLogoRowState(0, middle - 1).family).toBe("blue");
      expect(getLogoRowState(0, middle).family).toBe("quiz");
    });

    it("has the gap halfway between the two places at the middle", () => {
      const middle = secondBeat.startMs + secondBeat.durationMs / 2;
      const from = firstBeat.gapByRow[1];
      const to = secondBeat.gapByRow[1];

      expect(
        getLogoRowState(1, middle + LOGO_ROW_DELAY_MS).gapStart,
      ).toBeCloseTo((from + to) / 2);
    });
  });

  describe("given a lower row", () => {
    it("plays the same beats a row delay later", () => {
      const moment = lastBeat.startMs + lastBeat.durationMs / 4;

      expect(getLogoRowState(2, moment + 2 * LOGO_ROW_DELAY_MS)).toEqual({
        ...getLogoRowState(0, moment),
        gapStart: expect.any(Number),
      });
      expect(getLogoRowState(2, moment).gapStart).toBe(secondBeat.gapByRow[2]);
    });
  });

  describe("given a time before the start", () => {
    it("has the row at rest", () => {
      expect(getLogoRowState(1, -100)).toEqual({
        gapStart: LOGO_ROWS[1].gapAtRest,
        family: "blue",
      });
    });
  });
});
