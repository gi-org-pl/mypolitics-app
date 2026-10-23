import {
  LOGO_BAR_HEIGHT,
  LOGO_BAR_LENGTH,
  LOGO_CORNER_KAPPA,
  LOGO_GAP_WIDTH,
  LOGO_INNER_RADIUS,
  LOGO_OUTER_RADIUS,
  LOGO_PATH_PRECISION,
} from "../HeaderLogo.constants";
import type { LogoPieceGeometry } from "../HeaderLogo.types";

// The outline of one piece of a bar, written the way the brand file writes
// it: from the top of the left end, clockwise, a cubic curve per corner. The
// axis runs from the start of the bar to the gap and the position from the
// gap to the end. The ends of the bar are rounded with the outer radius and
// the edges along the gap with the inner one, so a piece at the place it
// has at rest is the file's outline, character for character.
export const getLogoPiecePath = ({
  side,
  top,
  gapStart,
}: LogoPieceGeometry): string => {
  const isAxis = side === "axis";
  const left = isAxis ? 0 : gapStart + LOGO_GAP_WIDTH;
  const right = isAxis ? gapStart : LOGO_BAR_LENGTH;
  const leftRadius = isAxis ? LOGO_OUTER_RADIUS : LOGO_INNER_RADIUS;
  const rightRadius = isAxis ? LOGO_INNER_RADIUS : LOGO_OUTER_RADIUS;
  const leftHandle = leftRadius * (1 - LOGO_CORNER_KAPPA);
  const rightHandle = rightRadius * (1 - LOGO_CORNER_KAPPA);
  const bottom = top + LOGO_BAR_HEIGHT;

  const commands: [string, ...number[]][] = [
    ["M", left, top + leftRadius],
    [
      "C",
      left,
      top + leftHandle,
      left + leftHandle,
      top,
      left + leftRadius,
      top,
    ],
    ["H", right - rightRadius],
    [
      "C",
      right - rightHandle,
      top,
      right,
      top + rightHandle,
      right,
      top + rightRadius,
    ],
    ["V", bottom - rightRadius],
    [
      "C",
      right,
      bottom - rightHandle,
      right - rightHandle,
      bottom,
      right - rightRadius,
      bottom,
    ],
    ["H", left + leftRadius],
    [
      "C",
      left + leftHandle,
      bottom,
      left,
      bottom - leftHandle,
      left,
      bottom - leftRadius,
    ],
    ["V", top + leftRadius],
  ];

  return `${commands
    .map(
      ([command, ...values]) =>
        command +
        values
          .map((value) =>
            String(Number(value.toPrecision(LOGO_PATH_PRECISION))),
          )
          .join(" "),
    )
    .join("")}Z`;
};
