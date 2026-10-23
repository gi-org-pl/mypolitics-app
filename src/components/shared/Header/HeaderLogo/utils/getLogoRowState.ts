import { easeInOutCubic } from "@/utils/motion/easeInOutCubic";

import {
  LOGO_BEATS,
  LOGO_ROW_DELAY_MS,
  LOGO_ROWS,
} from "../HeaderLogo.constants";
import type { LogoRowState } from "../HeaderLogo.types";

// Where the gap of a bar is, and which colours its pieces have, a given time
// after the animation started. Each bar plays the beats a row delay after the
// bar above it. Within a beat the gap eases from where the beat before left
// it to the beat's place, and the colours change once, halfway - so a piece
// always has one of its two colours and never a blend of them. Before the
// start and after the end the bar is as it is at rest.
export const getLogoRowState = (
  rowIndex: number,
  elapsedMs: number,
): LogoRowState => {
  const row = LOGO_ROWS[rowIndex];
  const rowElapsedMs = elapsedMs - rowIndex * LOGO_ROW_DELAY_MS;

  return LOGO_BEATS.reduce<LogoRowState>(
    (state, beat) => {
      if (rowElapsedMs < beat.startMs) return state;

      const share = (rowElapsedMs - beat.startMs) / beat.durationMs;
      const to = beat.gapByRow[rowIndex];

      return {
        gapStart:
          share >= 1
            ? to
            : state.gapStart + (to - state.gapStart) * easeInOutCubic(share),
        family: share >= 0.5 ? beat.family : state.family,
      };
    },
    { gapStart: row.gapAtRest, family: "blue" },
  );
};
