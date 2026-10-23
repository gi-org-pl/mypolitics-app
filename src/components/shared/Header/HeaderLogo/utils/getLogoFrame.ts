import { LOGO_REST_PIECES, LOGO_ROWS } from "../HeaderLogo.constants";
import type { LogoPiece } from "../HeaderLogo.types";
import { getLogoPiecePath } from "./getLogoPiecePath";
import { getLogoRowState } from "./getLogoRowState";

// The pieces of the sign a given time after the animation started, in the
// order and with the identifiers they have at rest.
export const getLogoFrame = (elapsedMs: number): LogoPiece[] =>
  LOGO_REST_PIECES.map(({ id, row, side }) => {
    const { gapStart, family } = getLogoRowState(row, elapsedMs);
    const { top, fillClassNames } = LOGO_ROWS[row];

    return {
      id,
      d: getLogoPiecePath({ side, top, gapStart }),
      fillClassName: fillClassNames[family][side],
    };
  });
