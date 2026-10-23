import { describe, expect, it } from "vitest";

import {
  LOGO_ANIMATION_MS,
  LOGO_BEATS,
  LOGO_REST_PIECES,
  LOGO_ROWS,
} from "../HeaderLogo.constants";
import { getLogoFrame } from "./getLogoFrame";

const SAMPLE_STEP_MS = 10;

const getSampleTimes = () =>
  Array.from(
    { length: Math.ceil(LOGO_ANIMATION_MS / SAMPLE_STEP_MS) + 1 },
    (_, index) => index * SAMPLE_STEP_MS,
  );

describe("getLogoFrame()", () => {
  describe("given the start and the end of the animation", () => {
    it.each([
      0,
      LOGO_ANIMATION_MS,
    ])("is the logo at rest, path for path, at %i ms", (elapsedMs) => {
      expect(getLogoFrame(elapsedMs)).toEqual(
        LOGO_REST_PIECES.map(({ id, d, fillClassName }) => ({
          id,
          d,
          fillClassName,
        })),
      );
    });
  });

  describe("given the end of the first beat", () => {
    it("has every piece in its quiz colour, away from where it rests", () => {
      const [beat] = LOGO_BEATS;
      const frame = getLogoFrame(beat.startMs + beat.durationMs + 200);

      for (const [index, piece] of frame.entries()) {
        const { row, side, d } = LOGO_REST_PIECES[index];

        expect(piece.fillClassName).toBe(
          LOGO_ROWS[row].fillClassNames.quiz[side],
        );
        expect(piece.d).not.toBe(d);
      }
    });
  });

  describe("given any moment of the animation", () => {
    it("fills every piece with one of its two colours, never anything between", () => {
      for (const elapsedMs of getSampleTimes()) {
        for (const [index, piece] of getLogoFrame(elapsedMs).entries()) {
          const { row, side, id } = LOGO_REST_PIECES[index];
          const { quiz, blue } = LOGO_ROWS[row].fillClassNames;

          expect(piece.id).toBe(id);
          expect([quiz[side], blue[side]]).toContain(piece.fillClassName);
        }
      }
    });
  });
});
